import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, User, Users, LogOut, LogIn } from "lucide-react";
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

              {isAuthenticated ? (
                <>
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

