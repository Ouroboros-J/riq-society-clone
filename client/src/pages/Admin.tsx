import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedCertId, setSelectedCertId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.listUsers.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: certificates, isLoading: certificatesLoading, refetch: refetchCertificates } = trpc.admin.listAllCertificates.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: pendingPayments, isLoading: paymentsLoading, refetch: refetchPayments } = trpc.admin.listPendingPayments.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const approveCertMutation = trpc.admin.approveCertificate.useMutation({
    onSuccess: () => {
      toast.success("증명서가 승인되었습니다.");
      refetchCertificates();
    },
    onError: (error) => {
      toast.error("승인 실패: " + error.message);
    },
  });

  const rejectCertMutation = trpc.admin.rejectCertificate.useMutation({
    onSuccess: () => {
      toast.success("증명서가 거부되었습니다.");
      setRejectDialogOpen(false);
      setRejectionReason("");
      refetchCertificates();
    },
    onError: (error) => {
      toast.error("거부 실패: " + error.message);
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

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      setLocation("/");
    }
  }, [isAuthenticated, user, loading, setLocation]);

  if (loading || usersLoading || certificatesLoading) {
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

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">회원 관리</TabsTrigger>
            <TabsTrigger value="certificates">증명서 관리</TabsTrigger>
            <TabsTrigger value="payments">입금 확인</TabsTrigger>
          </TabsList>

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

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>증명서 목록</CardTitle>
                <CardDescription>
                  전체 증명서 {certificates?.length || 0}개
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>회원 ID</TableHead>
                      <TableHead>파일명</TableHead>
                      <TableHead>시험 이름</TableHead>
                      <TableHead>점수</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>제출일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates?.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell>{cert.id}</TableCell>
                        <TableCell>{cert.userId}</TableCell>
                        <TableCell>{cert.fileName}</TableCell>
                        <TableCell>{cert.testName || '-'}</TableCell>
                        <TableCell>{cert.score || '-'}</TableCell>
                        <TableCell>
                          {cert.status === 'approved' && <Badge className="bg-green-500">승인됨</Badge>}
                          {cert.status === 'rejected' && <Badge variant="destructive">거부됨</Badge>}
                          {cert.status === 'pending' && <Badge variant="secondary">대기중</Badge>}
                        </TableCell>
                        <TableCell>{new Date(cert.createdAt).toLocaleDateString('ko-KR')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="link"
                              onClick={() => window.open(cert.fileUrl, '_blank')}
                            >
                              보기
                            </Button>
                            {cert.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => approveCertMutation.mutate({ id: cert.id })}
                                >
                                  승인
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedCertId(cert.id);
                                    setRejectDialogOpen(true);
                                  }}
                                >
                                  거부
                                </Button>
                              </>
                            )}
                          </div>
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
        </Tabs>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>증명서 거부</DialogTitle>
              <DialogDescription>
                거부 사유를 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">거부 사유</Label>
                <Textarea
                  id="reason"
                  placeholder="거부 사유를 입력하세요"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedCertId && rejectionReason) {
                    rejectCertMutation.mutate({ id: selectedCertId, reason: rejectionReason });
                  }
                }}
                disabled={!rejectionReason}
              >
                거부
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

