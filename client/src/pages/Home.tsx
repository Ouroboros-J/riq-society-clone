import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import GalaxyBackground from "@/components/GalaxyBackground";
import Header from "@/components/Header";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground">
        <GalaxyBackground />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center z-10">
          <img src="/riq-logo.svg" alt="RIQ Society Logo" className="w-[280px] md:w-[400px] mx-auto mb-8" />
          <h1 className="text-lg tracking-[0.1em] mb-8 text-white font-light" style={{ fontSize: '18px' }}>
            PRO IIS QUI ULTRA COGITANT
          </h1>
        </div>
        <div className="absolute bottom-8 animate-bounce">
          <svg
            className="w-6 h-6 text-muted-foreground"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Main Intro Section */}
      <section className="relative px-10 bg-background" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="container max-w-[900px] mx-auto text-center z-10">
          <h2 className="font-semibold mb-2" style={{ fontSize: '32px', letterSpacing: '3px', color: '#ffffff' }}>
            "그 이상을 생각하는 이들을 위해"
          </h2>
          <p className="mb-12 font-light" style={{ fontSize: '18px', color: '#ffffff' }}>RIQ Society</p>
          
          <div className="space-y-6 mb-8" style={{ fontSize: '18px', lineHeight: '1.8' }}>
            <p>
              The RIQ Society 는 표준화된 지능검사에서 표준편차 15 기준 135점 이상, 즉 지능 상위 1% 이내인 모든 개인에게 열려 있는 비영리 고지능단체입니다.
            </p>
            <p>
              우리는 단순히 친목 도모만을 목적으로 하지 않습니다. 우리는 1% 이내의 고지능자에게 완전한 지적 자유를 주는 것을 목표로 합니다.
            </p>
            <p>
              RIQ는 1%의 고지능자를 서로 연결하고, 모든 고급 정보들에 대한 접근 권한을 부여하며, 나아가 세계에 진정한 가치를 창출할 것입니다.
            </p>
            <p>
              우리는 입회 자격이 있는 고지능자들을 면밀히 심사할 것이며, 이후 통과자들에게 정회원 자격을 부여할 것입니다.
            </p>
          </div>

          <div className="border-t border-b border-border py-6 my-8">
            <p className="text-lg font-medium">
              상위 1% 이내의 고지능자만 입회가 허가됩니다.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              *SD15 135 or SD24 156 이상
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground min-w-[200px]"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  로그인 / 회원가입
                </Button>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    환영합니다, <span className="font-semibold text-foreground">{user?.name || '회원'}님</span>
                  </p>
                  {user?.role === 'admin' && (
                    <p className="text-xs text-primary mt-1">관리자</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                  <Link href="/mypage">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground min-w-[200px]"
                    >
                      마이페이지
                    </Button>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground min-w-[200px]"
                      >
                        관리자 페이지
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground min-w-[200px]"
                    onClick={() => logout()}
                  >
                    로그아웃
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Admission Section */}
      <section className="relative px-10 bg-background" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="container max-w-[900px] mx-auto z-10">
          <div className="flex items-center gap-5 mb-6">
            <div className="flex items-center justify-center">
              <img src="/riq-icon.svg" alt="R Icon" className="w-11 h-11" />
            </div>
            <h2 className="font-semibold" style={{ fontSize: '28px', color: '#ffffff' }}>Admission</h2>
          </div>
          
          <p className="mb-10 max-w-3xl" style={{ fontSize: '18px', lineHeight: '1.8', textIndent: '1.5em' }}>
            RIQ Society에 입회하기 위해서는, <strong>전 세계 상위 1% 이내의 지적 능력</strong>을 지녔음을 본 단체에 입증해야 합니다. 입회 절차에서 인정하는 시험은 아래와 같습니다.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: 표준 지능 검사 */}
            <div className="border border-border rounded-lg p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: '#2a2a2a' }}>
              <h3 className="font-medium mb-5 pb-4 border-b" style={{ fontSize: '18px', color: '#d0d0d0', borderColor: '#3a3a3a' }}>
                표준 지능 검사
              </h3>
              <ul className="space-y-4" style={{ fontSize: '16px', lineHeight: '1.5', color: '#bbb' }}>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span className="font-semibold">RIQ Admission Test, SD15 135</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Cattell, IQ 156</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>California Test of Mental Maturity (CTMM), IQ 137</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Mensa Admission Test, 99%</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Reynolds Adaptive Intelligence Test (RAIT), IQ 135</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Reynolds Intellectual Assessment Scales (RIAS), IQ 135</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Stanford-Binet, IQ 137</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Stanford-Binet 5, IQ 135</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Wechsler Intelligence Scale (WAIS, WISC, WPPSI), IQ 135</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Woodcock-Johnson (I, II, III) Tests of Cognitive Abilities, IQ 137</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Woodcock-Johnson IV Tests of Cognitive Abilities, IQ 135</span>
                </li>
              </ul>
            </div>

            {/* Card 2: 학업 및 인지 능력 검사 */}
            <div className="border border-border rounded-lg p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: '#2a2a2a' }}>
              <h3 className="font-medium mb-5 pb-4 border-b" style={{ fontSize: '18px', color: '#d0d0d0', borderColor: '#3a3a3a' }}>
                학업 및 인지 능력 검사
              </h3>
              <ul className="space-y-4" style={{ fontSize: '16px', lineHeight: '1.5', color: '#bbb' }}>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Cognitive Abilities Test (CogAT), 99%</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Differential Ability Scales (DAS), GCA 137</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Differential Ability Scales - Second Edition (DAS-II), GCA 135</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Naglieri Nonverbal Ability Test (NNAT), 99%</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Naglieri Nonverbal Ability Test 2 & 3 (NNAT2/NNAT3), 99%</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Otis Lennon School Abilities Test (OLSAT), Total SAI 138</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Miller Analogies Test (MAT), 99%</span>
                </li>
              </ul>
            </div>

            {/* Card 3: 대학 및 대학원 진학 시험 */}
            <div className="border border-border rounded-lg p-6 md:col-span-2 lg:col-span-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: '#2a2a2a' }}>
              <h3 className="font-medium mb-5 pb-4 border-b" style={{ fontSize: '18px', color: '#d0d0d0', borderColor: '#3a3a3a' }}>
                대학 및 대학원 진학 시험
              </h3>
              <ul className="space-y-4" style={{ fontSize: '16px', lineHeight: '1.5', color: '#bbb' }}>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>American College Testing Program (ACT), 30 (adminstered on or after October 1989)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>American College Testing Program (ACT), 29 (administered prior to October 1989)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Graduate Record Exam (GRE) (V + Q), 327 (administered on or after August 2011)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Graduate Record Exam (GRE) (V + Q + A), 1950 (administered prior to October 2001)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Graduate Record Exam (GRE) (V + Q), 1300 (administered prior to October 2001)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Graduate Management Admission Test (GMAT), 760 (administered prior to 1 February 2024)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Graduate Management Admission Test Focus Edition (GMAT Focus Edition), 715 (administered on or after 1 February 2024)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Law School Admission Test (LSAT), 172 (administered on or after June 1991)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Law School Admission Test (LSAT), 41 (99th percentile) (administered between 1982 and 1991)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Law School Admission Test (LSAT), 694 (administered prior to June 1982)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Scholastic Aptitude Test (SAT), 1370 (administered between 1995 and 2005)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: '#666' }}>›</span>
                  <span>Scholastic Aptitude Test (SAT), 1330 (administered prior to April 1995)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-4 bg-black border-t border-border">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 RIQ Society. All rights reserved.</p>
        </div>
      </footer>
      </div>
    </>
  );
}
