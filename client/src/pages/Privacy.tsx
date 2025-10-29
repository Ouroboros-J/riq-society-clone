import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function Privacy() {
  return (
    <>
      <SEO 
        title="개인정보 처리방침"
        description="RIQ Society의 개인정보 처리방침입니다."
        keywords="RIQ Society, 개인정보, 처리방침, 프라이버시"
      />
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">개인정보 처리방침</h1>
            
            <div className="space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. 개인정보의 수집 및 이용 목적</h2>
                <p>
                  RIQ Society는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                  <li>회원 가입 및 관리: 회원 자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지</li>
                  <li>서비스 제공: 콘텐츠 제공, 맞춤 서비스 제공, 본인인증</li>
                  <li>마케팅 및 광고 활용: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. 수집하는 개인정보 항목</h2>
                <p>
                  RIQ Society는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                  <li>필수항목: 이름, 이메일, 생년월일, 시험 종류, 시험 점수</li>
                  <li>선택항목: 프로필 사진, 연락처</li>
                  <li>자동 수집 항목: IP 주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. 개인정보의 보유 및 이용 기간</h2>
                <p>
                  RIQ Society는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                  <li>회원 정보: 회원 탈퇴 시까지</li>
                  <li>서비스 이용 기록: 3년</li>
                  <li>결제 기록: 5년 (전자상거래법)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. 개인정보의 제3자 제공</h2>
                <p>
                  RIQ Society는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. 정보주체의 권리·의무 및 행사방법</h2>
                <p>
                  정보주체는 RIQ Society에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                  <li>개인정보 열람 요구</li>
                  <li>오류 등이 있을 경우 정정 요구</li>
                  <li>삭제 요구</li>
                  <li>처리정지 요구</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. 개인정보 보호책임자</h2>
                <p>
                  RIQ Society는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p><strong>개인정보 보호책임자</strong></p>
                  <p>이메일: privacy@riqsociety.org</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. 개인정보 처리방침 변경</h2>
                <p>
                  이 개인정보 처리방침은 2025년 10월 29일부터 적용됩니다. 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

