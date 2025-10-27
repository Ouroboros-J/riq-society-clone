import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function MyPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: application, isLoading: applicationLoading } = trpc.application.getMyApplication.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [depositorName, setDepositorName] = useState("");
  const [depositDate, setDepositDate] = useState("");

  const requestPaymentMutation = trpc.application.requestPayment.useMutation({
    onSuccess: () => {
      toast.success("입금 확인 요청이 제출되엁습니다.");
      setDepositorName("");
      setDepositDate("");
      // Refetch application data
      window.location.reload();
    },
    onError: (error) => {
      toast.error("입금 확인 요청에 실패했습니다: " + error.message);
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);



  const handleRequestPayment = () => {
    if (!depositorName || !depositDate) {
      toast.error("입금자명과 입금일시를 모두 입력해주세요.");
      return;
    }
    requestPaymentMutation.mutate({ depositorName, depositDate });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">승인됨</Badge>;
      case "rejected":
        return <Badge variant="destructive">거부됨</Badge>;
      default:
        return <Badge variant="secondary">대기중</Badge>;
    }
  };

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">승인된 회원</Badge>;
      case "rejected":
        return <Badge variant="destructive">거부됨</Badge>;
      default:
        return <Badge variant="secondary">승인 대기중</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">결제 완료</Badge>;
      case "deposit_requested":
        return <Badge variant="secondary">입금 확인 대기중</Badge>;
      default:
        return <Badge variant="outline">미결제</Badge>;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
            <p className="text-muted-foreground">회원 정보 및 증명서 관리</p>
          </div>

          {/* Application Status Card */}
          {application && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>입회 신청 상태</CardTitle>
                <CardDescription>신청일: {new Date(application.createdAt).toLocaleDateString('ko-KR')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>이름</Label>
                    <p className="text-sm">{application.fullName}</p>
                  </div>
                  <div>
                    <Label>생년월일</Label>
                    <p className="text-sm">{application.dateOfBirth}</p>
                  </div>
                  <div>
                    <Label>시험 종류</Label>
                    <p className="text-sm">{application.testType}</p>
                  </div>
                  <div>
                    <Label>점수</Label>
                    <p className="text-sm">{application.testScore}</p>
                  </div>
                </div>
                <div>
                  <Label>상태</Label>
                  <div className="mt-2">{getStatusBadge(application.status)}</div>
                </div>
                {application.status === 'rejected' && application.adminNotes && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                    <Label className="text-destructive">거부 사유</Label>
                    <p className="text-sm mt-2">{application.adminNotes}</p>
                  </div>
                )}
                {application.status === 'approved' && application.adminNotes && (
                  <div>
                    <Label>관리자 메모</Label>
                    <p className="text-sm text-muted-foreground">{application.adminNotes}</p>
                  </div>
                )}
                
                {/* Payment Section */}
                {application.status === "approved" && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <Label>결제 상태</Label>
                      <div className="mt-2">{getPaymentStatusBadge(application.paymentStatus)}</div>
                    </div>
                    
                    {application.paymentStatus === "pending" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="app-depositor">입금자명</Label>
                          <Input
                            id="app-depositor"
                            value={depositorName}
                            onChange={(e) => setDepositorName(e.target.value)}
                            placeholder="입금하신 분의 성함을 입력해주세요"
                          />
                        </div>
                        <div>
                          <Label htmlFor="app-deposit-date">입금일시</Label>
                          <Input
                            id="app-deposit-date"
                            type="datetime-local"
                            value={depositDate}
                            onChange={(e) => setDepositDate(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleRequestPayment} disabled={requestPaymentMutation.isPending}>
                          {requestPaymentMutation.isPending ? "제출 중..." : "입금 확인 요청"}
                        </Button>
                      </div>
                    )}
                    
                    {application.paymentStatus === "deposit_requested" && (
                      <div className="text-sm text-muted-foreground">
                        입금 확인 요청이 제출되었습니다. 관리자 확인을 기다려주세요.
                      </div>
                    )}
                    
                    {application.paymentStatus === "confirmed" && (
                      <div className="text-sm text-green-600">
                        결제가 확인되었습니다. 정회원 승인을 기다려주세요.
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>회원 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>이름</Label>
                  <p className="text-lg font-medium">{user?.name || "-"}</p>
                </div>
                <div>
                  <Label>이메일</Label>
                  <p className="text-lg">{user?.email || "-"}</p>
                </div>
                <div>
                  <Label>회원 상태</Label>
                  <div className="mt-2">{getApprovalStatusBadge(user?.approvalStatus || "pending")}</div>
                </div>
                <div>
                  <Label>결제 상태</Label>
                  <div className="mt-2">{getPaymentStatusBadge(application?.paymentStatus || "pending")}</div>
                </div>
                <div>
                  <Label>가입일</Label>
                  <p>{new Date(user?.createdAt || "").toLocaleDateString("ko-KR")}</p>
                </div>
              </CardContent>
            </Card>

          </div>



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

