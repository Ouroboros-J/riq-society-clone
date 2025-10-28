import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Trash2 } from "lucide-react";

export function AISettingsTab() {
  // 모델 목록
  const { data: aiSettings, refetch: refetchAiSettings } = trpc.aiSettings.list.useQuery();
  const { data: validation } = trpc.aiSettings.validate.useQuery();
  const { data: autopilotSetting } = trpc.systemSettings.get.useQuery({ key: 'autopilot_enabled' });
  
  // 모달 상태
  const [addModelDialogOpen, setAddModelDialogOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: 플랫폼 선택, 2: 모델 선택, 3: 역할 선택
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<'verifier' | 'summarizer'>('verifier');
  
  // OpenRouter 데이터
  const { data: providers, isLoading: providersLoading } = trpc.aiSettings.getOpenRouterProviders.useQuery();
  const { data: models, isLoading: modelsLoading } = trpc.aiSettings.getOpenRouterModelsByProvider.useQuery(
    { provider: selectedProvider },
    { enabled: !!selectedProvider }
  );
  
  // 오토 파일럿
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);
  
  useEffect(() => {
    if (autopilotSetting) {
      setAutopilotEnabled(autopilotSetting.value === '1');
    }
  }, [autopilotSetting]);
  
  // Mutations
  const addAiSettingMutation = trpc.aiSettings.add.useMutation({
    onSuccess: async () => {
      await refetchAiSettings();
      toast.success('AI 모델이 추가되었습니다.');
      setAddModelDialogOpen(false);
      resetModal();
    },
    onError: (error) => {
      toast.error('AI 모델 추가 실패: ' + error.message);
    },
  });
  
  const updateAiSettingMutation = trpc.aiSettings.update.useMutation({
    onSuccess: async () => {
      await refetchAiSettings();
      toast.success('AI 모델이 업데이트되었습니다.');
    },
    onError: (error) => {
      toast.error('AI 모델 업데이트 실패: ' + error.message);
    },
  });
  
  const deleteAiSettingMutation = trpc.aiSettings.delete.useMutation({
    onSuccess: async () => {
      await refetchAiSettings();
      toast.success('AI 모델이 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error('AI 모델 삭제 실패: ' + error.message);
    },
  });
  
  const setSystemSettingMutation = trpc.systemSettings.set.useMutation({
    onSuccess: () => {
      toast.success('설정이 저장되었습니다.');
    },
    onError: (error) => {
      toast.error('설정 저장 실패: ' + error.message);
    },
  });
  
  const resetModal = () => {
    setStep(1);
    setSelectedProvider('');
    setSelectedModel(null);
    setSelectedRole('verifier');
  };
  
  const handleAddModel = () => {
    if (!selectedModel || !selectedRole) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }
    
    addAiSettingMutation.mutate({
      provider: selectedProvider,
      modelId: selectedModel.id,
      modelName: selectedModel.name,
      role: selectedRole,
      isEnabled: 1,
    });
  };
  
  const handleToggleEnabled = (id: number, currentEnabled: number) => {
    updateAiSettingMutation.mutate({
      id,
      isEnabled: currentEnabled === 1 ? 0 : 1,
    });
  };
  
  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteAiSettingMutation.mutate({ id });
    }
  };
  
  const handleToggleAutopilot = (checked: boolean) => {
    if (!validation?.valid && checked) {
      toast.error(validation?.error || 'AI 설정이 올바르지 않습니다.');
      return;
    }
    
    setAutopilotEnabled(checked);
    setSystemSettingMutation.mutate({
      key: 'autopilot_enabled',
      value: checked ? '1' : '0',
    });
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI 모델 설정 (OpenRouter)</CardTitle>
              <CardDescription className="mt-2">
                OpenRouter를 통해 다양한 AI 모델을 사용하여 입회 신청 서류를 자동 검증합니다.
                <br />
                <strong>검증 규칙:</strong> 최소 2개 Verifier (서로 다른 provider) + 정확히 1개 Summarizer
              </CardDescription>
            </div>
            <Button onClick={() => setAddModelDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              모델 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 검증 상태 */}
          {validation && (
            <div className={`p-4 rounded-lg ${validation.valid ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <p className={`text-sm font-medium ${validation.valid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                {validation.valid ? '✅ AI 설정이 올바릅니다.' : `❌ ${validation.error}`}
              </p>
            </div>
          )}
          
          {/* 모델 목록 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">추가된 모델</h3>
            {aiSettings && aiSettings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aiSettings.map((setting: any) => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-medium">{setting.provider}</TableCell>
                      <TableCell>{setting.modelName}</TableCell>
                      <TableCell>
                        <Badge variant={setting.role === 'verifier' ? 'default' : 'secondary'}>
                          {setting.role === 'verifier' ? 'Verifier' : 'Summarizer'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={setting.isEnabled === 1}
                          onCheckedChange={() => handleToggleEnabled(setting.id, setting.isEnabled)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(setting.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">추가된 모델이 없습니다.</p>
            )}
          </div>
          
          {/* 오토 파일럿 모드 */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">오토 파일럿 모드</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  모든 Verifier AI가 일치하는 결과를 내면 Summarizer가 최종 메시지를 생성하여 자동으로 승인/거부합니다.
                </p>
                <p className="text-sm mt-2">
                  <Badge variant={validation?.valid ? "default" : "destructive"}>
                    {validation?.valid ? '설정 완료' : '설정 필요'}
                  </Badge>
                </p>
              </div>
              <Checkbox
                id="autopilot-enabled"
                checked={autopilotEnabled}
                disabled={!validation?.valid}
                onCheckedChange={handleToggleAutopilot}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 모델 추가 모달 */}
      <Dialog open={addModelDialogOpen} onOpenChange={(open) => {
        setAddModelDialogOpen(open);
        if (!open) resetModal();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI 모델 추가</DialogTitle>
            <DialogDescription>
              Step {step}/3: {step === 1 ? 'Provider 선택' : step === 2 ? 'Model 선택' : 'Role 선택'}
            </DialogDescription>
          </DialogHeader>
          
          {step === 1 && (
            <div className="space-y-4">
              <Label>Provider 선택</Label>
              {providersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Provider를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers?.map((provider: string) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <Label>Model 선택 ({selectedProvider})</Label>
              {modelsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {models?.map((model: any) => (
                    <div
                      key={model.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-accent ${
                        selectedModel?.id === model.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedModel(model)}
                    >
                      <div className="font-medium">{model.name}</div>
                      <div className="text-sm text-muted-foreground">{model.id}</div>
                      {model.description && (
                        <div className="text-xs text-muted-foreground mt-1">{model.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <Label>Role 선택</Label>
              <Select value={selectedRole} onValueChange={(value: 'verifier' | 'summarizer') => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verifier">
                    Verifier (검증자) - 서류를 엄격하게 검증
                  </SelectItem>
                  <SelectItem value="summarizer">
                    Summarizer (종합자) - 검증 결과를 종합하여 사용자 친화적 메시지 생성
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {selectedModel && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">선택한 모델:</p>
                  <p className="text-sm text-muted-foreground">{selectedModel.name} ({selectedModel.id})</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                이전
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={
                (step === 1 && !selectedProvider) ||
                (step === 2 && !selectedModel)
              }>
                다음
              </Button>
            ) : (
              <Button onClick={handleAddModel} disabled={addAiSettingMutation.isPending}>
                {addAiSettingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    추가 중...
                  </>
                ) : (
                  '추가'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

