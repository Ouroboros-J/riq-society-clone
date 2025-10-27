import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

// Step 1: Personal Information Schema
const step1Schema = z.object({
  fullName: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
  dateOfBirth: z.string().min(1, "생년월일을 입력해주세요"),
  phone: z.string().optional(),
});

// Step 2: Test Scores Schema
const step2Schema = z.object({
  testType: z.string().min(1, "시험 종류를 선택해주세요"),
  testScore: z.string().min(1, "점수를 입력해주세요"),
  testDate: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export default function Application() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const submitMutation = trpc.application.submit.useMutation();
  const uploadMutation = trpc.application.uploadDocument.useMutation();

  // Load draft from LocalStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('application-draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed.formData || {});
        setCurrentStep(parsed.currentStep || 1);
        toast.info("임시 저장된 데이터를 불러왔습니다");
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
    setIsLoadingDraft(false);
  }, []);

  // Auto-save to LocalStorage whenever formData changes
  useEffect(() => {
    if (!isLoadingDraft && Object.keys(formData).length > 0) {
      localStorage.setItem('application-draft', JSON.stringify({
        formData,
        currentStep,
        savedAt: new Date().toISOString(),
      }));
    }
  }, [formData, currentStep, isLoadingDraft]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/auth");
    return null;
  }

  if (isLoadingDraft) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Step 1 Form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData,
  });

  // Step 2 Form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: formData,
  });

  const handleStep1Submit = (data: Step1Data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(2);
    toast.success("1단계 완료!");
  };

  const handleStep2Submit = (data: Step2Data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(3);
    toast.success("2단계 완료!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(files);
    }
  };

  const handleFinalSubmit = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("최소 1개의 증빙 서류를 업로드해주세요");
      return;
    }

    try {
      // Upload files
      const documentUrls: string[] = [];
      for (const file of uploadedFiles) {
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve(base64.split(",")[1]); // Remove data:image/png;base64, prefix
          };
          reader.readAsDataURL(file);
        });

        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileData,
        });

        documentUrls.push(result.url);
      }

      // Submit application
      await submitMutation.mutateAsync({
        fullName: formData.fullName!,
        email: formData.email!,
        dateOfBirth: formData.dateOfBirth!,
        phone: formData.phone,
        testType: formData.testType!,
        testScore: formData.testScore!,
        testDate: formData.testDate,
        documentUrls: JSON.stringify(documentUrls),
      });

      // Clear draft from LocalStorage
      localStorage.removeItem('application-draft');
      
      toast.success("입회 신청이 완료되었습니다!");
      setLocation("/mypage");
    } catch (error) {
      console.error("Application submission error:", error);
      toast.error("신청 제출 중 오류가 발생했습니다");
    }
  };

  return (
    <>
      <SEO 
        title="입회 신청"
        description="RIQ Society 입회 신청 페이지. 표준점수 145 이상의 지능검사 결과를 제출하여 입회를 신청하세요."
        keywords="RIQ Society 입회, 지능검사, 멘사 입회, 고지능자 모임 신청"
      />
      <Header />
      <div className="min-h-screen bg-background text-foreground py-20">
        <div className="container max-w-3xl mx-auto px-4">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold">입회 신청</h1>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} / {totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 card-hover">
                <h2 className="text-2xl font-semibold mb-6">개인정보</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">이름 *</Label>
                    <Input
                      id="fullName"
                      {...step1Form.register("fullName")}
                      placeholder="홍길동"
                    />
                    {step1Form.formState.errors.fullName && (
                      <p className="text-sm text-destructive mt-1">
                        {step1Form.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">이메일 *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...step1Form.register("email")}
                      placeholder="example@email.com"
                    />
                    {step1Form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {step1Form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">생년월일 *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...step1Form.register("dateOfBirth")}
                    />
                    {step1Form.formState.errors.dateOfBirth && (
                      <p className="text-sm text-destructive mt-1">
                        {step1Form.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">전화번호 (선택)</Label>
                    <Input
                      id="phone"
                      {...step1Form.register("phone")}
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">다음</Button>
              </div>
            </form>
          )}

          {/* Step 2: Test Scores */}
          {currentStep === 2 && (
            <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 card-hover">
                <h2 className="text-2xl font-semibold mb-6">시험 점수</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="testType">시험 종류 *</Label>
                    <Select
                      onValueChange={(value) => step2Form.setValue("testType", value)}
                      defaultValue={formData.testType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="시험을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RIQ Admission Test">RIQ Admission Test</SelectItem>
                        <SelectItem value="Mensa">Mensa</SelectItem>
                        <SelectItem value="WAIS">WAIS</SelectItem>
                        <SelectItem value="Stanford-Binet">Stanford-Binet</SelectItem>
                        <SelectItem value="SAT">SAT</SelectItem>
                        <SelectItem value="GRE">GRE</SelectItem>
                        <SelectItem value="Other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    {step2Form.formState.errors.testType && (
                      <p className="text-sm text-destructive mt-1">
                        {step2Form.formState.errors.testType.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="testScore">점수 *</Label>
                    <Input
                      id="testScore"
                      {...step2Form.register("testScore")}
                      placeholder="예: 135, 99%"
                    />
                    {step2Form.formState.errors.testScore && (
                      <p className="text-sm text-destructive mt-1">
                        {step2Form.formState.errors.testScore.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="testDate">시험 응시일 (선택)</Label>
                    <Input
                      id="testDate"
                      type="date"
                      {...step2Form.register("testDate")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  이전
                </Button>
                <Button type="submit">다음</Button>
              </div>
            </form>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 card-hover">
                <h2 className="text-2xl font-semibold mb-6">증빙 서류</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="documents">서류 업로드 *</Label>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      PDF, JPG, PNG 파일만 업로드 가능합니다
                    </p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">업로드된 파일:</h3>
                      <ul className="space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                  이전
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={submitMutation.isPending || uploadMutation.isPending || uploadedFiles.length === 0}
                >
                  {(submitMutation.isPending || uploadMutation.isPending) ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      제출 중...
                    </>
                  ) : (
                    "제출하기"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

