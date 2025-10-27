import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, User, Users, LogOut, LogIn, HelpCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_TITLE } from "@/const";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const getLoginUrl = () => {
    const currentUrl = window.location.origin;
    return `/api/trpc/system.auth.login?redirect=${encodeURIComponent(currentUrl)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link href="/">
          <img src="/header-logo.svg" alt="RIQ Society" className="h-12 cursor-pointer hover:opacity-80 transition-opacity" />
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>메뉴</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start" size="lg">
                  <Home className="mr-2 h-5 w-5" />
                  홈
                </Button>
              </Link>

              <Link href="/faq">
                <Button variant="ghost" className="w-full justify-start" size="lg">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  FAQ
                </Button>
              </Link>

              <Link href="/blog">
                <Button variant="ghost" className="w-full justify-start" size="lg">
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  블로그
                </Button>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link href="/resources">
                    <Button variant="ghost" className="w-full justify-start" size="lg">
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      리소스
                      {user?.approvalStatus !== 'approved' || user?.paymentStatus !== 'confirmed' ? (
                        <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded">정회원 전용</span>
                      ) : null}
                    </Button>
                  </Link>
                  <Link href="/mypage">
                    <Button variant="ghost" className="w-full justify-start" size="lg">
                      <User className="mr-2 h-5 w-5" />
                      마이페이지
                    </Button>
                  </Link>



                  {user?.role === 'admin' && (
                    <Link href="/admin">
                      <Button variant="ghost" className="w-full justify-start" size="lg">
                        <Users className="mr-2 h-5 w-5" />
                        관리자 페이지
                      </Button>
                    </Link>
                  )}

                  <a href="https://community.riqsociety.org/" target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" className="w-full justify-start" size="lg">
                      <Users className="mr-2 h-5 w-5" />
                      커뮤니티
                    </Button>
                  </a>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="lg"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="lg"
                    onClick={() => window.location.href = getLoginUrl()}
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    로그인 / 회원가입
                  </Button>
                </>
              )}
            </nav>

            {isAuthenticated && user && (
              <div className="absolute bottom-8 left-6 right-6">
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    {user.name || '회원'}님
                  </p>
                  {user.role === 'admin' && (
                    <p className="text-xs text-primary mt-1">관리자</p>
                  )}
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

