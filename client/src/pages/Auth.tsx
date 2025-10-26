import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Auth() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

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

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">RIQ Society</CardTitle>
          <CardDescription>
            상위 1% 고지능자를 위한 비영리 단체
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground mb-6">
            <p>Manus 계정으로 로그인하여</p>
            <p>RIQ Society에 입회하세요</p>
          </div>
          
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="w-full"
            size="lg"
          >
            Manus 로그인
          </Button>

          <div className="text-xs text-center text-muted-foreground mt-4">
            <p>로그인하면 자동으로 회원가입이 완료됩니다.</p>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}

