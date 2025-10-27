import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();


  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.listUsers.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: pendingPayments, isLoading: paymentsLoading, refetch: refetchPayments } = trpc.admin.listPendingPayments.useQuery(undefined, {
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

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">회원 관리</TabsTrigger>
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

