import { useAuth } from "@/_core/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import Header from "../components/Header";
import { AIVerificationResults } from "../components/AIVerificationResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectApplicationId, setRejectApplicationId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  // 필리터링 및 검색
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 일괄 처리
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  
  // 상세 보기 모달
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [aiVerificationDialogOpen, setAiVerificationDialogOpen] = useState(false);
  
  // AI 검증 진행 상태 (WebSocket)
  const { progress: wsProgress, isConnected: wsConnected } = useWebSocket(
    aiVerificationDialogOpen ? selectedApplication?.id : undefined
  );
  const [isVerifying, setIsVerifying] = useState(false);
  
  // 이메일 템플릿 편집
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  
  // FAQ 관리
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('');
  const [faqDisplayOrder, setFaqDisplayOrder] = useState(0);
  
  // 블로그 관리
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogThumbnailUrl, setBlogThumbnailUrl] = useState('');
  const [blogCategory, setBlogCategory] = useState('');
  
  // 리소스 관리
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceFileUrl, setResourceFileUrl] = useState('');
  const [resourceFileName, setResourceFileName] = useState('');
  const [resourceFileType, setResourceFileType] = useState('');
  const [resourceFileSize, setResourceFileSize] = useState<number | undefined>(undefined);
  const [resourceCategory, setResourceCategory] = useState('');
  
  // AI 설정 - 각 플랫폼별 상태 관리
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');
  const [openaiModel, setOpenaiModel] = useState<string>('');
  const [openaiEnabled, setOpenaiEnabled] = useState<boolean>(false);
  const [openaiModels, setOpenaiModels] = useState<Array<{id: string, name: string, description?: string}>>([]);
  const [openaiModelsLoading, setOpenaiModelsLoading] = useState(false);
  
  const [anthropicApiKey, setAnthropicApiKey] = useState<string>('');
  const [anthropicModel, setAnthropicModel] = useState<string>('');
  const [anthropicEnabled, setAnthropicEnabled] = useState<boolean>(false);
  const [anthropicModels, setAnthropicModels] = useState<Array<{id: string, name: string, description?: string}>>([]);
  const [anthropicModelsLoading, setAnthropicModelsLoading] = useState(false);
  
  const [googleApiKey, setGoogleApiKey] = useState<string>('');
  const [googleModel, setGoogleModel] = useState<string>('');
  const [googleEnabled, setGoogleEnabled] = useState<boolean>(false);
  const [googleModels, setGoogleModels] = useState<Array<{id: string, name: string, description?: string}>>([]);
  const [googleModelsLoading, setGoogleModelsLoading] = useState(false);  const [perplexityApiKey, setPerplexityApiKey] = useState<string>('');
  const [perplexityModel, setPerplexityModel] = useState<string>('');
  const [perplexityEnabled, setPerplexityEnabled] = useState<boolean>(false);
  const [perplexityModels, setPerplexityModels] = useState<Array<{id: string, name: string, description?: string}>>([]);
  const [perplexityModelsLoading, setPerplexityModelsLoading] = useState(false);
  
  // API 키 검증 상태
  const [openaiKeyValidation, setOpenaiKeyValidation] = useState<{validating: boolean, valid: boolean | null, error: string | null}>({validating: false, valid: null, error: null});
  const [anthropicKeyValidation, setAnthropicKeyValidation] = useState<{validating: boolean, valid: boolean | null, error: string | null}>({validating: false, valid: null, error: null});
  const [googleKeyValidation, setGoogleKeyValidation] = useState<{validating: boolean, valid: boolean | null, error: string | null}>({validating: false, valid: null, error: null});
  const [perplexityKeyValidation, setPerplexityKeyValidation] = useState<{validating: boolean, valid: boolean | null, error: string | null}>({validating: false, valid: null, error: null});
  
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);
  
  // 통계 날짜 범위
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');


  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.listUsers.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: pendingPayments, isLoading: paymentsLoading, refetch: refetchPayments } = trpc.admin.listPendingPayments.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: applications, isLoading: applicationsLoading, refetch: refetchApplications } = trpc.admin.listApplications.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const { data: aiAccuracyStats, isLoading: aiAccuracyLoading } = trpc.aiVerification.getAccuracyStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: overallAccuracy, isLoading: overallAccuracyLoading } = trpc.aiVerification.getOverallAccuracy.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const { data: emailTemplates, isLoading: templatesLoading, refetch: refetchTemplates } = trpc.admin.listEmailTemplates.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const { data: faqs, isLoading: faqsLoading, refetch: refetchFaqs } = trpc.faq.listAdmin.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const { data: pendingReviews, isLoading: reviewsLoading, refetch: refetchReviews } = trpc.applicationReview.listPending.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const { data: enabledAiCount } = trpc.aiSettings.countEnabled.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const createFaqMutation = trpc.faq.create.useMutation({
    onSuccess: () => {
      refetchFaqs();
      setFaqDialogOpen(false);
      setFaqQuestion('');
      setFaqAnswer('');
      setFaqCategory('');
      setFaqDisplayOrder(0);
      toast.success('FAQ가 생성되었습니다.');
    },
  });
  
  const updateFaqMutation = trpc.faq.update.useMutation({
    onSuccess: () => {
      refetchFaqs();
      setFaqDialogOpen(false);
      setEditingFaq(null);
      toast.success('FAQ가 수정되었습니다.');
    },
  });
  
  const updateReviewStatusMutation = trpc.applicationReview.updateStatus.useMutation({
    onSuccess: () => {
      refetchReviews();
      refetchApplications();
      toast.success('재검토 처리가 완료되었습니다.');
    },
    onError: (error) => {
      toast.error('재검토 처리에 실패했습니다: ' + error.message);
    },
  });
  
  const deleteFaqMutation = trpc.faq.delete.useMutation({
    onSuccess: () => {
      refetchFaqs();
      toast.success('FAQ가 삭제되었습니다.');
    },
  });
  
  const { data: blogs, isLoading: blogsLoading, refetch: refetchBlogs } = trpc.blog.listAdmin.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const createBlogMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      refetchBlogs();
      setBlogDialogOpen(false);
      setBlogTitle('');
      setBlogSlug('');
      setBlogContent('');
      setBlogExcerpt('');
      setBlogThumbnailUrl('');
      setBlogCategory('');
      toast.success('블로그가 생성되었습니다.');
    },
  });
  
  const updateBlogMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      refetchBlogs();
      setBlogDialogOpen(false);
      setEditingBlog(null);
      toast.success('블로그가 수정되었습니다.');
    },
  });
  
  const deleteBlogMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      refetchBlogs();
      toast.success('블로그가 삭제되었습니다.');
    },
  });
  
  const { data: resources, isLoading: resourcesLoading, refetch: refetchResources } = trpc.resource.listAdmin.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const { data: aiSettings, isLoading: aiSettingsLoading, refetch: refetchAiSettings } = trpc.aiSettings.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const { data: posthogStats, isLoading: posthogStatsLoading } = trpc.admin.getPostHogStats.useQuery(
    { startDate, endDate },
    {
      enabled: isAuthenticated && user?.role === 'admin',
      refetchOnMount: true,
    }
  );

  // 활성화된 고유 AI 플랫폼 개수 계산
  const enabledPlatforms = new Set(
    aiSettings?.filter((setting: any) => setting.isEnabled === 1).map((setting: any) => setting.platform) || []
  );
  const enabledPlatformCount = enabledPlatforms.size;
  const canEnableAutopilot = enabledPlatformCount >= 2;
  
  const upsertAiSettingMutation = trpc.aiSettings.upsert.useMutation({
    onSuccess: async () => {
      await refetchAiSettings();
      
      // AI 설정 변경 후 활성화된 플랫폼 개수 확인
      const updatedSettings = await refetchAiSettings();
      const updatedEnabledPlatforms = new Set(
        updatedSettings.data?.filter((setting: any) => setting.isEnabled === 1).map((setting: any) => setting.platform) || []
      );
      
      // 2개 미만이면 오토파일럿 자동 비활성화
      if (updatedEnabledPlatforms.size < 2 && autopilotEnabled) {
        setAutopilotEnabled(false);
        await setSystemSettingMutation.mutateAsync({
          key: 'autopilot_enabled',
          value: '0',
        });
        toast.warning('활성화된 AI 플랫폼이 2개 미만이므로 오토 파일럿 모드가 비활성화되었습니다.');
      }
      
      toast.success('AI 설정이 저장되었습니다.');
    },
    onError: (error) => {
      toast.error('AI 설정 저장 실패: ' + error.message);
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
  
  const createResourceMutation = trpc.resource.create.useMutation({
    onSuccess: () => {
      refetchResources();
      setResourceDialogOpen(false);
      setResourceTitle('');
      setResourceDescription('');
      setResourceFileUrl('');
      setResourceFileName('');
      setResourceFileType('');
      setResourceFileSize(undefined);
      setResourceCategory('');
      toast.success('리소스가 생성되었습니다.');
    },
  });
  
  const updateResourceMutation = trpc.resource.update.useMutation({
    onSuccess: () => {
      refetchResources();
      setResourceDialogOpen(false);
      setEditingResource(null);
      toast.success('리소스가 수정되었습니다.');
    },
  });
  
  const deleteResourceMutation = trpc.resource.delete.useMutation({
    onSuccess: () => {
      refetchResources();
      toast.success('리소스가 삭제되었습니다.');
    },
  });
  
  // 필터링된 신청 목록
  const filteredApplications = (applications || []).filter((app: any) => {
    // 상태 필터
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    // 결제 상태 필터
    if (paymentFilter !== 'all' && app.paymentStatus !== paymentFilter) return false;
    // 검색
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        app.fullName?.toLowerCase().includes(query) ||
        app.email?.toLowerCase().includes(query) ||
        app.testType?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const updateEmailTemplateMutation = trpc.admin.updateEmailTemplate.useMutation({
    onSuccess: () => {
      toast.success("이메일 템플릿이 업데이트되었습니다.");
      refetchTemplates();
      setTemplateDialogOpen(false);
    },
    onError: () => {
      toast.error("업데이트에 실패했습니다.");
    },
  });

  const confirmPaymentMutation = trpc.admin.confirmPayment.useMutation({
    onSuccess: () => {
      toast.success("입금이 확인되었습니다.");
      refetchPayments();
      refetchUsers();
    },
    onError: (error) => {
      toast.error("입금 확인 실패: " + error.message);
    },
  });

  const updateUserApprovalMutation = trpc.admin.updateUserApproval.useMutation({
    onSuccess: () => {
      toast.success("회원 상태가 업데이트되었습니다.");
      refetchUsers();
    },
    onError: (error) => {
      toast.error("업데이트 실패: " + error.message);
    },
  });

  const updateApplicationStatusMutation = trpc.admin.updateApplicationStatus.useMutation({
    onSuccess: () => {
      toast.success("신청 상태가 업데이트되었습니다.");
      refetchApplications();
      setRejectDialogOpen(false);
      setRejectApplicationId(null);
      setRejectReason("");
    },
    onError: (error) => {
      toast.error("업데이트 실패: " + error.message);
    },
  });

  const handleReject = () => {
    if (rejectApplicationId) {
      updateApplicationStatusMutation.mutate({
        applicationId: rejectApplicationId,
        status: 'rejected',
        adminNotes: rejectReason.trim() || '관리자가 거부했습니다.'
      });
    } else {
      toast.error("신청을 선택해주세요.");
    }
  };

  const confirmApplicationPaymentMutation = trpc.admin.confirmApplicationPayment.useMutation({
    onSuccess: () => {
      toast.success("입금이 확인되었습니다.");
      refetchApplications();
    },
    onError: (error) => {
      toast.error("입금 확인 실패: " + error.message);
    },
  });

  const verifyWithAIMutation = trpc.application.verifyWithAI.useMutation({
    onSuccess: (data) => {
      setIsVerifying(false);
      if (data.approved) {
        toast.success("AI 검증 완료: 승인됨");
      } else {
        toast.warning(`AI 검증 완료: 거부됨 - ${data.reason}`);
      }
      refetchApplications();
      // AI 검증 결과 모달 자동 열기
      setAiVerificationDialogOpen(true);
    },
    onError: (error) => {
      setIsVerifying(false);
      toast.error("AI 검증 실패: " + error.message);
    },
  });

  // AI 설정 초기화
  useEffect(() => {
    if (aiSettings && aiSettings.length > 0) {
      aiSettings.forEach((setting: any) => {
        if (setting.platform === 'openai') {
          setOpenaiApiKey(setting.apiKey || '');
          setOpenaiModel(setting.selectedModel || '');
          setOpenaiEnabled(setting.isEnabled === 1);
        } else if (setting.platform === 'claude') {
          setAnthropicApiKey(setting.apiKey || '');
          setAnthropicModel(setting.selectedModel || '');
          setAnthropicEnabled(setting.isEnabled === 1);
        } else if (setting.platform === 'gemini') {
          setGoogleApiKey(setting.apiKey || '');
          setGoogleModel(setting.selectedModel || '');
          setGoogleEnabled(setting.isEnabled === 1);
        } else if (setting.platform === 'perplexity') {
          setPerplexityApiKey(setting.apiKey || '');
          setPerplexityModel(setting.selectedModel || '');
          setPerplexityEnabled(setting.isEnabled === 1);
        }
      });
    }
  }, [aiSettings]);

  const utils = trpc.useUtils();

  // 모델 목록 로드 함수
  const loadOpenAIModels = async () => {
    if (!openaiApiKey) {
      toast.error('OpenAI API 키를 먼저 입력하세요.');
      return;
    }
    setOpenaiModelsLoading(true);
    try {
      const models = await utils.client.aiSettings.getAvailableModels.query({ platform: 'openai', apiKey: openaiApiKey });
      setOpenaiModels(models);
      toast.success(`${models.length}개의 OpenAI 모델을 불러왔습니다.`);
    } catch (error: any) {
      toast.error('OpenAI 모델 목록 로드 실패: ' + error.message);
    } finally {
      setOpenaiModelsLoading(false);
    }
  };

  const loadAnthropicModels = async () => {
    if (!anthropicApiKey) {
      toast.error('Claude API 키를 먼저 입력하세요.');
      return;
    }
    setAnthropicModelsLoading(true);
    try {
      const models = await utils.client.aiSettings.getAvailableModels.query({ platform: 'claude', apiKey: anthropicApiKey });
      setAnthropicModels(models);
      toast.success(`${models.length}개의 Claude 모델을 불러왔습니다.`);
    } catch (error: any) {
      toast.error('Claude 모델 목록 로드 실패: ' + error.message);
    } finally {
      setAnthropicModelsLoading(false);
    }
  };

  const loadGoogleModels = async () => {
    if (!googleApiKey) {
      toast.error('Google API 키를 먼저 입력하세요.');
      return;
    }
    setGoogleModelsLoading(true);
    try {
      const models = await utils.client.aiSettings.getAvailableModels.query({ platform: 'gemini', apiKey: googleApiKey });
      setGoogleModels(models);
      toast.success(`${models.length}개의 Gemini 모델을 불러왔습니다.`);
    } catch (error: any) {
      toast.error('Gemini 모델 목록 로드 실패: ' + error.message);
    } finally {
      setGoogleModelsLoading(false);
    }
  };

  const loadPerplexityModels = async () => {
    setPerplexityModelsLoading(true);
    try {
      const models = await utils.client.aiSettings.getAvailableModels.query({ platform: 'perplexity' });
      setPerplexityModels(models);
      toast.success(`${models.length}개의 Perplexity 모델을 불러왔습니다.`);
    } catch (error: any) {
      toast.error('Perplexity 모델 목록 로드 실패: ' + error.message);
    } finally {
      setPerplexityModelsLoading(false);
    }
  };

  // API 키 검증 함수 (서버 API 호출)
  const validateOpenAIKey = async (apiKey: string) => {
    if (!apiKey || apiKey.trim() === '') {
      setOpenaiKeyValidation({validating: false, valid: null, error: null});
      return;
    }
    // 형식 검증
    if (!apiKey.startsWith('sk-') && !apiKey.startsWith('sk-proj-')) {
      setOpenaiKeyValidation({validating: false, valid: false, error: 'API 키는 sk- 또는 sk-proj-로 시작해야 합니다.'});
      return;
    }
    setOpenaiKeyValidation({validating: true, valid: null, error: null});
    try {
      const result = await utils.client.aiSettings.validateKey.query({
        platform: 'openai',
        apiKey: apiKey,
      });
      if (result.valid) {
        setOpenaiKeyValidation({validating: false, valid: true, error: null});
      } else {
        setOpenaiKeyValidation({validating: false, valid: false, error: result.error || 'Invalid API key'});
      }
    } catch (error: any) {
      setOpenaiKeyValidation({validating: false, valid: false, error: error.message});
    }
  };

  const validateAnthropicKey = async (apiKey: string) => {
    if (!apiKey || apiKey.trim() === '') {
      setAnthropicKeyValidation({validating: false, valid: null, error: null});
      return;
    }
    // 형식 검증
    if (!apiKey.startsWith('sk-ant-')) {
      setAnthropicKeyValidation({validating: false, valid: false, error: 'API 키는 sk-ant-로 시작해야 합니다.'});
      return;
    }
    setAnthropicKeyValidation({validating: true, valid: null, error: null});
    try {
      const result = await utils.client.aiSettings.validateKey.query({
        platform: 'anthropic',
        apiKey: apiKey,
      });
      if (result.valid) {
        setAnthropicKeyValidation({validating: false, valid: true, error: null});
      } else {
        setAnthropicKeyValidation({validating: false, valid: false, error: result.error || 'Invalid API key'});
      }
    } catch (error: any) {
      setAnthropicKeyValidation({validating: false, valid: false, error: error.message});
    }
  };

  const validateGoogleKey = async (apiKey: string) => {
    if (!apiKey || apiKey.trim() === '') {
      setGoogleKeyValidation({validating: false, valid: null, error: null});
      return;
    }
    // 형식 검증
    if (!apiKey.startsWith('AIza')) {
      setGoogleKeyValidation({validating: false, valid: false, error: 'API 키는 AIza로 시작해야 합니다.'});
      return;
    }
    setGoogleKeyValidation({validating: true, valid: null, error: null});
    try {
      const result = await utils.client.aiSettings.validateKey.query({
        platform: 'google',
        apiKey: apiKey,
      });
      if (result.valid) {
        setGoogleKeyValidation({validating: false, valid: true, error: null});
      } else {
        setGoogleKeyValidation({validating: false, valid: false, error: result.error || 'Invalid API key'});
      }
    } catch (error: any) {
      setGoogleKeyValidation({validating: false, valid: false, error: error.message});
    }
  };

  const validatePerplexityKey = async (apiKey: string) => {
    if (!apiKey || apiKey.trim() === '') {
      setPerplexityKeyValidation({validating: false, valid: null, error: null});
      return;
    }
    // 형식 검증
    if (!apiKey.startsWith('pplx-')) {
      setPerplexityKeyValidation({validating: false, valid: false, error: 'API 키는 pplx-로 시작해야 합니다.'});
      return;
    }
    setPerplexityKeyValidation({validating: true, valid: null, error: null});
    try {
      const result = await utils.client.aiSettings.validateKey.query({
        platform: 'perplexity',
        apiKey: apiKey,
      });
      if (result.valid) {
        setPerplexityKeyValidation({validating: false, valid: true, error: null});
      } else {
        setPerplexityKeyValidation({validating: false, valid: false, error: result.error || 'Invalid API key'});
      }
    } catch (error: any) {
      setPerplexityKeyValidation({validating: false, valid: false, error: error.message});
    }
  };

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      setLocation("/");
    }
  }, [isAuthenticated, user, loading, setLocation]);

  if (loading || usersLoading || paymentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">관리자 페이지</h1>
          <p className="text-muted-foreground">RIQ Society 회원 관리</p>
        </div>

        <Tabs defaultValue="applications" className="w-full">
          <TabsList>
            <TabsTrigger value="statistics">통계</TabsTrigger>
            <TabsTrigger value="applications">입회 신청 관리</TabsTrigger>
            <TabsTrigger value="users">회원 관리</TabsTrigger>
            <TabsTrigger value="payments">입금 확인</TabsTrigger>
            <TabsTrigger value="email-templates">이메일 템플릿</TabsTrigger>
            <TabsTrigger value="faq">FAQ 관리</TabsTrigger>
            <TabsTrigger value="blog">블로그 관리</TabsTrigger>
            <TabsTrigger value="resources">리소스 관리</TabsTrigger>
            <TabsTrigger value="ai-settings">AI 설정</TabsTrigger>
            <TabsTrigger value="review-requests">재검토 요청</TabsTrigger>
          </TabsList>

          <TabsContent value="statistics">
            {/* 날짜 범위 선택 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>기간 선택</CardTitle>
                <CardDescription>통계 데이터를 볼 기간을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">시작일</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">종료일</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="groupBy">그룹화</Label>
                    <Select value={groupBy} onValueChange={(value: 'day' | 'week' | 'month') => setGroupBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">일별</SelectItem>
                        <SelectItem value="week">주별</SelectItem>
                        <SelectItem value="month">월별</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {false ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">로딩 중...</p>
              </div>
            ) : (
              <>
                {/* 전환율 통계 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>입회 신청 전환율</CardTitle>
                      <CardDescription>회원 가입 대비 입회 신청 비율</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-primary">
                        0%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        회원 가입 후 입회 신청을 제출하는 비율
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>신청 승인율</CardTitle>
                      <CardDescription>입회 신청 대비 승인 비율</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-green-600">
                        0%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        입회 신청 후 승인되는 비율
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* 회원 가입 추이 */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>회원 가입 추이</CardTitle>
                    <CardDescription>
                      {groupBy === 'day' ? '일별' : groupBy === 'week' ? '주별' : '월별'} 회원 가입 현황
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={[]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#8b5cf6" 
                          fill="#8b5cf6" 
                          fillOpacity={0.6}
                          name="가입자 수"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* 입회 신청 추이 */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>입회 신청 추이</CardTitle>
                    <CardDescription>
                      {groupBy === 'day' ? '일별' : groupBy === 'week' ? '주별' : '월별'} 입회 신청 현황
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={[]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.6}
                          name="신청 수"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* 상태별 통계 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>신청 상태별 통계</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[].map((s: any) => ({
                              name: s.status === 'pending' ? '대기중' : s.status === 'approved' ? '승인됨' : '거부됨',
                              value: Number(s.count)
                            })) || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#fbbf24" />
                            <Cell fill="#10b981" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>결제 상태별 통계</CardTitle>
                      <CardDescription>승인된 신청 기준</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={[].map((p: any) => ({
                            name: p.paymentStatus === 'pending' ? '미결제' : 
                                  p.paymentStatus === 'deposit_requested' ? '입금 요청' : '확인 완료',
                            value: Number(p.count)
                          })) || []}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#3b82f6" name="건수" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* PostHog 통계 */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>PostHog 사용자 행동 분석</CardTitle>
                    <CardDescription>실시간 사용자 행동 추적 및 전환율 분석</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {posthogStatsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : posthogStats ? (
                      <div className="space-y-6">
                        {/* 전환율 통계 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium text-muted-foreground">총 방문자 수</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-3xl font-bold">{posthogStats.conversionStats.totalVisitors.toLocaleString()}</div>
                              <p className="text-xs text-muted-foreground mt-1">페이지뷰 기준</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium text-muted-foreground">입회 신청 전환율</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-3xl font-bold text-primary">{posthogStats.conversionStats.applicationConversionRate.toFixed(2)}%</div>
                              <p className="text-xs text-muted-foreground mt-1">방문자 대비 신청 비율</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium text-muted-foreground">결제 전환율</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-3xl font-bold text-green-600">{posthogStats.conversionStats.paymentConversionRate.toFixed(2)}%</div>
                              <p className="text-xs text-muted-foreground mt-1">신청 대비 결제 비율</p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* 이벤트 통계 */}
                        <div>
                          <h4 className="text-lg font-semibold mb-4">주요 이벤트 발생 현황</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">입회 신청 완료</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{posthogStats.eventStats.application_submitted || 0}</div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">결제 요청</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{posthogStats.eventStats.payment_request_submitted || 0}</div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">재검토 요청</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{posthogStats.eventStats.review_request_submitted || 0}</div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        {/* 페이지뷰 통계 */}
                        {Object.keys(posthogStats.pageViewStats).length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold mb-4">페이지별 방문 통계</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>페이지 URL</TableHead>
                                  <TableHead className="text-right">방문 횟수</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.entries(posthogStats.pageViewStats)
                                  .sort(([, a], [, b]) => (b as number) - (a as number))
                                  .slice(0, 10)
                                  .map(([url, count]) => (
                                    <TableRow key={url}>
                                      <TableCell className="font-mono text-sm">{url}</TableCell>
                                      <TableCell className="text-right font-semibold">{count as number}</TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        PostHog 통계 데이터를 불러올 수 없습니다.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI 정확도 통계 */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>AI 검증 시스템 정확도</CardTitle>
                    <CardDescription>AI 검증 결과와 최종 관리자 결정 비교</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aiAccuracyLoading || overallAccuracyLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* 전체 정확도 */}
                        {overallAccuracy && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">전체 정확도</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-3xl font-bold">{overallAccuracy.accuracy.toFixed(2)}%</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  총 {overallAccuracy.totalVerifications}건 검증
                                </p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">오탐률 (False Positive)</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-3xl font-bold text-destructive">{overallAccuracy.falsePositiveRate.toFixed(2)}%</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  AI 승인 → 관리자 거부
                                </p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">미탐률 (False Negative)</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-3xl font-bold text-orange-500">{overallAccuracy.falseNegativeRate.toFixed(2)}%</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  AI 거부 → 관리자 승인
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* 플랫폼별 정확도 */}
                        {aiAccuracyStats && aiAccuracyStats.length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold mb-4">플랫폼별 정확도</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>플랫폼</TableHead>
                                  <TableHead className="text-right">검증 건수</TableHead>
                                  <TableHead className="text-right">정확도</TableHead>
                                  <TableHead className="text-right">정밀도 (Precision)</TableHead>
                                  <TableHead className="text-right">재현률 (Recall)</TableHead>
                                  <TableHead className="text-right">TP</TableHead>
                                  <TableHead className="text-right">TN</TableHead>
                                  <TableHead className="text-right">FP</TableHead>
                                  <TableHead className="text-right">FN</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {aiAccuracyStats.map((stat: any) => (
                                  <TableRow key={stat.platform}>
                                    <TableCell className="font-medium">{stat.platform.toUpperCase()}</TableCell>
                                    <TableCell className="text-right">{stat.totalVerifications}</TableCell>
                                    <TableCell className="text-right">
                                      <Badge variant={stat.accuracy >= 90 ? 'default' : stat.accuracy >= 70 ? 'secondary' : 'destructive'}>
                                        {stat.accuracy.toFixed(2)}%
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{stat.precision.toFixed(2)}%</TableCell>
                                    <TableCell className="text-right">{stat.recall.toFixed(2)}%</TableCell>
                                    <TableCell className="text-right">{stat.truePositive}</TableCell>
                                    <TableCell className="text-right">{stat.trueNegative}</TableCell>
                                    <TableCell className="text-right text-destructive">{stat.falsePositive}</TableCell>
                                    <TableCell className="text-right text-orange-500">{stat.falseNegative}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}

                        {(!aiAccuracyStats || aiAccuracyStats.length === 0) && (
                          <div className="text-center py-8 text-muted-foreground">
                            아직 AI 검증 데이터가 충분하지 않습니다.
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="applications">
            {/* 통계 차트 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>상태별 신청 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: '대기중', value: applications?.filter((a: any) => a.status === 'pending').length || 0 },
                          { name: '승인됨', value: applications?.filter((a: any) => a.status === 'approved').length || 0 },
                          { name: '거부됨', value: applications?.filter((a: any) => a.status === 'rejected').length || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#fbbf24" />
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>결제 상태 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: '미결제', value: applications?.filter((a: any) => a.paymentStatus === 'pending').length || 0 },
                        { name: '입금 요청', value: applications?.filter((a: any) => a.paymentStatus === 'deposit_requested').length || 0 },
                        { name: '확인 완료', value: applications?.filter((a: any) => a.paymentStatus === 'confirmed').length || 0 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>입회 신청 목록</CardTitle>
                <CardDescription>
                  전체 {applications?.length || 0}건 / 필터링 {filteredApplications.length}건
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* 필터링 및 검색 */}
                <div className="mb-4 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">검색</Label>
                    <Input
                      id="search"
                      placeholder="이름, 이메일, 시험 종류로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <Label htmlFor="statusFilter">신청 상태</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="statusFilter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="pending">대기중</SelectItem>
                        <SelectItem value="approved">승인됨</SelectItem>
                        <SelectItem value="rejected">거부됨</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full md:w-48">
                    <Label htmlFor="paymentFilter">결제 상태</Label>
                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                      <SelectTrigger id="paymentFilter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="pending">미결제</SelectItem>
                        <SelectItem value="deposit_requested">입금 요청</SelectItem>
                        <SelectItem value="confirmed">확인 완료</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 일괄 처리 버튼 */}
                {selectedApplications.length > 0 && (
                  <div className="mb-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        selectedApplications.forEach(id => {
                          updateApplicationStatusMutation.mutate({
                            applicationId: id,
                            status: 'approved'
                          });
                        });
                        setSelectedApplications([]);
                      }}
                    >
                      선택항목 일괄 승인 ({selectedApplications.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`${selectedApplications.length}건의 신청을 거부하시겠습니까?`)) {
                          selectedApplications.forEach(id => {
                            updateApplicationStatusMutation.mutate({
                              applicationId: id,
                              status: 'rejected',
                              adminNotes: '일괄 거부 처리'
                            });
                          });
                          setSelectedApplications([]);
                        }
                      }}
                    >
                      선택항목 일괄 거부 ({selectedApplications.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedApplications([])}
                    >
                      선택 해제
                    </Button>
                  </div>
                )}

                {applicationsLoading ? (
                  <p>로딩 중...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedApplications(filteredApplications.map((a: any) => a.id));
                              } else {
                                setSelectedApplications([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>이름</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>시험 종류</TableHead>
                        <TableHead>점수</TableHead>
                        <TableHead>신청 상태</TableHead>
                        <TableHead>AI 검증</TableHead>
                        <TableHead>결제 상태</TableHead>
                        <TableHead>신청일</TableHead>
                        <TableHead>관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app: any) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedApplications.includes(app.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedApplications([...selectedApplications, app.id]);
                                } else {
                                  setSelectedApplications(selectedApplications.filter(id => id !== app.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>{app.id}</TableCell>
                          <TableCell>{app.fullName}</TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>{app.testType}</TableCell>
                          <TableCell>{app.testScore}</TableCell>
                          <TableCell>
                            <Badge variant={
                              app.status === 'approved' ? 'default' :
                              app.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }>
                              {app.status === 'approved' ? '승인됨' :
                               app.status === 'rejected' ? '거부됨' :
                               '대기중'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {app.isOtherTest === 1 ? (
                              <Badge variant="outline">수동 검토</Badge>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedApplication(app);
                                    setAiVerificationDialogOpen(true);
                                  }}
                                >
                                  결과 보기
                                </Button>
                                {app.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedApplication(app);
                                      setIsVerifying(true);
                                      verifyWithAIMutation.mutate({ applicationId: app.id });
                                    }}
                                    disabled={isVerifying || !enabledAiCount || enabledAiCount < 2}
                                    title={(enabledAiCount !== undefined && enabledAiCount < 2) ? '최소 2개 이상의 AI 모델이 활성화되어야 합니다.' : ''}
                                  >
                                    {isVerifying ? 'AI 검증 중...' : 'AI 검증 실행'}
                                  </Button>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              app.paymentStatus === 'confirmed' ? 'default' :
                              app.paymentStatus === 'deposit_requested' ? 'secondary' :
                              'outline'
                            }>
                              {app.paymentStatus === 'confirmed' ? '확인됨' :
                               app.paymentStatus === 'deposit_requested' ? '입금 요청' :
                               '대기중'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(app.createdAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setDetailDialogOpen(true);
                                }}
                              >
                                상세
                              </Button>
                              {app.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => updateApplicationStatusMutation.mutate({
                                      applicationId: app.id,
                                      status: 'approved'
                                    })}
                                  >
                                    승인
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setRejectApplicationId(app.id);
                                      setRejectDialogOpen(true);
                                    }}
                                  >
                                    거부
                                  </Button>
                                </>
                              )}
                              {app.status === 'approved' && app.paymentStatus === 'deposit_requested' && (
                                <Button
                                  size="sm"
                                  onClick={() => confirmApplicationPaymentMutation.mutate({
                                    applicationId: app.id
                                  })}
                                >
                                  입금 확인
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>회원 목록</CardTitle>
                <CardDescription>
                  전체 회원 {users?.length || 0}명
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>승인 상태</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.id}</TableCell>
                        <TableCell>{u.name || '-'}</TableCell>
                        <TableCell>{u.email || '-'}</TableCell>
                        <TableCell>
                          <span className={u.role === 'admin' ? 'text-primary font-semibold' : ''}>
                            {u.role === 'admin' ? '관리자' : '회원'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {u.approvalStatus === 'approved' && <Badge className="bg-green-500">승인됨</Badge>}
                          {u.approvalStatus === 'rejected' && <Badge variant="destructive">거부됨</Badge>}
                          {u.approvalStatus === 'pending' && <Badge variant="secondary">대기중</Badge>}
                        </TableCell>
                        <TableCell>{new Date(u.createdAt).toLocaleDateString('ko-KR')}</TableCell>
                        <TableCell>
                          {u.role !== 'admin' && (
                            <div className="flex gap-2">
                              {u.approvalStatus !== 'approved' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateUserApprovalMutation.mutate({ userId: u.id, status: 'approved' })}
                                >
                                  승인
                                </Button>
                              )}
                              {u.approvalStatus !== 'rejected' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateUserApprovalMutation.mutate({ userId: u.id, status: 'rejected' })}
                                >
                                  거부
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>입금 확인 대기 목록</CardTitle>
                <CardDescription>
                  입금 확인을 요청한 회원 {pendingPayments?.length || 0}명
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="text-center py-4">로딩 중...</div>
                ) : pendingPayments && pendingPayments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>이름</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>입금자명</TableHead>
                        <TableHead>입금일시</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingPayments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.id}</TableCell>
                          <TableCell>{payment.name || '-'}</TableCell>
                          <TableCell>{payment.email || '-'}</TableCell>
                          <TableCell>{payment.depositorName || '-'}</TableCell>
                          <TableCell>{payment.depositDate || '-'}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => confirmPaymentMutation.mutate({ userId: payment.id })}
                              disabled={confirmPaymentMutation.isPending}
                            >
                              입금 확인
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    입금 확인 대기 중인 회원이 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email-templates">
            <Card>
              <CardHeader>
                <CardTitle>이메일 템플릿 관리</CardTitle>
                <CardDescription>
                  자동 발송되는 이메일의 제목과 내용을 수정할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <p>로딩 중...</p>
                ) : emailTemplates && emailTemplates.length > 0 ? (
                  <div className="space-y-4">
                    {emailTemplates.map((template: any) => (
                      <Card key={template.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{template.templateKey}</CardTitle>
                              {template.description && (
                                <CardDescription>{template.description}</CardDescription>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTemplate(template);
                                setTemplateSubject(template.subject);
                                setTemplateBody(template.body);
                                setTemplateDialogOpen(true);
                              }}
                            >
                              편집
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-muted-foreground">제목</Label>
                              <p className="font-medium">{template.subject}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">내용 미리보기</Label>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                                {template.body}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    등록된 템플릿이 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        {/* 상세 보기 모달 */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>입회 신청 상세 정보</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">이름</Label>
                    <p className="font-medium">{selectedApplication.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">이메일</Label>
                    <p className="font-medium">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">생년월일</Label>
                    <p className="font-medium">{selectedApplication.dateOfBirth}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">연락처</Label>
                    <p className="font-medium">{selectedApplication.phone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">시험 종류</Label>
                    <p className="font-medium">{selectedApplication.testType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">점수</Label>
                    <p className="font-medium">{selectedApplication.testScore}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">시험 날짜</Label>
                    <p className="font-medium">{selectedApplication.testDate || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">신청일</Label>
                    <p className="font-medium">{new Date(selectedApplication.createdAt).toLocaleString('ko-KR')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">신청 상태</Label>
                    <Badge variant={
                      selectedApplication.status === 'approved' ? 'default' :
                      selectedApplication.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {selectedApplication.status === 'approved' ? '승인됨' :
                       selectedApplication.status === 'rejected' ? '거부됨' :
                       '대기중'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">결제 상태</Label>
                    <Badge variant={
                      selectedApplication.paymentStatus === 'confirmed' ? 'default' :
                      selectedApplication.paymentStatus === 'deposit_requested' ? 'secondary' :
                      'outline'
                    }>
                      {selectedApplication.paymentStatus === 'confirmed' ? '확인됨' :
                       selectedApplication.paymentStatus === 'deposit_requested' ? '입금 요청' :
                       '대기중'}
                    </Badge>
                  </div>
                </div>
                
                {selectedApplication.depositorName && (
                  <div>
                    <Label className="text-muted-foreground">입금자명</Label>
                    <p className="font-medium">{selectedApplication.depositorName}</p>
                  </div>
                )}
                
                {selectedApplication.depositDate && (
                  <div>
                    <Label className="text-muted-foreground">입금일시</Label>
                    <p className="font-medium">{selectedApplication.depositDate}</p>
                  </div>
                )}
                
                {selectedApplication.adminNotes && (
                  <div>
                    <Label className="text-muted-foreground">관리자 메모</Label>
                    <p className="text-destructive font-medium">{selectedApplication.adminNotes}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-muted-foreground">증빙 서류</Label>
                  <div className="mt-2 space-y-3">
                    {/* 신원 증명 서류 */}
                    <div>
                      <Label className="text-sm font-medium">신원 증명 서류</Label>
                      {selectedApplication.identityDocumentUrl ? (
                        <div className="mt-1">
                          <a 
                            href={selectedApplication.identityDocumentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            신원 증명 서류 보기
                          </a>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">업로드되지 않음</p>
                      )}
                    </div>
                    
                    {/* 시험 결과지 */}
                    <div>
                      <Label className="text-sm font-medium">시험 결과지</Label>
                      {selectedApplication.testResultUrl ? (
                        <div className="mt-1">
                          <a 
                            href={selectedApplication.testResultUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            시험 결과지 보기
                          </a>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">업로드되지 않음</p>
                      )}
                    </div>
                    
                    {/* 기존 documentUrls 호환성 유지 */}
                    {selectedApplication.documentUrls && !selectedApplication.identityDocumentUrl && !selectedApplication.testResultUrl && (
                      <div>
                        <Label className="text-sm font-medium">기타 서류</Label>
                        <div className="mt-1 space-y-1">
                          {selectedApplication.documentUrls.split(',').map((url: string, index: number) => (
                            <div key={index}>
                              <a 
                                href={url.trim()} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                서류 {index + 1} 보기
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                닫기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 이메일 템플릿 편집 모달 */}
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>이메일 템플릿 편집</DialogTitle>
              <DialogDescription>
                {editingTemplate?.templateKey}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="templateSubject">제목</Label>
                <Input
                  id="templateSubject"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="이메일 제목"
                />
              </div>
              <div>
                <Label htmlFor="templateBody">내용</Label>
                <Textarea
                  id="templateBody"
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  placeholder="이메일 내용"
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  변수: {'{'}{'{'} name {'}'}{'}'},  {'{'}{'{'} email {'}'}{'}'},  {'{'}{'{'} status {'}'}{'}'}  등을 사용할 수 있습니다.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                취소
              </Button>
              <Button 
                onClick={() => {
                  if (editingTemplate) {
                    updateEmailTemplateMutation.mutate({
                      templateKey: editingTemplate.templateKey,
                      subject: templateSubject,
                      body: templateBody
                    });
                  }
                }}
                disabled={updateEmailTemplateMutation.isPending}
              >
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

          {/* FAQ 관리 탭 */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>FAQ 관리</CardTitle>
                    <CardDescription>자주 묻는 질문을 관리합니다</CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingFaq(null);
                      setFaqQuestion('');
                      setFaqAnswer('');
                      setFaqCategory('');
                      setFaqDisplayOrder(0);
                      setFaqDialogOpen(true);
                    }}
                  >
                    FAQ 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {faqsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>순서</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>질문</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faqs && faqs.length > 0 ? (
                        faqs.map((faq: any) => (
                          <TableRow key={faq.id}>
                            <TableCell>{faq.displayOrder}</TableCell>
                            <TableCell>{faq.category || '-'}</TableCell>
                            <TableCell className="max-w-md truncate">{faq.question}</TableCell>
                            <TableCell>
                              <Badge variant={faq.isPublished ? 'default' : 'secondary'}>
                                {faq.isPublished ? '공개' : '비공개'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingFaq(faq);
                                  setFaqQuestion(faq.question);
                                  setFaqAnswer(faq.answer);
                                  setFaqCategory(faq.category || '');
                                  setFaqDisplayOrder(faq.displayOrder);
                                  setFaqDialogOpen(true);
                                }}
                              >
                                수정
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  if (confirm('FAQ를 삭제하시겠습니까?')) {
                                    deleteFaqMutation.mutate({ id: faq.id });
                                  }
                                }}
                              >
                                삭제
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  updateFaqMutation.mutate({
                                    id: faq.id,
                                    isPublished: faq.isPublished ? 0 : 1
                                  });
                                }}
                              >
                                {faq.isPublished ? '비공개' : '공개'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            등록된 FAQ가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 블로그 관리 탭 */}
          <TabsContent value="blog">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>블로그 관리</CardTitle>
                    <CardDescription>블로그 글을 관리합니다</CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingBlog(null);
                      setBlogTitle('');
                      setBlogSlug('');
                      setBlogContent('');
                      setBlogExcerpt('');
                      setBlogThumbnailUrl('');
                      setBlogCategory('');
                      setBlogDialogOpen(true);
                    }}
                  >
                    블로그 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {blogsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제목</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>발행일</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogs && blogs.length > 0 ? (
                        blogs.map((blog: any) => (
                          <TableRow key={blog.id}>
                            <TableCell className="max-w-md truncate">{blog.title}</TableCell>
                            <TableCell>{blog.category || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={blog.isPublished ? 'default' : 'secondary'}>
                                {blog.isPublished ? '공개' : '비공개'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {blog.publishedAt 
                                ? new Date(blog.publishedAt).toLocaleDateString('ko-KR')
                                : '-'
                              }
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingBlog(blog);
                                  setBlogTitle(blog.title);
                                  setBlogSlug(blog.slug);
                                  setBlogContent(blog.content);
                                  setBlogExcerpt(blog.excerpt || '');
                                  setBlogThumbnailUrl(blog.thumbnailUrl || '');
                                  setBlogCategory(blog.category || '');
                                  setBlogDialogOpen(true);
                                }}
                              >
                                수정
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  if (confirm('블로그를 삭제하시겠습니까?')) {
                                    deleteBlogMutation.mutate({ id: blog.id });
                                  }
                                }}
                              >
                                삭제
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  updateBlogMutation.mutate({
                                    id: blog.id,
                                    isPublished: blog.isPublished ? 0 : 1,
                                    publishedAt: blog.isPublished ? undefined : new Date()
                                  });
                                }}
                              >
                                {blog.isPublished ? '비공개' : '공개'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            등록된 블로그가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 리소스 관리 탭 */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>리소스 관리</CardTitle>
                    <CardDescription>다운로드 가능한 자료를 관리합니다</CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingResource(null);
                      setResourceTitle('');
                      setResourceDescription('');
                      setResourceFileUrl('');
                      setResourceFileName('');
                      setResourceFileType('');
                      setResourceFileSize(undefined);
                      setResourceCategory('');
                      setResourceDialogOpen(true);
                    }}
                  >
                    리소스 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {resourcesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제목</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>파일 크기</TableHead>
                        <TableHead>다운로드</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resources && resources.length > 0 ? (
                        resources.map((resource: any) => (
                          <TableRow key={resource.id}>
                            <TableCell className="max-w-md truncate">{resource.title}</TableCell>
                            <TableCell>{resource.category || '-'}</TableCell>
                            <TableCell>
                              {resource.fileSize 
                                ? resource.fileSize < 1024 * 1024 
                                  ? `${(resource.fileSize / 1024).toFixed(1)} KB`
                                  : `${(resource.fileSize / (1024 * 1024)).toFixed(1)} MB`
                                : '-'
                              }
                            </TableCell>
                            <TableCell>{resource.downloadCount || 0}회</TableCell>
                            <TableCell>
                              <Badge variant={resource.isPublished ? 'default' : 'secondary'}>
                                {resource.isPublished ? '공개' : '비공개'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingResource(resource);
                                  setResourceTitle(resource.title);
                                  setResourceDescription(resource.description || '');
                                  setResourceFileUrl(resource.fileUrl);
                                  setResourceFileName(resource.fileName || '');
                                  setResourceFileType(resource.fileType || '');
                                  setResourceFileSize(resource.fileSize);
                                  setResourceCategory(resource.category || '');
                                  setResourceDialogOpen(true);
                                }}
                              >
                                수정
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  if (confirm('리소스를 삭제하시겠습니까?')) {
                                    deleteResourceMutation.mutate({ id: resource.id });
                                  }
                                }}
                              >
                                삭제
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  updateResourceMutation.mutate({
                                    id: resource.id,
                                    isPublished: resource.isPublished ? 0 : 1,
                                  });
                                }}
                              >
                                {resource.isPublished ? '비공개' : '공개'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            등록된 리소스가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI 설정 */}
          <TabsContent value="ai-settings">
            <Card>
              <CardHeader>
                <CardTitle>AI 모델 설정</CardTitle>
                <CardDescription>
                  입회 신청 서류 자동 검증을 위한 AI 모델을 설정합니다.
                  <br />
                  <strong>최소 2개 이상의 AI 모델을 활성화해야 오토 파일럿 모드가 작동합니다.</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* OpenAI */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">OpenAI (ChatGPT)</h3>
                    <Badge variant="secondary">GPT-4, GPT-3.5</Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="openai-api-key">API 키</Label>
                      <Input
                        id="openai-api-key"
                        type="password"
                        placeholder="sk-..."
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        onBlur={(e) => validateOpenAIKey(e.target.value)}
                      />
                      {openaiKeyValidation.validating && (
                        <p className="text-sm text-muted-foreground mt-1">검증 중...</p>
                      )}
                      {openaiKeyValidation.valid === true && (
                        <p className="text-sm text-green-600 mt-1">✅ 유효한 API 키입니다.</p>
                      )}
                      {openaiKeyValidation.valid === false && (
                        <p className="text-sm text-red-600 mt-1">❌ {openaiKeyValidation.error}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="openai-model">모델 선택</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={loadOpenAIModels}
                          disabled={openaiModelsLoading || !openaiApiKey}
                        >
                          {openaiModelsLoading ? '로드 중...' : '모델 목록 불러오기'}
                        </Button>
                      </div>
                      <Select
                        value={openaiModel}
                        onValueChange={(value) => setOpenaiModel(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="모델을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {openaiModels.length > 0 ? (
                            openaiModels.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                              <SelectItem value="gpt-4-vision-preview">GPT-4 Vision Preview</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="openai-enabled"
                        checked={openaiEnabled}
                        onCheckedChange={(checked) => setOpenaiEnabled(!!checked)}
                      />
                      <Label htmlFor="openai-enabled">활성화</Label>
                    </div>
                    <Button
                      onClick={() => {
                        upsertAiSettingMutation.mutate({
                          platform: 'openai',
                          apiKey: openaiApiKey,
                          selectedModel: openaiModel,
                          isEnabled: openaiEnabled ? 1 : 0,
                        });
                      }}
                      disabled={openaiApiKey && openaiKeyValidation.valid === false}
                    >
                      저장
                    </Button>
                  </div>
                </div>

                {/* Anthropic (Claude) */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Anthropic (Claude)</h3>
                    <Badge variant="secondary">Claude 3</Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="anthropic-api-key">API 키</Label>
                      <Input
                        id="anthropic-api-key"
                        type="password"
                        placeholder="sk-ant-..."
                        value={anthropicApiKey}
                        onChange={(e) => setAnthropicApiKey(e.target.value)}
                        onBlur={(e) => validateAnthropicKey(e.target.value)}
                      />
                      {anthropicKeyValidation.validating && (
                        <p className="text-sm text-muted-foreground mt-1">검증 중...</p>
                      )}
                      {anthropicKeyValidation.valid === true && (
                        <p className="text-sm text-green-600 mt-1">✅ 유효한 API 키입니다.</p>
                      )}
                      {anthropicKeyValidation.valid === false && (
                        <p className="text-sm text-red-600 mt-1">❌ {anthropicKeyValidation.error}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="anthropic-model">모델 선택</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={loadAnthropicModels}
                          disabled={anthropicModelsLoading || !anthropicApiKey}
                        >
                          {anthropicModelsLoading ? '로드 중...' : '모델 목록 불러오기'}
                        </Button>
                      </div>
                      <Select value={anthropicModel} onValueChange={(value) => setAnthropicModel(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="모델을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {anthropicModels.length > 0 ? (
                            anthropicModels.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Latest)</SelectItem>
                              <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                              <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                              <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anthropic-enabled"
                        checked={anthropicEnabled}
                        onCheckedChange={(checked) => setAnthropicEnabled(!!checked)}
                      />
                      <Label htmlFor="anthropic-enabled">활성화</Label>
                    </div>
                    <Button
                      onClick={() => {
                        upsertAiSettingMutation.mutate({
                          platform: 'anthropic',
                          apiKey: anthropicApiKey,
                          selectedModel: anthropicModel,
                          isEnabled: anthropicEnabled ? 1 : 0,
                        });
                      }}
                      disabled={anthropicApiKey && anthropicKeyValidation.valid === false}
                    >
                      저장
                    </Button>
                  </div>
                </div>

                {/* Google (Gemini) */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Google (Gemini)</h3>
                    <Badge variant="secondary">Gemini Pro</Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="google-api-key">API 키</Label>
                      <Input
                        id="google-api-key"
                        type="password"
                        placeholder="AIza..."
                        value={googleApiKey}
                        onChange={(e) => setGoogleApiKey(e.target.value)}
                        onBlur={(e) => validateGoogleKey(e.target.value)}
                      />
                      {googleKeyValidation.validating && (
                        <p className="text-sm text-muted-foreground mt-1">검증 중...</p>
                      )}
                      {googleKeyValidation.valid === true && (
                        <p className="text-sm text-green-600 mt-1">✅ 유효한 API 키입니다.</p>
                      )}
                      {googleKeyValidation.valid === false && (
                        <p className="text-sm text-red-600 mt-1">❌ {googleKeyValidation.error}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="google-model">모델 선택</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={loadGoogleModels}
                          disabled={googleModelsLoading || !googleApiKey}
                        >
                          {googleModelsLoading ? '로드 중...' : '모델 목록 불러오기'}
                        </Button>
                      </div>
                      <Select value={googleModel} onValueChange={(value) => setGoogleModel(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="모델을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {googleModels.length > 0 ? (
                            googleModels.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                              <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                              <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="google-enabled"
                        checked={googleEnabled}
                        onCheckedChange={(checked) => setGoogleEnabled(!!checked)}
                      />
                      <Label htmlFor="google-enabled">활성화</Label>
                    </div>
                    <Button
                      onClick={() => {
                        upsertAiSettingMutation.mutate({
                          platform: 'google',
                          apiKey: googleApiKey,
                          selectedModel: googleModel,
                          isEnabled: googleEnabled ? 1 : 0,
                        });
                      }}
                      disabled={googleApiKey && googleKeyValidation.valid === false}
                    >
                      저장
                    </Button>
                  </div>
                </div>

                {/* Perplexity */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Perplexity</h3>
                    <Badge variant="secondary">Sonar Pro</Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="perplexity-api-key">API 키</Label>
                      <Input
                        id="perplexity-api-key"
                        type="password"
                        placeholder="pplx-..."
                        value={perplexityApiKey}
                        onChange={(e) => setPerplexityApiKey(e.target.value)}
                        onBlur={(e) => validatePerplexityKey(e.target.value)}
                      />
                      {perplexityKeyValidation.validating && (
                        <p className="text-sm text-muted-foreground mt-1">검증 중...</p>
                      )}
                      {perplexityKeyValidation.valid === true && (
                        <p className="text-sm text-green-600 mt-1">✅ 유효한 API 키입니다.</p>
                      )}
                      {perplexityKeyValidation.valid === false && (
                        <p className="text-sm text-red-600 mt-1">❌ {perplexityKeyValidation.error}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="perplexity-model">모델 선택</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={loadPerplexityModels}
                          disabled={perplexityModelsLoading}
                        >
                          {perplexityModelsLoading ? '로드 중...' : '모델 목록 불러오기'}
                        </Button>
                      </div>
                      <Select value={perplexityModel} onValueChange={(value) => setPerplexityModel(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="모델을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {perplexityModels.length > 0 ? (
                            perplexityModels.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="sonar-pro">Sonar Pro</SelectItem>
                              <SelectItem value="sonar">Sonar</SelectItem>
                              <SelectItem value="sonar-reasoning">Sonar Reasoning</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perplexity-enabled"
                        checked={perplexityEnabled}
                        onCheckedChange={(checked) => setPerplexityEnabled(!!checked)}
                      />
                      <Label htmlFor="perplexity-enabled">활성화</Label>
                    </div>
                    <Button
                      onClick={() => {
                        upsertAiSettingMutation.mutate({
                          platform: 'perplexity',
                          apiKey: perplexityApiKey,
                          selectedModel: perplexityModel,
                          isEnabled: perplexityEnabled ? 1 : 0,
                        });
                      }}
                      disabled={perplexityApiKey && perplexityKeyValidation.valid === false}
                    >
                      저장
                    </Button>
                  </div>
                </div>

                {/* 오토 파일럿 모드 */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">오토 파일럿 모드</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        활성화된 모든 AI가 일치하는 결과를 내면 자동으로 승인/거부합니다.
                      </p>
                      <p className="text-sm mt-2">
                        <Badge variant={canEnableAutopilot ? "default" : "destructive"}>
                          활성화된 플랫폼: {enabledPlatformCount}/2
                        </Badge>
                        {!canEnableAutopilot && (
                          <span className="text-destructive ml-2">
                            최소 2개 이상의 AI 플랫폼을 활성화해야 합니다.
                          </span>
                        )}
                      </p>
                    </div>
                    <Checkbox
                      id="autopilot-enabled"
                      checked={autopilotEnabled}
                      disabled={!canEnableAutopilot}
                      onCheckedChange={(checked) => {
                        if (!canEnableAutopilot) {
                          toast.error('오토 파일럿 모드를 활성화하려면 최소 2개 이상의 AI 모델을 활성화해야 합니다.');
                          return;
                        }
                        const enabled = !!checked;
                        setAutopilotEnabled(enabled);
                        // 즉시 저장
                        setSystemSettingMutation.mutateAsync({
                          key: 'autopilot_enabled',
                          value: enabled ? '1' : '0',
                        });
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 재검토 요청 */}
          <TabsContent value="review-requests">
            <Card>
              <CardHeader>
                <CardTitle>재검토 요청 목록</CardTitle>
                <CardDescription>
AI 검증에서 거부된 신청자가 재검토를 요청한 목록입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>신청자</TableHead>
                      <TableHead>시험 종류</TableHead>
                      <TableHead>점수</TableHead>
                      <TableHead>재검토 사유</TableHead>
                      <TableHead>요청일</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReviews && pendingReviews.length > 0 ? (
                      pendingReviews.map((item: any) => (
                        <TableRow key={item.review.id}>
                          <TableCell>{item.review.id}</TableCell>
                          <TableCell>{item.application?.fullName || '-'}</TableCell>
                          <TableCell>{item.application?.testType || '-'}</TableCell>
                          <TableCell>{item.application?.testScore || '-'}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {item.review.requestReason}
                          </TableCell>
                          <TableCell>
                            {new Date(item.review.createdAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">대기중</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  if (confirm('재검토 승인하시겠습니까? 원래 신청도 승인 처리됩니다.')) {
                                    updateReviewStatusMutation.mutate({
                                      reviewId: item.review.id,
                                      status: 'approved',
                                    });
                                  }
                                }}
                              >
                                승인
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (confirm('재검토 거부하시겠습니까?')) {
                                    updateReviewStatusMutation.mutate({
                                      reviewId: item.review.id,
                                      status: 'rejected',
                                    });
                                  }
                                }}
                              >
                                거부
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          재검토 요청이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* 리소스 편집 모달 */}
        <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingResource ? '리소스 수정' : '리소스 추가'}</DialogTitle>
              <DialogDescription>
                다운로드 가능한 자료를 등록해주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="resourceTitle">제목</Label>
                <Input
                  id="resourceTitle"
                  placeholder="리소스 제목"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="resourceDescription">설명</Label>
                <Textarea
                  id="resourceDescription"
                  placeholder="리소스에 대한 간략한 설명"
                  value={resourceDescription}
                  onChange={(e) => setResourceDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="resourceFileUrl">파일 URL</Label>
                <Input
                  id="resourceFileUrl"
                  placeholder="https://..."
                  value={resourceFileUrl}
                  onChange={(e) => setResourceFileUrl(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resourceFileName">파일명</Label>
                  <Input
                    id="resourceFileName"
                    placeholder="document.pdf"
                    value={resourceFileName}
                    onChange={(e) => setResourceFileName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="resourceFileType">파일 타입</Label>
                  <Input
                    id="resourceFileType"
                    placeholder="application/pdf"
                    value={resourceFileType}
                    onChange={(e) => setResourceFileType(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resourceFileSize">파일 크기 (bytes)</Label>
                  <Input
                    id="resourceFileSize"
                    type="number"
                    placeholder="1024000"
                    value={resourceFileSize || ''}
                    onChange={(e) => setResourceFileSize(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <Label htmlFor="resourceCategory">카테고리</Label>
                  <Input
                    id="resourceCategory"
                    placeholder="예: 서류"
                    value={resourceCategory}
                    onChange={(e) => setResourceCategory(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResourceDialogOpen(false)}>
                취소
              </Button>
              <Button 
                onClick={() => {
                  if (editingResource) {
                    updateResourceMutation.mutate({
                      id: editingResource.id,
                      title: resourceTitle,
                      description: resourceDescription || undefined,
                      fileUrl: resourceFileUrl,
                      fileName: resourceFileName || undefined,
                      fileType: resourceFileType || undefined,
                      fileSize: resourceFileSize,
                      category: resourceCategory || undefined,
                    });
                  } else {
                    createResourceMutation.mutate({
                      title: resourceTitle,
                      description: resourceDescription || undefined,
                      fileUrl: resourceFileUrl,
                      fileName: resourceFileName || undefined,
                      fileType: resourceFileType || undefined,
                      fileSize: resourceFileSize,
                      category: resourceCategory || undefined,
                    });
                  }
                }}
                disabled={!resourceTitle || !resourceFileUrl}
              >
                {editingResource ? '수정' : '추가'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 블로그 편집 모달 */}
        <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBlog ? '블로그 수정' : '블로그 추가'}</DialogTitle>
              <DialogDescription>
                블로그 글을 작성해주세요. 마크다운 문법을 사용할 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="blogTitle">제목</Label>
                <Input
                  id="blogTitle"
                  placeholder="블로그 제목"
                  value={blogTitle}
                  onChange={(e) => {
                    setBlogTitle(e.target.value);
                    // 제목에서 자동으로 slug 생성 (수정 시에는 제외)
                    if (!editingBlog) {
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9가-힣\s-]/g, '')
                        .replace(/\s+/g, '-');
                      setBlogSlug(slug);
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="blogSlug">Slug (URL)</Label>
                <Input
                  id="blogSlug"
                  placeholder="blog-url-slug"
                  value={blogSlug}
                  onChange={(e) => setBlogSlug(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="blogCategory">카테고리</Label>
                  <Input
                    id="blogCategory"
                    placeholder="예: 소식"
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="blogThumbnailUrl">썸네일 URL</Label>
                  <Input
                    id="blogThumbnailUrl"
                    placeholder="https://..."
                    value={blogThumbnailUrl}
                    onChange={(e) => setBlogThumbnailUrl(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="blogExcerpt">요약</Label>
                <Textarea
                  id="blogExcerpt"
                  placeholder="블로그 글의 간략한 요약"
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="blogContent">내용 (마크다운)</Label>
                <Textarea
                  id="blogContent"
                  placeholder="# 제목\n\n내용을 입력해주세요..."
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBlogDialogOpen(false)}>
                취소
              </Button>
              <Button 
                onClick={() => {
                  if (editingBlog) {
                    updateBlogMutation.mutate({
                      id: editingBlog.id,
                      title: blogTitle,
                      slug: blogSlug,
                      content: blogContent,
                      excerpt: blogExcerpt || undefined,
                      thumbnailUrl: blogThumbnailUrl || undefined,
                      category: blogCategory || undefined,
                    });
                  } else {
                    createBlogMutation.mutate({
                      title: blogTitle,
                      slug: blogSlug,
                      content: blogContent,
                      excerpt: blogExcerpt || undefined,
                      thumbnailUrl: blogThumbnailUrl || undefined,
                      category: blogCategory || undefined,
                    });
                  }
                }}
                disabled={!blogTitle || !blogSlug || !blogContent}
              >
                {editingBlog ? '수정' : '추가'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* FAQ 편집 모달 */}
        <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFaq ? 'FAQ 수정' : 'FAQ 추가'}</DialogTitle>
              <DialogDescription>
                자주 묻는 질문과 답변을 작성해주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="faqQuestion">질문</Label>
                <Input
                  id="faqQuestion"
                  placeholder="예: RIQ Society에 가입하려면 어떻게 해야 하나요?"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="faqAnswer">답변</Label>
                <Textarea
                  id="faqAnswer"
                  placeholder="답변 내용을 입력해주세요."
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="faqCategory">카테고리</Label>
                  <Input
                    id="faqCategory"
                    placeholder="예: 가입 및 신청"
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="faqDisplayOrder">표시 순서</Label>
                  <Input
                    id="faqDisplayOrder"
                    type="number"
                    placeholder="0"
                    value={faqDisplayOrder}
                    onChange={(e) => setFaqDisplayOrder(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFaqDialogOpen(false)}>
                취소
              </Button>
              <Button 
                onClick={() => {
                  if (editingFaq) {
                    updateFaqMutation.mutate({
                      id: editingFaq.id,
                      question: faqQuestion,
                      answer: faqAnswer,
                      category: faqCategory || undefined,
                      displayOrder: faqDisplayOrder,
                    });
                  } else {
                    createFaqMutation.mutate({
                      question: faqQuestion,
                      answer: faqAnswer,
                      category: faqCategory || undefined,
                      displayOrder: faqDisplayOrder,
                    });
                  }
                }}
                disabled={!faqQuestion || !faqAnswer}
              >
                {editingFaq ? '수정' : '추가'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI 검증 결과 모달 */}
        <Dialog open={aiVerificationDialogOpen} onOpenChange={setAiVerificationDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>AI 검증 결과</DialogTitle>
              <DialogDescription>
                {selectedApplication?.fullName}님의 입회 신청에 대한 AI 검증 결과입니다.
              </DialogDescription>
            </DialogHeader>
            <AIVerificationResults 
              applicationId={selectedApplication?.id}
              verificationProgress={wsProgress}
              isVerifying={isVerifying}
            />
          </DialogContent>
        </Dialog>

        {/* 거부 사유 입력 모달 */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>입회 신청 거부</DialogTitle>
              <DialogDescription>
                거부 사유를 입력하면 신청자가 마이페이지에서 확인할 수 있습니다. (선택 사항)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectReason">거부 사유</Label>
                <Textarea
                  id="rejectReason"
                  placeholder="예: 제출하신 시험 점수가 입회 기준에 미달합니다. (선택 사항)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                거부 확정
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-8">
          <Button variant="outline" onClick={() => setLocation("/")}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}

