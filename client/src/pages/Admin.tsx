import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: users, isLoading: usersLoading } = trpc.admin.listUsers.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      setLocation("/");
    }
  }, [isAuthenticated, user, loading, setLocation]);

  if (loading || usersLoading) {
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
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">관리자 페이지</h1>
          <p className="text-muted-foreground">RIQ Society 회원 관리</p>
        </div>

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
                  <TableHead>가입일</TableHead>
                  <TableHead>마지막 로그인</TableHead>
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
                    <TableCell>{new Date(u.createdAt).toLocaleDateString('ko-KR')}</TableCell>
                    <TableCell>{new Date(u.lastSignedIn).toLocaleDateString('ko-KR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button variant="outline" onClick={() => setLocation("/")}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}

