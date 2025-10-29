import { useAuth } from "@/_core/hooks/useAuth";
import { useRole } from "@/_core/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, User, Users, LogOut, LogIn, Shield, Crown, FileText, HelpCircle, BookOpen, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_TITLE } from "@/const";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { isMember, isAdmin, canAccessResources } = useRole();
  const [, setLocation] = useLocation();

  const getLoginUrl = () => {
    const currentUrl = window.location.origin;
    return `/api/trpc/system.auth.login?redirect=${encodeURIComponent(currentUrl)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/">
          <img src="/header-logo.svg" alt="RIQ Society" className="h-12 cursor-pointer hover:opacity-80 transition-opacity" />
        </Link>

        {/* Desktop Navigation - TNS Style (No Dropdowns) */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
              홈
            </Button>
          </Link>

          {/* Hide application menu only for approved users */}
          {user?.approvalStatus !== 'approved' && (
            <Link href="/application">
              <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                입회
              </Button>
            </Link>
          )}

          {isAuthenticated && (
            <>
              <Link href="/mypage">
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                  My RIQ
                </Button>
              </Link>

              <Link href="/resources">
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary relative">
                  리소스
                  {!canAccessResources() && (
                    <span className="ml-1 text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded">
                      정회원
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/journal">
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary relative">
                  저널
                  {!canAccessResources() && (
                    <span className="ml-1 text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded">
                      정회원
                    </span>
                  )}
                </Button>
              </Link>

              <a href="https://community.riqsociety.org/" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                  커뮤니티
                </Button>
              </a>
            </>
          )}

          <Link href="/shop">
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
              가게
            </Button>
          </Link>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
              {isAdmin() && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                    <Shield className="w-4 h-4 mr-1" />
                    관리자
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-1" />
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="ml-4 pl-4 border-l border-border">
              <Button
                variant="default"
                size="sm"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <LogIn className="w-4 h-4 mr-1" />
                로그인
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
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

              {/* Hide application menu only for approved users */}
              {user?.approvalStatus !== 'approved' && (
                <Link href="/application">
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    <FileText className="mr-2 h-5 w-5" />
                    입회
                  </Button>
                </Link>
              )}

              {isAuthenticated && (
                <>
                  <Link href="/mypage">
                    <Button variant="ghost" className="w-full justify-start" size="lg">
                      <User className="mr-2 h-5 w-5" />
                      My RIQ
                    </Button>
                  </Link>

                  <Link href="/resources">
                    <Button variant="ghost" className="w-full justify-start" size="lg">
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      리소스
                      {!canAccessResources() && (
                        <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded">정회원 전용</span>
                      )}
                    </Button>
                  </Link>

                  <Link href="/journal">
                    <Button variant="ghost" className="w-full justify-start" size="lg">
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      저널
                      {!canAccessResources() && (
                        <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded">정회원 전용</span>
                      )}
                    </Button>
                  </Link>

                  <a href="https://community.riqsociety.org/" target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" className="w-full justify-start" size="lg">
                      <Users className="mr-2 h-5 w-5" />
                      커뮤니티
                    </Button>
                  </a>
                </>
              )}

              <Link href="/blog">
                <Button variant="ghost" className="w-full justify-start" size="lg">
                  <BookOpen className="mr-2 h-5 w-5" />
                  블로그
                </Button>
              </Link>

              <Link href="/faq">
                <Button variant="ghost" className="w-full justify-start" size="lg">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  FAQ
                </Button>
              </Link>

              <Link href="/shop">
                <Button variant="ghost" className="w-full justify-start" size="lg">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  가게
                </Button>
              </Link>

              {isAdmin() && (
                <Link href="/admin">
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    <Shield className="mr-2 h-5 w-5" />
                    관리자 페이지
                  </Button>
                </Link>
              )}

              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  size="lg"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  로그아웃
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  size="lg"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  로그인 / 회원가입
                </Button>
              )}
            </nav>

            {isAuthenticated && user && (
              <div className="absolute bottom-8 left-6 right-6">
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    {user.name || '회원'}님
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {isAdmin() && (
                      <span className="inline-flex items-center text-xs bg-gray-500/20 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                        <Shield className="w-3 h-3 mr-1" />
                        관리자
                      </span>
                    )}
                    {isMember() && !isAdmin() && (
                      <span className="inline-flex items-center text-xs bg-gray-500/20 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                        <Crown className="w-3 h-3 mr-1" />
                        정회원
                      </span>
                    )}
                    {!isMember() && !isAdmin() && (
                      <span className="text-xs text-muted-foreground">일반 회원</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

