import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Mail, Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Shop() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("이메일 주소를 입력해주세요");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("유효한 이메일 주소를 입력해주세요");
      return;
    }

    setIsSubmitting(true);
    
    // TODO: Implement email notification signup API
    // For now, just show a success message
    setTimeout(() => {
      toast.success("알림 신청이 완료되었습니다! 오픈 시 이메일로 알려드리겠습니다.");
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <SEO 
        title="가게 - RIQ Society"
        description="RIQ Society 공식 가게. 곧 오픈 예정입니다."
        keywords="RIQ Society 가게, 고지능자 상품, 멘사 굿즈"
      />
      <Header />
      <div className="min-h-screen bg-background text-foreground py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            {/* Icon */}
            <div className="mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <ShoppingBag className="relative w-24 h-24 text-primary" strokeWidth={1.5} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              가게
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-center">
              곧 오픈 예정입니다
            </p>

            {/* Coming Soon Card */}
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  오픈 알림 받기
                </CardTitle>
                <CardDescription>
                  가게 오픈 시 이메일로 알려드립니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNotifyMe} className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="이메일 주소"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "처리 중..." : "신청"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    이메일 주소는 오픈 알림 목적으로만 사용됩니다
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-12 text-center max-w-2xl">
              <h2 className="text-2xl font-semibold mb-4">준비 중인 상품</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="p-4 border border-border rounded-lg">
                  <p className="font-medium text-foreground mb-2">회원 굿즈</p>
                  <p>RIQ Society 공식 굿즈 및 기념품</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="font-medium text-foreground mb-2">교육 자료</p>
                  <p>지능 검사 준비 자료 및 학습 콘텐츠</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="font-medium text-foreground mb-2">이벤트 티켓</p>
                  <p>정기 모임 및 특별 행사 티켓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

