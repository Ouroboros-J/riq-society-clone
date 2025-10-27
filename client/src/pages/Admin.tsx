import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
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
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectApplicationId, setRejectApplicationId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");


  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.listUsers.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: pendingPayments, isLoading: paymentsLoading, refetch: refetchPayments } = trpc.admin.listPendingPayments.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: applications, isLoading: applicationsLoading, refetch: refetchApplications } = trpc.admin.listApplications.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
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
    if (rejectApplicationId && rejectReason.trim()) {
      updateApplicationStatusMutation.mutate({
        applicationId: rejectApplicationId,
        status: 'rejected',
        adminNotes: rejectReason
      });
    } else {
      toast.error("거부 사유를 입력해주세요.");
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
            <TabsTrigger value="applications">입회 신청 관리</TabsTrigger>
            <TabsTrigger value="users">회원 관리</TabsTrigger>
            <TabsTrigger value="payments">입금 확인</TabsTrigger>
          </TabsList>

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
                  전체 신청 {applications?.length || 0}건
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <p>로딩 중...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>이름</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>시험 종류</TableHead>
                        <TableHead>점수</TableHead>
                        <TableHead>신청 상태</TableHead>
                        <TableHead>결제 상태</TableHead>
                        <TableHead>신청일</TableHead>
                        <TableHead>관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications?.map((app: any) => (
                        <TableRow key={app.id}>
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
        </Tabs>

        {/* 거부 사유 입력 모달 */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>입회 신청 거부</DialogTitle>
              <DialogDescription>
                거부 사유를 입력해주세요. 신청자가 마이페이지에서 확인할 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectReason">거부 사유</Label>
                <Textarea
                  id="rejectReason"
                  placeholder="예: 제출하신 시험 점수가 입회 기준에 미달합니다."
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

