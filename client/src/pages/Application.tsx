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
import { posthog } from "@/lib/posthog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import imageCompression from "browser-image-compression";

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
  const [identityDocument, setIdentityDocument] = useState<File | null>(null);
  const [testResultDocument, setTestResultDocument] = useState<File | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [testCategory, setTestCategory] = useState<string>("");
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [otherTestName, setOtherTestName] = useState<string>("");
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const submitMutation = trpc.application.submit.useMutation();
  const uploadMutation = trpc.application.uploadDocument.useMutation();
  const recognizedTestsQuery = trpc.recognizedTest.list.useQuery();

  // Step 1 Form (must be called before any conditional returns)
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  // Step 2 Form (must be called before any conditional returns)
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: formData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

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

  // Show loading spinner while auth is loading or draft is loading
  if (authLoading || isLoadingDraft) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  // Redirect if not authenticated (only after auth loading is complete)
  if (!isAuthenticated) {
    setLocation("/auth");
    return null;
  }

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

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

  const handleIdentityDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 파일 크기 체크 (10MB 제한)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}은(는) 10MB를 초과합니다. 더 작은 파일을 선택해주세요.`);
        return;
      }
      
      // 이미지 파일 압축
      const isImage = file.type.startsWith('image/');
      let finalFile = file;
      
      if (isImage && file.type !== 'image/svg+xml') {
        try {
          toast.info(`${file.name} 압축 중...`);
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.8,
          };
          const compressedFile = await imageCompression(file, options);
          
          const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
          const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);
          const compressionRate = ((1 - compressedFile.size / file.size) * 100).toFixed(0);
          
          toast.success(`${file.name} 압축 완료! ${originalSizeMB}MB → ${compressedSizeMB}MB (${compressionRate}% 감소)`);
          finalFile = compressedFile;
        } catch (error) {
          console.error('이미지 압축 실패:', error);
          toast.error(`${file.name} 압축 실패. 원본 파일을 사용합니다.`);
        }
      }
      
      setIdentityDocument(finalFile);
    }
  };

  const handleTestResultDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 파일 크기 체크 (10MB 제한)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}은(는) 10MB를 초과합니다. 더 작은 파일을 선택해주세요.`);
        return;
      }
      
      // 이미지 파일 압축
      const isImage = file.type.startsWith('image/');
      let finalFile = file;
      
      if (isImage && file.type !== 'image/svg+xml') {
        try {
          toast.info(`${file.name} 압축 중...`);
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.8,
          };
          const compressedFile = await imageCompression(file, options);
          
          const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
          const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);
          const compressionRate = ((1 - compressedFile.size / file.size) * 100).toFixed(0);
          
          toast.success(`${file.name} 압축 완료! ${originalSizeMB}MB → ${compressedSizeMB}MB (${compressionRate}% 감소)`);
          finalFile = compressedFile;
        } catch (error) {
          console.error('이미지 압축 실패:', error);
          toast.error(`${file.name} 압축 실패. 원본 파일을 사용합니다.`);
        }
      }
      
      setTestResultDocument(finalFile);
    }
  };

  const handleFinalSubmit = async () => {
    if (!identityDocument || !testResultDocument) {
      toast.error("신원 증명 서류와 시험 결과지를 모두 업로드해주세요");
      return;
    }

    try {
      // Upload identity document
      const identityReader = new FileReader();
      const identityFileData = await new Promise<string>((resolve) => {
        identityReader.onload = () => {
          const base64 = identityReader.result as string;
          resolve(base64.split(",")[1]); // Remove data:image/png;base64, prefix
        };
        identityReader.readAsDataURL(identityDocument);
      });

      const identityResult = await uploadMutation.mutateAsync({
        fileName: identityDocument.name,
        fileType: identityDocument.type,
        fileData: identityFileData,
      });

      // Upload test result document
      const testResultReader = new FileReader();
      const testResultFileData = await new Promise<string>((resolve) => {
        testResultReader.onload = () => {
          const base64 = testResultReader.result as string;
          resolve(base64.split(",")[1]); // Remove data:image/png;base64, prefix
        };
        testResultReader.readAsDataURL(testResultDocument);
      });

      const testResultResult = await uploadMutation.mutateAsync({
        fileName: testResultDocument.name,
        fileType: testResultDocument.type,
        fileData: testResultFileData,
      });

      // Submit application
      await submitMutation.mutateAsync({
        fullName: formData.fullName!,
        email: formData.email!,
        dateOfBirth: formData.dateOfBirth!,
        phone: formData.phone,
        testType: formData.testType!,
        testScore: formData.testScore!,
        testDate: formData.testDate,
        identityDocumentUrl: identityResult.url,
        testResultUrl: testResultResult.url,
        documentUrls: JSON.stringify([identityResult.url, testResultResult.url]), // 호환성
      });

      // Clear draft from LocalStorage
      localStorage.removeItem('application-draft');
      
      // PostHog 이벤트 추적
      posthog.capture('application_submitted', {
        testType: formData.testType,
        hasOtherTest: selectedTest === 'other',
        documentCount: 2, // 신원 증명 + 시험 결과지
      });
      
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
                <Button 
                  type="submit" 
                  disabled={!step1Form.formState.isValid || !step1Form.watch("fullName") || !step1Form.watch("email") || !step1Form.watch("dateOfBirth")}
                >
                  다음
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Test Scores */}
          {currentStep === 2 && (
            <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 card-hover">
                <h2 className="text-2xl font-semibold mb-6">시험 점수</h2>
                
                <div className="space-y-4">
                  {/* Step 1: 시험 유형 선택 (필터) */}
                  <div>
                    <Label htmlFor="testCategory">시험 유형 (선택 사항)</Label>
                    <Select
                      onValueChange={(value) => {
                        setTestCategory(value);
                        setSelectedTest("");
                        setOtherTestName("");
                        step2Form.setValue("testType", "");
                      }}
                      value={testCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="모든 시험 보기" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">모든 시험</SelectItem>
                        <SelectItem value="표준 지능 검사">표준 지능 검사</SelectItem>
                        <SelectItem value="학업 및 인지 능력 검사">학업 및 인지 능력 검사</SelectItem>
                        <SelectItem value="대학 및 대학원 진학 시험">대학 및 대학원 진학 시험</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      시험 유형을 선택하면 해당 카테고리의 시험만 표시됩니다.
                    </p>
                  </div>

                  {/* Step 2: 시험 선택 (항상 표시) */}
                  <div>
                    <Label htmlFor="testType">시험 종류 *</Label>
                    {recognizedTestsQuery.isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-sm text-muted-foreground">시험 목록 불러오는 중...</span>
                      </div>
                    ) : (
                      <Select
                        onValueChange={(value) => {
                          setSelectedTest(value);
                          if (value === "기타 시험") {
                            step2Form.setValue("testType", "");
                          } else {
                            step2Form.setValue("testType", value);
                            setOtherTestName("");
                          }
                        }}
                        value={selectedTest}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="시험을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {recognizedTestsQuery.data
                            ?.filter((test: any) => 
                              !testCategory || testCategory === "ALL" || test.category === testCategory
                            )
                            .map((test: any) => (
                              <SelectItem key={test.id} value={test.testName}>
                                {test.testName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                    {step2Form.formState.errors.testType && (
                      <p className="text-sm text-destructive mt-1">
                        {step2Form.formState.errors.testType.message}
                      </p>
                    )}
                  </div>

                  {selectedTest === "기타 시험" && (
                    <div>
                      <Label htmlFor="otherTestName">기타 시험 이름 *</Label>
                      <Input
                        id="otherTestName"
                        value={otherTestName}
                        onChange={(e) => {
                          setOtherTestName(e.target.value);
                          step2Form.setValue("testType", e.target.value);
                        }}
                        placeholder="예: 한국 지능 검사"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        기타 시험은 관리자의 수동 검토가 필요합니다.
                      </p>
                    </div>
                  )}

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
                <Button 
                  type="submit"
                  disabled={!step2Form.formState.isValid || !step2Form.watch("testType") || !step2Form.watch("testScore")}
                >
                  다음
                </Button>
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
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-yellow-200 mb-2">
                        모든 절차에는 신원 증명이 필요합니다.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        본인의 신원을 증명하는 방법은 여러 가지가 있습니다. 일반적으로 <strong>주민등록증, 운전면허증, 여권, 학생증, 국가 자격증</strong> 등을 사용합니다.
                      </p>
                    </div>
                    {/* 신원 증명 서류 업로드 */}
                    <div className="space-y-2">
                      <Label htmlFor="identity-document" className="text-base font-semibold">
                        1. 신원 증명 서류 업로드 *
                      </Label>
                      <Input
                        id="identity-document"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleIdentityDocumentChange}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-muted-foreground">
                        주민등록증, 운전면허증, 여권, 학생증 등 본인의 신원을 증명할 수 있는 서류를 업로드해주세요.
                      </p>
                      {identityDocument && (
                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-950 p-2 rounded">
                          <span className="font-medium text-sm">{identityDocument.name}</span>
                          <span className="text-muted-foreground text-sm">
                            {(identityDocument.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 시험 결과지 업로드 */}
                    <div className="space-y-2">
                      <Label htmlFor="test-result-document" className="text-base font-semibold">
                        2. 시험 결과지 업로드 *
                      </Label>
                      <Input
                        id="test-result-document"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleTestResultDocumentChange}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-muted-foreground">
                        시험 성적표 또는 결과지를 업로드해주세요. 본인 이름, 점수, 시험명, 응시 날짜 등이 포함되어야 합니다.
                      </p>
                      {testResultDocument && (
                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-950 p-2 rounded">
                          <span className="font-medium text-sm">{testResultDocument.name}</span>
                          <span className="text-muted-foreground text-sm">
                            {(testResultDocument.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-4">
                      PDF, JPG, PNG 파일만 업로드 가능합니다. 각 파일은 10MB 이하여야 합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                  이전
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={submitMutation.isPending || uploadMutation.isPending || !identityDocument || !testResultDocument}
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

