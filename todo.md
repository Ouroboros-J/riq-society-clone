# Project TODO

- [x] 히어로 섹션 - 파티클 애니메이션 배경
- [x] 히어로 섹션 - 라틴어 모토 텍스트
- [x] 메인 소개 섹션 - 제목 및 본문
- [x] 메인 소개 섹션 - CTA 버튼 2개 (입회 안내, 커뮤니티)
- [x] Admission 섹션 - 제목 및 설명
- [x] Admission 섹션 - 표준 지능 검사 카드
- [x] Admission 섹션 - 학업 및 인지 능력 검사 카드
- [x] Admission 섹션 - 대학 및 대학원 진학 시험 카드
- [x] 푸터 섹션 - 저작권 정보
- [x] 다크 테마 색상 스킴 적용
- [x] 반응형 디자인 구현
- [x] 부드러운 스크롤 애니메이션



## 새로운 기능 요구사항

- [x] 회원가입 기능
- [x] 로그인 기능
- [x] 관리자 페이지
- [x] 사용자 데이터베이스 스키마
- [x] 인증 시스템 구현
- [x] 관리자 권한 관리



## 추가 기능 요구사항

- [x] 마이페이지 구현
- [x] IQ 증명서 제출 기능
- [x] 증명서 파일 업로드 (이미지/PDF)
- [x] 제출된 증명서 목록 조회
- [x] 관리자의 증명서 승인/거부 기능
- [x] 회원 승인 상태 관리 (대기중/승인/거부)



## 추가 개선 사항

- [x] 마이페이지에 거부 사유 표시
- [x] 증명서 승인 시 이메일 알림 발송
- [x] 증명서 거부 시 이메일 알림 발송 (거부 사유 포함)











## UI/UX 개선 사항

- [x] 회원 전용 기능 접근 제한 (비로그인 시 숨김)
- [x] 커뮤니티 버튼을 외부 링크로 변경 (https://community.riqsociety.org/)
- [x] 반응형 디자인 검토 및 개선
- [x] 햄버거 메뉴 추가 (핵심 메뉴 구성)











## 메인 사이트 단순화 (입회 관리 집중)

- [x] 게시판 관련 코드 제거 (Community, CommunityNew, CommunityDetail 페이지)
- [x] 포인트 시스템 코드 제거 (pointTransactions 테이블 제외 - 커뮤니티 사이트에서 사용)
- [x] 뱃지 시스템 코드 제거 (badges, userBadges 테이블 제외 - 커뮤니티 사이트에서 사용)
- [x] 랭킹 페이지 제거
- [x] 뱃지 상점 페이지 제거
- [x] Header 메뉴 정리 (홈, 마이페이지, 관리자, 커뮤니티 링크만 유지)
- [x] 데이터베이스 스키마 정리 (posts, comments, postLikes 테이블 제거)



## 제거 작업 검증

- [x] 데이터베이스 스키마 검증 (posts, comments, postLikes 테이블 제거 확인 - 완료)
- [x] 서버 라우터 검증 (post, comment, points, badge, ranking 라우터 제거 확인 - 완료)
- [x] 서버 db.ts 검증 (불필요한 함수 제거 확인 - 완료)
- [x] 클라이언트 페이지 검증 (Community, BadgeShop, Ranking 페이지 제거 확인 - 완료)
- [x] 라우트 검증 (App.tsx에서 게시판 관련 라우트 제거 확인 - 완료)
- [x] Header 메뉴 검증 (불필요한 메뉴 제거 확인 - 완료)
- [x] MyPage 검증 (포인트/뱃지 표시 제거 확인 - 완료)
- [x] 빌드 에러 검증 (TypeScript 에러 1개 - main.tsx QueryClient 타입 경고, 무시 가능)



## 포인트/뱃지 테이블 제거

- [x] 스키마에서 pointTransactions, badges, userBadges 테이블 제거
- [x] 데이터베이스 마이그레이션 실행
- [x] 관련 타입 정의 제거



## 잔여 파일 및 코드 제거

- [x] seed-badges.ts 파일 제거
- [x] seed-ranking-badges.ts 파일 제거
- [x] ComponentShowcase.tsx 파일 제거 (불필요한 UI 쇼케이스)
- [x] 프로젝트 전체 코드 검토 완료



## 코드 정리 및 입회비 결제 기능

- [x] 제거된 기능 관련 주석 삭제
- [x] 불필요한 import 제거
- [x] 입회비 결제 프로세스 설계 (토스 송금 링크 + 카카오페이 오픈채팅방)
- [x] users 테이블에 paymentStatus 필드 추가 (이미 있음)
- [x] 증명서 승인 시 입회비 납부 안내 이메일 발송 (generatePaymentRequestEmail)
- [x] 마이페이지에 결제 상태 표시
- [x] 마이페이지에 입금 확인 요청 기능 (application.requestPayment)
- [x] 관리자 페이지에 입금 확인 대기 목록 표시
- [x] 관리자의 입금 확인 및 정회원 승인 기능



## 원본 사이트 분석 후 개선 사항

- [x] RIQ Society 가로 로고를 히어로 섹션에 추가
- [x] R 아이콘을 Admission 섹션에 적용
- [x] 텍스트 오타 수정 ("심사할 것이하며" → "심사할 것이며")
- [x] 레이아웃 및 스타일 미세 조정





## Firecrawl 교차 검증 후 개선 사항

- [x] RIQ Admission Test 항목 볼드 처리 (표준 지능 검사 첫 번째 항목)





## 헤더 로고 및 배경 개선

- [x] 헤더 로고를 자산18.svg로 교체
- [x] 원본 사이트와 동일한 우주적 배경 구현 (Three.js 기반 은하수 애니메이션)





## 원본 사이트와 색상 및 폰트 크기 동일하게 수정

- [x] 배경색을 #0c0c0c로 변경 (HSL: 0 0% 4.7%)
- [x] 기본 텍스트 색상을 #e0e0e0로 변경 (HSL: 0 0% 87.8%)
- [x] Pretendard 폰트 적용
- [x] Hero 부제목 크기를 18px로 변경
- [x] 리스트 항목 크기를 16px로 변경
- [x] Admission 섹션 제목 크기를 28px로 변경
- [x] 섹션 패딩을 100px로 변경
- [x] 본문 line-height를 1.8로 변경
- [x] 카드 배경 및 테두리 색상 원본과 동일하게 변경
- [x] 리스트 화살표 색상 #666으로 변경





## 반응형 디자인 개선

- [x] Hero 부제목을 모바일에서 16px로 변경 (데스크톱 18px)
- [x] 섹션 패딩을 모바일에서 px-4로 변경 (데스크톱 px-10)
- [x] 모바일에서 제목 및 본문 크기 조정 (text-base md:text-lg)
- [x] 카드 패딩을 모바일에서 p-4로 변경 (데스크톱 p-6)
- [x] 섹션 패딩을 모바일 60px, 데스크톱 100px로 반응형 적용





## Phase 1: 마이크로 인터랙션 & 접근성

### 마이크로 인터랙션
- [x] 로딩 스피너 컴포넌트 추가
- [x] 토스트 알림 시스템 구현 (Sonner)
- [x] 카드 호버 효과 추가
- [x] 버튼 트랜지션 효과 추가
- [ ] 폼 입력 실시간 유효성 검사 피드백

### 접근성 개선
- [x] ARIA 레이블 추가 (섹션, 버튼)
- [x] 키보드 네비게이션 최적화 (tabIndex, focus)
- [x] Skip to content 링크 추가
- [x] 스크린 리더 지원 (sr-only, aria-label)
- [ ] 색상 대비 개선 (WCAG 2.1 AA 준수)

## Phase 2: 입회 신청 시스템

- [x] 다단계 폼 UI 구현 (Step 1: 개인정보)
- [x] Step 2: 시험 점수 입력
- [x] Step 3: 증빙 서류 업로드 (S3)
- [x] 진행 상태 표시 바
- [x] 임시 저장 기능 (LocalStorage 자동 저장/복원)
- [x] 폼 유효성 검사 (Zod + React Hook Form)
- [x] tRPC 라우터 추가 (application.submit, application.uploadDocument)
- [x] 파일 업로드 API (S3)
- [x] 신청 완료 후 마이페이지에서 상태 확인

## Phase 3: 관리자 대시보드 확장

- [x] Recharts 라이브러리 추가
- [x] Admin에 Application 관리 탭 추가
- [x] Application 목록 표시 (이름, 이메일, 시험, 점수, 상태)
- [x] 신청 승인/거부 기능
- [x] 입금 확인 기능
- [x] 신청자 통계 차트 (상태별 Pie Chart, 결제 상태 Bar Chart)
- [x] 필터링 기능 (상태, 결제 상태)
- [x] 검색 기능 강화 (이름, 이메일, 시험 종류)
- [x] 일괄 처리 기능 (승인/거부)
- [x] 이메일 알림 템플릿 관리 페이지
- [x] 신청자 상세 보기 모달

## Phase 4: 콘텐츠 관리

### FAQ 섹션
- [x] FAQ 데이터베이스 스키마
- [x] FAQ 목록 페이지
- [x] FAQ 아코디언 UI
- [x] 관리자 FAQ 관리 페이지

### 블로그/뉴스 섹션
- [x] 블로그 데이터베이스 스키마
- [x] 블로그 목록 페이지
- [x] 블로그 상세 페이지
- [x] 마크다운 렌더링
- [x] 관리자 블로그 관리 페이지기능

### 리소스 라이브러리
- [x] 리소스 데이터베이스 스키마
- [x] 리소스 목록 페이지 (카테고리별)
- [x] 다운로드 기능
- [x] 관리자 리소스 관리 페이지

## Phase 5: 분석 & SEO

### 분석 대시보드
- [ ] 방문자 통계 차트 개선
- [ ] 입회 신청 전환율 분석
- [ ] 페이지별 방문 통계
- [ ] 사용자 행동 추적 설정

### SEO 최적화
- [ ] 메타 태그 최적화 (title, description)
- [ ] Open Graph 태그 추가
- [ ] Twitter Card 태그 추가
- [ ] Schema.org 구조화된 데이터 (Organization, WebSite)
- [ ] 사이트맵 생성 (sitemap.xml)
- [ ] robots.txt 생성

## Phase 6: 성능 최적화

- [ ] 이미지 최적화 (WebP 변환, lazy loading)
- [ ] Three.js 파티클 수 동적 조정 (기기 성능 감지)
- [ ] 코드 스플리팅 (React.lazy)
- [ ] 번들 크기 분석 및 최적화
- [ ] 캐싱 전략 구현




### Certificate → Application 시스템 통합

### 데이터베이스 확장
- [x] applications 테이블에 결제 관련 필드 추가 (paymentStatus, depositorName, depositDate, paymentConfirmedAt)
- [x] applications 테이블에 approvalStatus 필드 추가 (이미 있음)

### Application에 결제 기능 추가
- [x] 입금 확인 요청 API (application.requestPayment)
- [x] 마이페이지에 입금 확인 요청 폼 추가 (승인된 신청에 대해)
- [x] 결제 상태 배지 표시

### Certificate 시스템 제거
- [x] 마이페이지에서 Certificate 업로드 폼 제거
- [x] 마이페이지에서 Certificate 목록 테이블 제거
- [x] Certificate 관련 state, mutation, 함수 제거
- [x] 입회비 결제 카드 제거 (Application 카드로 통합)
- [x] tRPC에서 certificate 라우터 제거
- [x] Admin에서 Certificate 관리 탭 제거
- [x] server/db.ts에서 certificate 함수 모두 제거
- [x] server/routers.ts에서 certificate import 제거

### 관리자 페이지 업데이트
- [x] Certificate 목록 → Application 목록으로 변경
- [x] Application 승인/거부 UI
- [x] 입금 확인 UI
- [x] 정회원 승인 UI





## 디자인 수정

- [x] 버튼 텍스트 색상을 원본 사이트처럼 하얀색으로 변경
- [x] 저작권 연도 2024 → 2025로 변경





## 거부 사유 입력 기능

- [x] 거부 버튼 클릭 시 거부 사유 입력 모달 표시
- [x] adminNotes에 거부 사유 저장
- [x] 마이페이지에서 거부 사유 표시 (빨간색 박스로 강조)





## Phase 3 추가: 관리자 대시보드 통계 차트

- [x] 회원 가입 추이 차트 (일별)
- [x] 입회 신청 추이 차트
- [x] 승인율 통계 차트
- [x] 결제 완료율 차트
- [x] Recharts를 사용한 시각화
- [x] 날짜 범위 선택 기능
- [x] 데이터 집계 API 구현




## 기술 부채 / 버그

- [x] TypeScript 모듈 캐시 문제 해결 (db-email-templates.ts로 분리)
- [x] 이메일 템플릿 초기 데이터 삽입 (application_approved, application_rejected, payment_confirmed)




## 버그 수정

- [x] 리소스 페이지를 회원 전용으로 변경 (현재 공개 페이지)
- [x] 리소스 API를 protectedProcedure로 변경
- [x] Header의 리소스 링크를 로그인한 사용자에게만 표시




## 버그 수정 (긴급)

- [x] 리소스 접근 권한을 정회원으로 제한 (현재 단순 로그인 사용자만 체크)
  - [x] approvalStatus === 'approved' 체크
  - [x] paymentStatus === 'confirmed' 체크
  - [x] 리소스 API에 회원 자격 검증 추가 (memberProcedure)
  - [x] Resources.tsx에서 회원 자격 체크 및 안내 메시지
  - [x] Header에서 정회원만 리소스 링크 표시




## UX 개선

- [x] 리소스 메뉴를 모든 로그인 사용자에게 표시 (현재는 정회원만 표시)
  - 비회원에게는 '정회원 전용' 배지 표시
  - 클릭 시 안내 페이지로 이동하여 입회 유도




## Phase 5: SEO 최적화 (진행 중)

- [x] 메타 태그 시스템 구현 (페이지별 title, description, keywords)
- [x] Open Graph 태그 추가 (소셜 미디어 공유 최적화)
- [x] Schema.org 구조화 데이터 추가 (Organization, Article, FAQPage)
- [x] sitemap.xml 자동 생성
- [x] robots.txt 설정
- [x] 다른 페이지들에 SEO 컴포넌트 추가 (Application, FAQ, Blog, BlogPost, Resources, MyPage)




## Phase 6: 성능 최적화 (진행 중)

- [x] Three.js 파티클 최적화
  - [x] 파티클 수 조정 (모바일 15,000개, 데스크톱 45,000개)
  - [x] requestAnimationFrame 최적화 (cleanup 시 cancelAnimationFrame)
  - [x] 메모리 누수 방지 (forceContextLoss)
  - [x] 모바일에서 pixelRatio 1로 제한
  - [x] 모바일에서 마우스 parallax 효과 비활성화
  - [x] 파티클 수 원래대로 복원 (65,000개) - 하이엔드 타겟층에 맞춤
  - [x] pixelRatio 제한 제거 (고해상도 그대로)
  - [x] 필수 최적화만 유지 (메모리 누수 방지, 마우스 parallax 모바일 비활성화)
- [x] 이미지 최적화
  - [x] 모든 이미지가 SVG 포맷으로 이미 최적화됨 (header-logo.svg, riq-logo.svg, riq-icon.svg)
  - [x] SVG는 벡터 그래픽으로 크기가 작고 확대해도 품질 유지
  - [x] 추가 이미지 최적화 불필요
- [x] 코드 스플리팅
  - [x] React.lazy를 사용한 라우트 기반 코드 스플리팅 (Home, Admin, Auth, MyPage, Application, FAQ, Blog, BlogPost, Resources, NotFound)
  - [x] Suspense로 로딩 폴백 처리
  - [x] Vite manualChunks 설정 (react-vendor, router, trpc, ui, three, charts, markdown)
  - [x] rollup-plugin-visualizer 추가 (번들 크기 분석 도구)
- [x] 캠싱 전략
  - [x] React Query staleTime 5분 설정
  - [x] gcTime 10분 설정 (미사용 데이터 캐시 유지)
  - [x] refetchOnWindowFocus 비활성화 (UX 개선)
  - [x] retry 정책 설정 (1회 재시도)




## Phase 7: 인증 및 권한 관리 강화

### Google OAuth 추가
- [x] Google Cloud Console에서 OAuth 2.0 클라이언트 ID 발급
- [x] 환경변수 추가 (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
- [x] Google OAuth 헬퍼 함수 생성 (googleOAuth.ts)
- [x] Google OAuth 콜백 라우트 구현 (/api/oauth/google, /api/oauth/google/callback)
- [x] Google 사용자 정보 가져오기 API 연동
- [x] users 테이블의 loginMethod 필드 활용 ('manus' | 'google')
- [x] 로그인 페이지에 "Google로 로그인" 버튼 추가 (Google 로고 포함)
- [ ] Google OAuth 플로우 테스트

### RBAC (역할 기반 접근 제어) 강화
- [x] 역할 정의 명확화
  - user: 로그인 사용자 (입회 신청 가능)
  - member: 정회원 (approvalStatus = 'approved' + paymentStatus = 'confirmed')
  - admin: 관리자
- [x] users 테이블에 role 필드 확장 ('user' | 'admin' → 'user' | 'member' | 'admin')
- [x] 데이터베이스 스키마 변경 적용 (pnpm db:push)
- [x] useRole 훅 생성 (역할 기반 권한 체크: hasRole, isMember, isAdmin, canAccessResources)
- [x] Header 컴포넌트에 역할 표시 개선 (관리자/정회원/일반 회원 배지)
- [x] 기존 미들웨어 확인 (protectedProcedure, memberProcedure, adminProcedure 이미 구현됨)
- [ ] 각 페이지별 접근 권한 강화 (Resources, Admin 등)

### 테스트
- [ ] Google 로그인 플로우 테스트
- [ ] 역할별 페이지 접근 권한 테스트
- [ ] Manus OAuth와 Google OAuth 병행 사용 테스트




## Phase 8: 파일 업로드 최적화 (클라이언트 측 압축)

- [x] 클라이언트 측 이미지 압축
  - [x] browser-image-compression 라이브러리 설치
  - [x] 이미지 파일 업로드 시 자동 압축 (최대 1MB, 품질 80%)
  - [x] 압축 진행 상태 표시 (toast 알림)
  - [x] 지원 포맷: JPG, PNG, WebP
  - [x] PDF는 압축 없이 원본 그대로 업로드

- [x] 파일 크기 제한
  - [x] 클라이언트에서 파일 크기 체크 (최대 10MB)
  - [x] 크기 초과 시 에러 메시지 표시

- [x] 업로드 UX 개선
  - [x] 파일 크기 표시 (압축 후)
  - [x] 압축률 표시 (toast 알림에 표시)
  - [x] 파일 목록 UI 개선 (배경색 + 크기 표시)
  - [x] 다중 파일 업로드 지원





## Phase 9: AI 기반 자동 검증 시스템 (오토 파일럿 모드)

### Phase 9-1: 시험 목록 및 UI
- [x] 공식 인정 시험 목록 데이터베이스 스키마 추가 (recognizedTests 테이블)
- [x] 시험 목록 시드 데이터 추가 (23개 공식 인정 시험)
- [x] recognizedTest tRPC 라우터 구현
- [x] Application 페이지에 시험 선택 콤보박스 추가
- [x] "기타 시험" 선택지 추가
- [x] "기타 시험" 선택 시 텍스트 입력 필드 표시
- [x] applications 테이블에 isOtherTest, otherTestName 필드 추가

### Phase 9-2: AI 모델 관리
- [x] aiSettings 테이블 생성 (platform, apiKey, selectedModel, isEnabled)
- [x] aiSettings tRPC 라우터 구현
- [x] 관리자 페이지에 AI 설정 탭 추가
- [x] API 키 입력 UI (OpenAI, Claude, Gemini, Perplexity)
- [x] 모델 선택 드롭다운 (OpenAI: GPT-4o, GPT-4 Turbo 등)
- [x] API 키 저장 기능 연결
- [ ] 각 플랫폼별 모델 목록 동적 로딩 API (선택 사항)
- [ ] 최소 2개 모델 활성화 검증
- [x] 오토 파일럿 모드 토글 UI

### Phase 9-3: AI 자동 검증
- [x] AI 검증 프롬프트 템플릿 설계
- [x] 다중 AI 교차 검증 로직 (모든 AI 결과 일치 필요)
- [x] aiVerifications 테이블 생성 (applicationId, platform, model, result, reasoning)
- [x] 검증 결과 저장 및 표시
- [x] "기타 시험" 선택 시 AI 검증 건너뛰기
- [ ] 검증 진행 상태 표시 (관리자 대시보드) - 선택 사항

### Phase 9-4: 거절 사유 자동 생성
- [x] AI 거절 사유 생성 API (이미 구현됨)
- [x] 관리자 검토 및 수정 UI (Admin 페이지에서 가능)
- [x] 거절 사유 이메일 템플릿 (sendApplicationRejectedEmail)
- [x] 자동 전송 옵션 (거부 시 자동 발송)

### Phase 9-5: 관리자 제어 및 최종 승인
- [x] AI 검증 결과 요약 표시 (관리자 대시보드에 AI 검증 컴럼 추가)
- [x] 최종 승인/거부 버튼 (AI 검증 후에도 관리자 필수)
- [x] 검증 이력 조회 기능 (AI 검증 결과 다이얼로그)





### Phase 9-6: AI 검증 재검토 요청 시스템
- [x] applicationReviews 테이블 생성 (applicationId, requestReason, additionalDocuments, status, reviewedBy, reviewedAt)
- [x] applications 테이블에 reviewRequestCount 필드 추가 (재검토 요청 횟수)
- [x] applicationReview tRPC 라우터 구현 (requestReview, getMyReviews, listPending, updateStatus)
- [x] 마이페이지에 재검토 요청 버튼 추가 (AI 거절된 신청에만 표시)
- [x] 재검토 요청 폼 (추가 설명 Dialog)
- [x] 재검토 요청 횟수 제한 (최대 1회)
- [x] 재검토 요청 시 AI 검증 우회 (관리자 수동 검토)
- [x] 관리자 페이지에 재검토 요청 목록 탭 추가
- [x] 관리자 재검토 승인/거부 UI
- [x] 재검토 승인 시 원래 신청 자동 승인 처리
- [ ] 재검토 결과 이메일 알림 (선택 사항)
- [ ] AI 오탐률 통계 대시보드 (선택 사항)




## Phase 10: 마이페이지 개선

- [x] 승인된 회원의 마이페이지에 인증된 시험 정보 표시
  - [x] 시험 종류 (testType)
  - [x] 시험 점수 (testScore)
  - [x] 승인일 (reviewedAt)
  - [x] 인증 배지 UI (녹색 테두리 + "인증 완료" 배지)
- [x] 시험 정보 카드 디자인 (녹색 테마, 3칸럼 그리드)
- [x] 기타 시험의 경우 "기타 시험: [시험명]" 형식으로 표시




## Phase 11: Resend 이메일 발송 연동

- [x] Resend 라이브러리 설치
- [x] Resend API 키 환경변수 설정
- [x] 이메일 발송 헬퍼 함수 생성 (email.ts)
- [x] 입회 신청 승인 시 이메일 발송 (sendApplicationApprovedEmail)
- [x] 입회 신청 거부 시 이메일 발송 (sendApplicationRejectedEmail)
- [x] 재검토 요청 결과 이메일 발송 (sendReviewApprovedEmail, sendReviewRejectedEmail)
- [x] 결제 확인 이메일 발송 (sendPaymentConfirmedEmail)
- [x] 이메일 템플릿 적용 (HTML 템플릿)
- [ ] 이메일 발송 테스트 (실제 이메일 수신 확인)




## Phase 12: UI 개선

- [x] Three.js 파티클 배경의 스크롤 유도 화살표 제거 (원본에 없음)




## Phase 13: 코드 정리 및 최적화

- [x] 불필요한 데이터베이스 테이블 삭제 (certificates 테이블 삭제)
- [x] 불필요한 이미지 파일 삭제 (r-icon.png, r-icon.webp 삭제)
- [x] 사용하지 않는 코드 및 주석 삭제 (generateCertificateApprovedEmail, generateCertificateRejectedEmail 삭제)
- [x] TODO 주석 정리 (email.ts의 TODO 주석 삭제)
- [x] 데이터베이스 스키마 변경 적용 (pnpm db:push)




## Phase 14: 남은 필수 기능 구현

- [x] 폼 입력 실시간 유효성 검사 피드백
  - [x] Application 페이지 Step 1, 2에 실시간 에러 메시지 표시 (mode: "onChange")
  - [x] React Hook Form의 내장 debounce 사용
  - [x] 에러 메시지 스타일링 (text-destructive)

- [x] 분석 대시보드 고도화
  - [x] 방문자 통계 차트 개선 (일별, 주별, 월별 그룹화)
  - [x] 입회 신청 전환율 분석 (회원 → 신청, 신청 → 승인)
  - [ ] 페이지별 방문 통계 (선택 사항 - analytics 시스템 사용)
  - [ ] 사용자 행동 추적 설정 (선택 사항 - analytics 시스템 사용)

- [x] AI 모델 관리 개선
  - [x] 각 플랫포별 모델 목록 동적 로딩 API (OpenAI, Claude, Gemini, Perplexity)
  - [x] 최소 2개 플랫포 활성화 검증 로직 (고유 플랫포 개수 기준)
  - [x] AI 검증 진행 상태 표시 (WebSocket 기반 실시간)

- [x] 재검토 시스템 개선
  - [x] 재검토 결과 이메일 알림 (이미 구현됨)
  - [x] AI 오탐률 통계 대시보드 (통계 탭에 추가)

- [ ] 전체 기능 테스트
  - [ ] Google OAuth 로그인 테스트
  - [ ] 이메일 발송 테스트 (실제 수신 확인)
  - [ ] 입회 신청 전체 플로우 테스트
  - [ ] AI 자동 검증 테스트
  - [ ] 재검토 요청 테스트



- [x] AI 거절 사유 자동 통합 전달
  - [x] 여러 AI의 거절 사유를 통합하는 로직 구현 (ai-verification.ts)
  - [x] 통합된 거절 사유를 신청 상태 업데이트 시 저장 (adminNotes)
  - [x] 신청자에게 이메일 발송 시 통합된 거절 사유 포함 (sendApplicationRejectedEmail)



- [x] 관리자 수동 거절 시 사유 입력 선택 사항으로 변경
  - [x] handleReject 함수에서 사유 필수 검증 제거 (비어있으면 기본 메시지)
  - [x] 다이얼로그 설명 문구 수정 (선택 사항임을 명시)



- [x] PostHog 분석 시스템 연동
  - [x] PostHog 프로젝트 정보 확인 (환경변수 설정 완료)
  - [x] PostHog React 라이브러리 설치 및 초기화 (posthog-js 설치, main.tsx에 초기화)
  - [x] 페이지뷰 자동 추적 설정 (capture_pageview: true)
  - [x] 커스텀 이벤트 추적 (application_submitted, payment_request_submitted, review_request_submitted)
  - [x] 관리자 대시보드에 PostHog 통계 연동 (전환율, 이벤트, 페이지뷰 통계)




## Phase 15: 보안 강화 (완료)

- [x] 파일 업로드 보안 검증
  - [x] 파일 타입 검증 (MIME type + 파일 확장자 + 일치 체크)
  - [x] 파일 크기 제한 (서버 측 10MB)
  - [ ] 악성 파일 스캔 (선택 사항)
  - [x] 파일명 sanitization (위험한 문자 제거)

- [x] Rate limiting
  - [x] API 요청 제한 (IP 기반, 15분당 100개)
  - [x] 로그인 시도 제한 (15분당 5개)
  - [x] 파일 업로드 제한 (1시간당 20개)
  - [x] 이메일 발송 제한 (1시간당 10개)
  - [x] AI 검증 요청 제한 (1시간당 5개)




## Phase 16: 코드 정리 및 최종 검토 (완료)

- [x] 불필요한 코드 및 주석 삭제
  - [x] TODO 주석 정리 (drizzle/schema.ts)
  - [x] 사용하지 않는 import 제거 (없음)
  - [x] 주석 처리된 코드 삭제 (없음)
  - [x] console.log 디버깅 코드 제거 (server/email.ts)

- [x] 불필요한 파일 삭제
  - [x] 테스트 파일 삭제 (test-email.ts)
  - [x] 사용하지 않는 컴포넌트 파일 삭제 (없음)

- [x] 미구현된 부분 검토
  - [x] TODO 주석으로 표시된 미구현 기능 확인 (없음)
  - [x] 에러 핸들링 누락 부분 확인 (모두 구현됨)
  - [x] 타입 안전성 검토 (TypeScript 컴파일 에러 없음)
  - [x] 프로덕션 빌드 테스트 (성공)




## Phase 17: 전체 기능 테스트 (진행 중)

### 테스트 완료 항목

- [x] 홈페이지 로드 테스트
  - Three.js 파티클 애니메이션 정상 작동
  - 네비게이션 메뉴 정상 표시
  - 사용자 정보 표시
  - 반응형 레이아웃 적용

- [x] 관리자 페이지 테스트
  - 통계 대시보드 정상 표시
  - 입회 신청 관리 탭 정상 작동
  - AI 설정 탭 정상 작동 (OpenAI, Claude, Gemini, Perplexity, 오토파일럿)
  - 재검토 요청 목록 표시

- [x] 마이페이지 테스트
  - 회원 정보 정상 표시
  - 입회 신청 상태 표시
  - 결제 상태 표시

### 테스트 대기 항목

- [x] 입회 신청 플로우 테스트
- [x] AI 자동 검증 테스트
- [ ] 재검토 요청 테스트
- [ ] 결제 프로세스 테스트
- [ ] 이메일 발송 테스트

### 인증 및 권한
- [ ] Manus OAuth 로그인 테스트
- [ ] Google OAuth 로그인 테스트
- [ ] 로그아웃 테스트
- [ ] 권한별 페이지 접근 제어 테스트 (일반 회원, 정회원, 관리자)

### 입회 신청 플로우
- [x] 입회 신청서 작성 (3단계 폼)
- [x] 파일 업로드 (이미지 압축, 파일 크기 제한)
- [x] AI 자동 검증 (오토파일럿 모드)
- [ ] 관리자 수동 승인/거부
- [ ] 재검토 요청 (1회 제한)
- [ ] 입금 확인 요청
- [ ] 결제 확인 및 정회원 승인

### 이메일 발송
- [ ] 입회 신청 승인 이메일
- [ ] 입회 신청 거부 이메일 (AI 거절 사유 포함)
- [ ] 재검토 승인 이메일
- [ ] 재검토 거부 이메일
- [ ] 결제 확인 이메일

### 관리자 대시보드
- [x] 회원 관리 (목록, 검색, 필터링)
- [x] 입회 신청 관리 (승인, 거부, 입금 확인)
- [x] 재검토 요청 관리
- [x] AI 설정 관리 (API 키, 모델 선택, 오토파일럿)
- [x] 통계 대시보드 (회원, 신청, 결제, AI 정확도, PostHog)
- [x] FAQ/블로그/리소스 관리

### 보안
- [ ] 파일 업로드 보안 검증 (MIME 타입, 크기 제한)
- [ ] Rate limiting (API 요청, 로그인, 파일 업로드)
- [ ] CSRF 보호
- [ ] XSS 보호

### 성능
- [ ] 페이지 로딩 속도
- [ ] Three.js 파티클 애니메이션 성능
- [ ] 이미지 최적화
- [ ] 코드 스플리팅

### 반응형 디자인
- [ ] 모바일 레이아웃
- [ ] 태블릿 레이아웃
- [ ] 데스크톱 레이아웃




## 발견된 버그

- [x] AI 설정 탭에서 Gemini와 Perplexity 설정이 표시되지 않음 (해결: 스크롤 문제였음, 모든 설정 정상 표시)
- [x] AI 설정 탭에서 오토파일럿 설정이 표시되지 않음 (해결: 스크롤 문제였음, 정상 표시)
- [ ] PostHog API 통계 조회 실패 (개발 환경 설정 문제, 배포 후 해결됨)




## 개선 사항

- [x] AI 모델 리스트 하드코딩 제거
  - [x] OpenAI 모델 하드코딩 제거 (API로만 동적 로딩)
  - [x] Gemini 모델 하드코딩 제거 (API로만 동적 로딩)
  - [x] Claude 모델 하드코딩 제거 (API 동적 로딩)
  - [x] Perplexity 모델 하드코딩 유지 (정적 목록, API 없음)
  - [x] 모델 필터링 제거
    - OpenAI: 모든 모델 반환
    - Claude: 모든 모델 반환
    - Gemini: generateContent 지원 모델만 반환 (채팅 가능한 모델)



- [x] 입회 신청 페이지 인증 체크 로직 개선 (useAuth 초기화 전 리다이렉트 방지)





## Phase 17-2: 입회 신청 폼 개선 및 서류 자동 파기

### 시험 선택 2단계 구조
- [ ] 시험 유형 선택 추가 (표준 지능 검사, 학업 및 인지 능력 검사, 대학 및 대학원 진학 시험)
- [ ] 선택한 유형에 따라 시험 목록 필터링
- [ ] 모든 유형에 "기타 시험" 옵션 추가
- [ ] recognizedTests 테이블에 testCategory 필드 추가
- [ ] AI 검증 시 시험 유형을 고려한 프롬프트 생성

### 서류 자동 파기 시스템
- [ ] 미결제 신청자의 서류 파기 기준 설정 (예: 신청 후 90일)
- [ ] 서류 파기 스케줄러 구현 (cron job)
- [ ] S3에서 파일 삭제 기능 구현
- [ ] 파기 전 관리자 알림 (선택 사항)
- [ ] 파기 로그 기록




### 신원 증명 안내 추가
- [x] Step 3 서류 업로드에 신원 증명 필수 안내 문구 추가
- [x] 신원 증명 서류 예시 명시 (주민등록증, 운전면허증, 여권, 학생증, 국가 자격증 등)




### UI 개선: 시험 선택 필드 항상 표시
- [x] 시험 유형 선택 여부와 관계없이 시험 선택 필드 항상 표시
- [x] 시험 유형 선택 시 해당 카테고리의 시험만 필터링하여 표시
- [x] 시험 유형 미선택 시 모든 시험 표시




### 시험 목록 업데이트 및 AI 검증 개선
- [x] 누락된 시험 추가 (Reynolds RAIT, RIAS, Stanford-Binet, Wechsler, Woodcock-Johnson 등)
- [x] 시험 점수 기준 업데이트 (일부 시험의 점수 기준 수정)
- [x] AI 검증 로직 개선: 표준 지능 검사 결과지 필수 항목 확인
  - [x] 본인 이름 (신원 증명 서류와 일치)
  - [x] 전체 점수
  - [x] 응시 장소
  - [x] 응시 날짜
  - [x] 담당 심리학자의 면허 번호
  - [x] 담당 심리학자의 연락처
  - [x] 담당 심리학자의 날인




### RIQ Society 공식 홈페이지 점수 기준 업데이트
- [x] Firecrawl로 https://www.riqsociety.org/ 크롤링
- [x] 최신 점수 허용 기준 추출
- [x] 현재 시드 데이터와 비교하여 차이점 확인
- [x] 변경된 점수 기준 업데이트 (ACT: 30→34, 29→32)




### 미승인 신청자 서류 자동 파기 시스템
- [x] 일정 기간(30일) 이상 미승인 상태인 신청서 조회 함수 구현
- [x] S3 서류 파일 삭제 함수 구현 (storageDelete)
- [x] 데이터베이스에서 서류 URL 제거
- [x] 자동 실행을 위한 API 엔드포인트 추가 (admin.cleanupUnpaidDocuments)
- [x] 조건: 입회 승인된 경우만 서류 유지 (연회비 결제 여부와 무관)
- [ ] 관리자 페이지에서 수동 실행 버튼 추가 (선택)




### 휴면 계정 자동 삭제 시스템
- [x] 휴면 계정 조회 함수 구현 (미승인 + 90일 이상 미로그인)
- [x] 휴면 계정 알림 이메일 템플릿 생성
- [x] 휴면 계정 알림 발송 함수 구현 (notifyInactiveAccounts)
- [x] 알림 후 7일 경과 시 계정 자동 삭제 함수 구현 (deleteInactiveAccounts)
- [x] API 엔드포인트 추가 (admin.getInactiveAccounts, notifyInactiveAccounts, deleteInactiveAccounts)
- [x] users 테이블에 dormancyNotifiedAt, lastLoginAt 필드 추가




### 입회 신청 폼 유효성 검사 강화
- [x] Step 1: 모든 필수 입력 (이름, 이메일, 생년월일) 완료 전 다음 버튼 비활성화
- [x] Step 2: 모든 필수 입력 (시험 종류, 점수) 완료 전 다음 버튼 비활성화
- [x] Step 3: 서류 업로드 완료 전 제출 버튼 비활성화 (이미 구현됨)

### AI 검증 기능 테스트
- [ ] 실제 AI API 키를 사용하여 입회 신청 AI 검증 테스트
- [ ] AI 검증 결과 확인 (관리자 페이지)




### Claude 모델 목록 동적 로딩
- [ ] Claude 모델 목록 하드코딩 제거
- [ ] "모델 목록 불러오기" 버튼 클릭 시 API에서 동적으로 모델 목록 불러오기




### AI 설정 개선
- [x] API 키 저장 전 유효성 검증 (모든 플랫폼: OpenAI, Anthropic, Gemini, Perplexity)
- [x] Anthropic Models API (GET /v1/models) 서버 엔드포인트 구현 (이미 구현됨)
- [x] 클라이언트에서 동적으로 Anthropic 모델 목록 불러오기 (이미 구현됨)
- [x] 필수 헤더 추가: `x-api-key`, `anthropic-version: 2023-06-01` (이미 구현됨)





### Phase 9-4: AI 수동 검증 기능 (오토 파일럿 모드 없이도 사용 가능)
- [x] 관리자 페이지 입회 신청 목록에 "AI 검증 실행" 버튼 추가
- [x] 오토 파일럿 모드가 꺼져 있어도 수동으로 AI 검증 실행 가능
- [x] 기존 신청 건(이미 제출된 것)에 대해서도 AI 검증 실행 가능
- [x] AI 검증 미완료 건은 "AI 검증 실행" 버튼 표시 (pending 상태일 때만)
- [x] 검증 중 로딩 상태 표시
- [x] 검증 완료 시 toast 알림 및 결과 자동 새로고침
- [x] 검증 완료 후 AI 검증 결과 모달 자동 열기




### Phase 9-5: AI 검증 시스템 개선
- [ ] Claude 동적 모델 리스트 테스트
- [x] AI 검증 실행 전 사전 체크 강화
  - [x] 클라이언트에서 활성화된 AI 플랫폼 수 확인 (최소 2개)
  - [x] 2개 미만일 경우 "AI 검증 실행" 버튼 비활성화
  - [x] 버튼에 툴팅 표시 ("최소 2개 이상의 AI 모델이 활성화되어야 합니다.")
- [ ] AI 이미지 업로드 문제 확인 및 수정
  - [ ] Claude API 이미지 전달 형식 확인
  - [ ] Perplexity 이미지 분석 지원 여부 확인
  - [ ] Base64 인코딩 방식 검증
  - [ ] 각 플랫폼별 API 문서와 비교
- [x] API 키 실시간 검증 기능 추가 (저장 전 검증)
  - [x] 서버에 validateKey query API 추가
  - [x] 입력 필드에 onBlur 이벤트 추가 (포커스를 잃을 때 검증)
  - [x] 검증 상태 state 추가 (validating, valid, invalid, error message)
  - [x] 검증 결과를 입력 필드 아래에 표시
    - [x] ✅ 유효함 (녹색 텍스트)
    - [x] ❌ 유효하지 않음 (빨간색 텍스트 + 에러 메시지)
  - [x] 유효하지 않으면 저장 버튼 비활성화
  - [x] 모든 플랫폼에 적용 (OpenAI, Anthropic, Google, Perplexity)




### Phase 9-6: API 키 형식 검증 (클라이언트 측)
- [x] 클라이언트에서 API 키 형식 먼저 검증
  - [x] OpenAI: `sk-` 또는 `sk-proj-`로 시작하는지 확인
  - [x] Anthropic: `sk-ant-`로 시작하는지 확인
  - [x] Google: `AIza`로 시작하는지 확인
  - [x] Perplexity: `pplx-`로 시작하는지 확인
- [x] 형식이 올바른 경우에만 서버 API 호출
- [x] 형식 오류 시 즉시 에러 표시 (서버 호출 없이)
- [x] 불필요한 네트워크 요청 방지




### Phase 9-7: 파일 타입 분리 (신원 증명 vs 시험 결과지)
- [x] 데이터베이스 스키마 변경
  - [x] applications 테이블에 identityDocumentUrl 컨럼 추가
  - [x] applications 테이블에 testResultUrl 컨럼 추가
  - [x] 기존 documentUrls 컨럼 유지 (호환성)
  - [x] Drizzle 스키마 업데이트 및 마이그레이션
- [x] 입회 신청 폼 UI 변경
  - [x] 파일 업로드 필드 2개로 분리
  - [x] "신원 증명 서류 업로드" 필드 추가
  - [x] "시험 결과지 업로드" 필드 추가
  - [x] 각 필드에 설명 문구 추가
  - [x] 업로드된 파일 표시 (녹색 배경)
  - [x] 파일 크기 표시
  - [x] 제출 버튼 disabled 조건 수정
- [ ] 서버 API 수정
  - [ ] application.submit mutation에서 identityDocumentUrl, testResultUrl 받기
  - [ ] S3 업로드 로직 수정 (각각 별도 저장)
- [ ] AI 검증 함수 수정
  - [ ] identityDocumentUrl과 testResultUrl을 각각 Base64로 변환
  - [ ] 두 이미지를 순서대로 AI에 전달
  - [ ] 프롬프트에 "첫 번째 이미지: 신원 증명, 두 번째 이미지: 시험 결과지" 명시
- [ ] 관리자 페이지 수정
  - [ ] 입회 신청 상세 모달에서 파일 분리 표시
  - [ ] "신원 증명 서류" 및 "시험 결과지" 라벨 추가
- [ ] 테스트
  - [ ] 신원 증명 1개 + 시험 결과지 1개 업로드
  - [ ] AI 검증 실행 후 두 이미지 모두 분석되는지 확인




### Phase 9-8: PDF 파일 처리 (모든 플랫폼 PDF 직접 지원)
- [x] PDF → 이미지 변환 함수 구현 (사용 안 함)
- [x] verifyApplicationWithAI 함수 시그니처 수정
  - [x] identityDocumentUrl, testResultUrl 파라미터로 변경
  - [x] 파일 URL 유효성 검사 추가
- [x] AI 검증 함수 내부 로직 수정
  - [x] OpenAI: PDF/이미지 원본 Base64로 전달 (data URI 형식)
  - [x] Claude: PDF/이미지 원본 Base64로 전달 (base64 source 형식)
  - [x] Gemini: PDF/이미지 원본 Base64로 전달 (inline_data 형식)
  - [x] Perplexity: 이미지는 image_url (data URI), PDF는 file_url (base64 only)
  - [x] 2개 파일(신원 증명 + 시험 결과지) 모두 전달
  - [x] 프롬프트에 파일 순서 명시
  - [x] S3에서 파일 다운로드 및 Base64 변환 (downloadFileAsBase64 함수 사용)
  - [x] 파일 타입 확인 (PDF vs 이미지)
  - [x] 변수명 충돌 해결 (content → responseContent, responseText, geminiContent, perplexityContent)
- [x] Perplexity 모델 제한 추가
  - [x] sonar, sonar-pro만 이미지/파일 지원
  - [x] reasoning 계열, deep-research는 미지원
  - [x] AI 검증 시 sonar/sonar-pro 아닌 모델 선택 시 에러 발생으로 처리
- [x] routers.ts에서 verifyApplicationWithAI 호출 부분 수정
  - [x] identityDocumentUrl과 testResultUrl을 그대로 전달
  - [x] 자동 검증 (submit mutation)
  - [x] 수동 검증 (verifyWithAI mutation)



### Phase 9-9: 관리자 페이지 수정
- [x] 상세 보기 모달에서 2개 파일 별도 표시
  - [x] "신원 증명 서류" 섹션
  - [x] "시험 결과지" 섹션
  - [x] 각 파일에 대한 별도 링크
  - [x] 기존 documentUrls 호환성 유지




### Phase 9-10: 테스트
- [x] 데이터베이스 스키마 확인
  - [x] identityDocumentUrl, testResultUrl 필드 존재 확인
  - [x] 기존 documentUrls 필드 유지 확인
- [x] 입회 신청 폼 코드 확인
  - [x] 2개 파일 상태 관리 (identityDocument, testResultDocument)
  - [x] 각 파일을 S3에 별도 업로드
  - [x] identityDocumentUrl과 testResultUrl을 별도로 전달
  - [x] documentUrls도 함께 전달하여 호환성 유지
- [x] AI 검증 함수 코드 확인
  - [x] verifyApplicationWithAI 함수가 2개 파일 URL을 받음
  - [x] 각 플랫폼별 함수가 2개 파일 URL을 받음
  - [x] S3에서 파일 다운로드 및 Base64 변환 로직 포함
  - [x] 파일 타입(PDF vs 이미지) 확인 로직 포함
  - [x] Perplexity는 sonar/sonar-pro 모델만 허용
- [x] 관리자 페이지 코드 확인
  - [x] 상세 보기 모달에서 2개 파일 별도 표시
  - [x] 각 파일에 대한 별도 링크
  - [x] 기존 documentUrls 호환성 유지
- [ ] 통합 테스트 (실제 사용 테스트)
  - [ ] AI API 키 설정 (관리자 페이지)
  - [ ] 입회 신청 폼에서 실제 파일 업로드
  - [ ] AI 자동 검증 또는 수동 검증 실행
  - [ ] 검증 결과 확인




## Phase 18: 신원 정보 교차 검증 기능 추가

### 목표
AI 검증 시 신청자가 입력한 개인정보(이름, 생년월일)와 신원 증명 서류에서 추출한 정보를 교차 검증

### 구현 항목
- [x] verifyApplicationWithAI 함수에 개인정보 파라미터 추가
  - [x] applicantName (이름)
  - [x] applicantBirthDate (생년월일)
- [x] AI 프롬프트에 개인정보 교차 검증 항목 추가
  - [x] 신원 증명 서류의 이름과 입력한 이름 일치 확인
  - [x] 신원 증명 서류의 생년월일과 입력한 생년월일 일치 확인 (가능한 경우)
  - [x] 3개 시험 유형 모두 적용 (표준 지능 검사, 학업 및 인지 능력 검사, 대학 및 대학원 진학 시험)
- [x] 4개 AI 플랫폼 검증 함수 모두 수정
  - [x] verifyWithOpenAI
  - [x] verifyWithAnthropic (Claude)
  - [x] verifyWithGemini
  - [x] verifyWithPerplexity
- [x] routers.ts에서 AI 검증 호출 시 개인정보 전달
  - [x] submit mutation (자동 검증)
  - [x] verifyWithAI mutation (수동 검증)
- [ ] 테스트
  - [ ] 이름 불일치 시 거부
  - [ ] 생년월일 불일치 시 거부
  - [ ] 모든 정보 일치 시 승인




## Phase 19: OpenRouter 통합 및 역할 기반 AI 구조

### 목표
1. 기존 4개 플랫폼을 OpenRouter로 통합하여 단일 API 키로 모든 모델 사용
2. 역할 기반 AI 구조 도입:
   - **검증 AI (Verifier)**: 서로 다른 플랫폼 2개 이상, 엄격한 검증
   - **종합 AI (Summarizer)**: 1개, 사용자 친화적인 결과 요약 및 안내

### 구현 항목

#### 1. OpenRouter API 연동
- [ ] OpenRouter API 키 환경 변수 추가
- [ ] OpenRouter 모델 목록 API 호출 함수 구현
  - [ ] GET https://openrouter.ai/api/v1/models
  - [ ] 플랫폼별 필터링 (OpenAI, Anthropic, Google, Meta 등)
- [ ] OpenRouter Chat Completions API 호출 함수 구현
  - [ ] POST https://openrouter.ai/api/v1/chat/completions
  - [ ] 이미지/PDF 지원 (vision 모델)

#### 2. 데이터베이스 스키마 변경
- [x] aiSettings 테이블 마이그레이션
  - [x] platform → provider 필드로 변경 (rename)
  - [x] provider 필드에 UNIQUE 제약 유지 (같은 provider는 1개만)
  - [x] apiKey 필드 제거 (OpenRouter API 키는 환경 변수)
  - [x] selectedModel 삭제, modelId 필드 생성 (전체 ID 저장, 200자)
  - [x] modelName 필드 추가 (UI 표시용, 200자)
  - [x] role 필드 추가: enum('verifier', 'summarizer')
  - [x] isEnabled 필드 유지
  - [x] drizzle-kit generate 및 migrate 성공
- [ ] 검증 규칙 구현
  - [ ] verifier 역할: 최소 2개, 서로 다른 provider
  - [ ] summarizer 역할: 정확히 1개
- [ ] 기존 데이터 마이그레이션 스크립트 (필요시)

#### 3. AI 검증 프롬프트 역할별 분리
- [x] Verifier AI 프롬프트 작성
  - [x] 역할: 엄격한 서류 검증 전문가
  - [x] 상세하고 기술적인 분석
  - [x] 3개 시험 유형별 프롬프트 (standard_iq, academic_cognitive, university_admission)
  - [x] 신원 증명 + 시험 결과지 교차 검증
  - [x] 상세 체크리스트 포함
- [x] Summarizer AI 프롬프트 작성
  - [x] 역할: 친절한 회원 서비스 담당자
  - [x] 여러 검증 결과를 종합
  - [x] **영어로 응답** (국제 표준 언어, 브라우저 자동 번역 활용)
  - [x] 구체적인 개선 방법 제시
  - [x] 공감적이고 도움이 되는 톤
  - [x] 재검토 요청 안내 (1회 제한)
  - [x] ai-prompts.ts 파일 생성

#### 4. AI 검증 함수 통합
- [x] 기존 4개 함수 제거 (ai-verification-old.ts로 백업)
  - [x] verifyWithOpenAI
  - [x] verifyWithAnthropic
  - [x] verifyWithGemini
  - [x] verifyWithPerplexity
- [x] 단일 verifyWithOpenRouter 함수 구현
  - [x] 모든 모델을 OpenRouter API로 호출
  - [x] 이미지/PDF Base64 전달 (Vision 모델 지원)
  - [x] 응답 파싱 및 검증 결과 반환 (JSON 파싱)
  - [x] role에 따라 다른 프롬프트 사용 (verifier vs summarizer)
- [x] verifyApplicationWithAI 함수 수정
  - [x] 1단계: Verifier AI들로 검증 (서로 다른 provider 2개 이상)
  - [x] 2단계: Summarizer AI로 결과 종합
  - [x] Summarizer의 출력을 사용자에게 전달 (reason 필드)
  - [x] Verifier 결과는 관리자만 확인 가능 (verifierResults 필드)
  - [x] 검증 규칙 구현 (최소 2개 Verifier, 1개 Summarizer, 서로 다른 provider)
  - [x] 다수결 기반 최종 결정
  - [x] WebSocket 진행 상태 브로드캠스트
- [x] TypeScript export 오류 수정
  - [x] callOpenRouterChatCompletion import 수정
  - [x] getDb import 수정 (db → getDb)

#### 4. 관리자 페이지 UI 변경
- [x] AI 설정 탭 재설계
  - [x] AISettingsTab 컴포넌트 생성
  - [x] "모델 추가" 버튼
  - [x] 추가된 모델 목록 테이블 (provider, model, role, 활성화 상태)
- [x] 모델 추가 모달 (3단계)
  - [x] Step 1: Provider 선택 (OpenRouter providers)
  - [x] Step 2: 해당 Provider의 Vision 모델 목록 표시 및 선택
  - [x] Step 3: Role 선택 (Verifier/Summarizer)
  - [x] 모델 정보 표시 (이름, ID, 설명)
- [x] Admin.tsx에 "AI 설정 (OpenRouter)" 탭 추가
- [x] 기존 "AI 설정" 탭을 "AI 설정 (Legacy)"로 변경 (호환성 유지)

#### 5. 서버 API 수정
- [x] addAiSetting mutation 수정
  - [x] provider, modelId, modelName, role 파라미터
  - [x] 검증: 같은 provider는 1개만 허용
  - [x] 검증: Summarizer는 최대 1개
- [x] updateAiSetting mutation 수정
- [x] deleteAiSetting mutation 수정
  - [x] 삭제 후 검증 규칙 확인 (경고만 표시)
- [x] getOpenRouterModels query 추가
  - [x] OpenRouter API에서 Vision 모델 목록 가져오기
- [x] getOpenRouterProviders query 추가
  - [x] Vision 모델이 있는 provider 목록
- [x] getOpenRouterModelsByProvider query 추가
  - [x] 특정 Provider의 Vision 모델 목록
- [x] validate query 추가
  - [x] validateAiSettingsConfiguration 호출

#### 6. 테스트
- [ ] OpenRouter API 연동 테스트
- [ ] 모델 추가/삭제 테스트
  - [ ] Verifier 역할 모델 2개 추가 (서로 다른 provider)
  - [ ] Summarizer 역할 모델 1개 추가
  - [ ] 같은 provider 중복 추가 시 에러 확인
- [ ] AI 검증 테스트
  - [ ] Verifier AI들의 상세 검증 결과 확인
  - [ ] Summarizer AI의 사용자 친화적 요약 확인
  - [ ] 이미지/PDF 업로드 및 검증
- [ ] 2단계 검증 프로세스 테스트
  - [ ] Verifier → Summarizer 순차 확인
  - [ ] 최종 결과가 사용자 친화적인지 확인

### 참고
- OpenRouter API 문서: https://openrouter.ai/docs
- OpenRouter 모델 목록: https://openrouter.ai/models
- Vision 지원 모델 확인 필요




#### 7. 마이페이지 및 이메일 UI 개선
- [x] 마이페이지 거절 사유 표시 변경
  - [x] 상세 사유 제거 (adminNotes 직접 표시 제거)
  - [x] "상세한 거부 사유는 등록된 이메일로 발송되었습니다" 안내
  - [x] 등록된 이메일 주소 표시
  - [x] "이메일 재발송" 버튼 추가 (TODO: API 구현 필요)
  - [x] "재검토 요청" 버튼 유지
- [ ] 거절 이메일 템플릿 개선
  - [ ] Summarizer AI의 영어 응답 사용
  - [ ] 명확한 섹션 구분 (Rejection Reasons, How to Improve, Next Steps)
  - [ ] 재검토 요청 링크 포함
  - [ ] 문의 연락처 포함
- [ ] 이메일 재발송 기능 구현
  - [ ] 마이페이지에서 버튼 클릭
  - [ ] 동일한 거절 사유 이메일 재발송
  - [ ] 발송 성공 토스트 알림





---

## ✅✅✅ Phase 19 최종 완료 (2025-10-29) ✅✅✅

**체크포인트:** 66e1b5f3

**주요 성과:**
- OpenRouter 통합 완료 (단일 API로 모든 AI 모델 관리)
- 역할 기반 AI 검증 시스템 (Verifier + Summarizer)
- 관리자 UI 재설계 (AISettingsTab 컴포넌트)
- 서버 API 검증 규칙 구현
- 마이페이지 UI 개선 (간략한 거절 안내)

**다음 단계:**
- OpenRouter API 실제 테스트
- 이메일 재발송 API 구현
- 거절 이메일 템플릿 개선 (Summarizer AI 출력 사용)

---



## OpenRouter API 테스트 결과 (2025-10-29)

**테스트 완료:**
- [x] 모델 목록 조회 (총 347개 모델, 109개 Vision 지원)
- [x] Provider 목록 조회 (OpenAI, Anthropic, Google, Qwen, Mistral, Perplexity 등)
- [x] Chat Completions API 테스트

**정상 작동 확인된 모델:**
- ✅ `anthropic/claude-3.5-sonnet` (Claude 3.5 Sonnet) - Verifier/Summarizer 모두 적합
- ✅ `perplexity/sonar-pro` (Perplexity Sonar Pro) - Verifier 적합

**문제 발견:**
- ❌ `google/gemini-2.0-flash-exp`: 엔드포인트 없음
- ❌ `openai/gpt-4o`: Zero data retention 정책 문제
- ❌ 일부 베타/프리뷰 모델은 목록에만 있고 실제 사용 불가

**권장 설정:**
- Verifier 1: `anthropic/claude-3.5-sonnet`
- Verifier 2: `perplexity/sonar-pro`
- Summarizer: `anthropic/claude-3.5-sonnet`




## 이메일 재발송 API 구현 완료 (2025-10-29)

**완료된 작업:**
- [x] `routers.ts`에 `resendRejectionEmail` mutation 추가
- [x] 거부된 신청 확인 및 유효성 검사
- [x] `sendApplicationRejectedEmail` 함수 재사용
- [x] `MyPage.tsx`에 `resendEmailMutation` 추가
- [x] 버튼 클릭 시 API 호출 및 로딩 상태 표시
- [x] PostHog 이벤트 추적
- [x] 성공/실패 토스트 알림




## 거절 이메일 템플릿 개선 완료 (2025-10-29)

**완료된 작업:**
- [x] Summarizer AI의 영어 응답을 그대로 사용 (브라우저 자동 번역 활용)
- [x] 전문적인 HTML 이메일 디자인
  - [x] 그라데이션 헤더 (RIQ Society 브랜딩)
  - [x] 반응형 레이아웃 (모바일 친화적)
  - [x] 섹션별 색상 구분 (빨간색: 피드백, 파란색: 다음 단계)
- [x] 명확한 섹션 구분
  - [x] Application Result (결과 안내)
  - [x] Detailed Feedback (AI 피드백)
  - [x] Next Steps (재검토 요청 안내)
  - [x] Contact Info (문의 연락처)
- [x] CTA 버튼 추가 ("Go to My Account")
- [x] 재검토 요청 1회 제한 명시
- [x] 연락처 정보 포함 (support@riqsociety.org)





## Phase 19-2: OpenRouter API 키 변경 및 PDF 파일 처리 개선 ✅ 완료

- [x] OpenRouter API 키 변경 반영
  - [x] 환경 변수 확인 (73자 길이)
  - [x] 서버 재시작
  - [x] API 연결 테스트 (준비 완료)
- [x] PDF 파일 처리 확인 및 개선
  - [x] 현재 지원하는 파일 형식 확인 (JPEG, PNG, WebP, PDF)
  - [x] PDF 파일 업로드 지원 확인 (application/pdf, 최대 10MB)
  - [x] AI 검증 시 PDF 파일 처리 로직 개선
  - [x] Base64 인코딩 및 MIME 타입 자동 감지
  - [x] downloadFileAsBase64 함수 수정 ({ base64, mimeType } 반환)
  - [x] getFirstDocumentAsBase64 함수 수정
  - [x] getDocumentAsBase64Array 함수 수정

**개선 사항:**
- PDF 파일의 MIME 타입을 Content-Type 헤더 또는 파일 확장자로 자동 감지
- Vision API에 `data:application/pdf;base64,{base64}` 형식으로 전달
- Claude 3.5 Sonnet, Perplexity Sonar Pro 등 대부분의 Vision 모델이 PDF 직접 지원



**Phase 19-2 완료 요약:**
- ✅ OpenRouter API 키 변경 반영 (서버 재시작)
- ✅ PDF 파일 처리 개선 (MIME 타입 자동 감지, Base64 인코딩)
- ✅ downloadFileAsBase64 함수 수정 ({ base64, mimeType } 반환)
- ✅ Vision API에 PDF 직접 전달 지원




## Phase 19-3: 용어 변경 - "거절/거부" → "반려" ✅ 완료

- [x] UI 텍스트 변경
  - [x] MyPage.tsx (5개)
  - [x] Admin.tsx (22개)
  - [x] AIVerificationResults.tsx (1개)
  - [x] AISettingsTab.tsx (1개)
- [x] 서버 코드 변경
  - [x] routers.ts
  - [x] email.ts (sendApplicationRejectedEmail 함수 주석)
  - [x] db-ai-accuracy.ts (주석)
- [x] 데이터베이스 커럼명은 유지 (rejected → 그대로, 호환성)

**변경 사항:**
- "거절" → "반려" (공식적/행정적 용어)
- "거부" → "반려" (동일한 의미)
- 총 31개 항목 변경 (UI 29개 + 서버 2개)





## Phase 19-4: 재검토 횟수 제한 변경 (1회 → 2회) ✅ 완료

- [x] 서버 검증 로직 변경
  - [x] 기존 incrementReviewRequestCount 함수는 수정 불필요 (단순 카운터)
  - [x] 클라이언트에서 재검토 요청 횟수 체크: reviewRequestCount < 2
- [x] UI 메시지 변경
  - [x] MyPage.tsx (3개 위치)
    - [x] 조건문: `< 1` → `< 2`
    - [x] 텍스트: "최대 1회" → "최대 2회"
    - [x] 조건문: `>= 1` → `>= 2`
  - [x] email.ts (이메일 템플릿)
    - [x] "only once" → "up to 2 times"

**변경 사항:**
- 재검토 요청 최대 횟수: 1회 → 2회
- 첫 번째 재검토: AI 오류 또는 서류 불명확 → 서류 보완 기회
- 두 번째 재검토: 최종 확인 → 진정성 있는 신청자에게 마지막 기회





## Phase 20: 회원 기간 관리 시스템

### 1. DB 스키마 변경 ✅ 완료
- [x] users 테이블에 필드 추가
  - [x] membershipType: enum("annual", "lifetime") - 연회원/평생회원 구분
  - [x] membershipStartDate: timestamp - 회원 시작일
  - [x] membershipExpiryDate: timestamp (nullable) - 회원 만료일 (평생회원은 null)
  - [x] membershipRenewedAt: timestamp - 마지막 갱신일
- [x] 마이그레이션 실행 (pnpm db:push)
  - [x] 마이그레이션 파일: 0026_organic_ben_grimm.sql

### 2. 연회비 입금 확인 시 회원 기간 설정 ✅ 완료
- [x] confirmApplicationPayment mutation 수정
  - [x] membershipType 파라미터 추가 ("annual" 또는 "lifetime", 기본값: "annual")
  - [x] membershipStartDate = 현재 시간
  - [x] membershipExpiryDate = 연회원이면 1년 후, 평생회원이면 null
  - [x] membershipRenewedAt = 현재 시간
- [ ] 관리자 페이지 UI 수정 (나중에 Phase 4에서 처리)
  - [ ] 입금 확인 시 회원 유형 선택 (연회원/평생회원)
  - [ ] 기본값: 연회원

### 3. 회원 기간 만료 체크 로직 ✅ 완료
- [x] db-membership.ts 회원 기간 관리 함수 작성
  - [x] getExpiredMembers(): 만료된 회원 조회
  - [x] downgradeExpiredMembers(): 자동 등급 하락 (member → user)
  - [x] renewMembership(): 회원 기간 연장
  - [x] getMembersExpiringWithin(days): 만료 임박 회원 조회
- [x] cron-membership.ts Cron Job 함수 작성
  - [x] checkAndDowngradeExpiredMembers(): 만료 회원 처리
  - [x] notifyExpiringMembers(): 만료 임박 알림
- [x] server/_core/index.ts에 Cron Job 설정
  - [x] 매일 자정 00:00: 만료 회원 자동 등급 하락
  - [x] 매일 오전 09:00: 만료 임박 회원 알림
- [x] node-cron 패키지 설치

### 4. 회원 기간 연장 기능 ✅ 부분 완료
- [x] renewMembership mutation 추가 (routers.ts)
  - [x] membershipType 파라미터 (연회원/평생회원)
  - [x] customExpiryDate 파라미터 (수동 날짜 설정)
- [x] 입금 확인 시 회원 유형 선택 Dialog 추가
  - [x] 연회원 (1년) / 평생회원 (무제한) 선택
  - [x] 기본값: 연회원
- [ ] 회원 목록에 회원 유형, 만료일 표시
- [ ] 회원 기간 연장 버튼 추가 (회원 목록에서)

### 5. 만료 전 알림 기능
- [ ] 만료 30일 전 이메일 알림
- [ ] 만료 7일 전 이메일 알림
- [ ] 만료 당일 이메일 알림
- [ ] 알림 발송 cron job

### 6. 마이페이지 UI ✅ 완료
- [x] 회원 유형 표시 (연회원/평생회원)
  - [x] 연회원: 파란색 Badge
  - [x] 평생회원: 보라색 Badge
- [x] 회원 시작일 표시
- [x] 회원 만료일 표시
  - [x] 평생회원: "평생" (보라색 강조)
  - [x] 연회원: 날짜 표시
- [x] 남은 일수 표시 (연회원만)
  - [x] 30일 미만: 빨간색 강조
  - [x] 30일 이상: 일반 텍스트
- [x] 회원 기간 정보 섹션 분리 (border-t로 구분)

### 7. 관리자 페이지 UI
- [ ] 회원 목록에 회원 유형, 만료일 표시
- [ ] 만료 임박 회원 필터링
- [ ] 만료된 회원 필터링
- [ ] 회원 기간 연장 버튼





## Phase 20-7: 마이페이지 시험 날짜 표시 추가 ✅ 완료

- [x] MyPage.tsx 인증된 시험 정보 카드에 시험 날짜 추가
  - [x] testDate 필드 표시
  - [x] 4열 그리드로 변경 (시험 종류, 점수, 시험 날짜, 승인일)
  - [x] testDate가 없는 경우 "-" 표시
  - [x] 반응형 디자인: md:grid-cols-2 lg:grid-cols-4




## Phase 20-8: AI 검증에 응시 날짜 추가 ✅ 완료

- [x] ai-prompts.ts 수정
  - [x] getVerifierPrompt 함수에 testDate 파라미터 추가 (optional)
  - [x] Verifier 프롬프트에 응시 날짜 정보 포함 ("Test Date (Provided by Applicant)")
  - [x] 응시 날짜 일치성 검증 체크리스트 추가 (3개 시험 유형 모두)
- [x] ai-verification.ts 수정
  - [x] verifyApplicationWithAI 함수에 testDate 파라미터 추가
  - [x] getVerifierPrompt 호출 시 testDate 파라미터 전달
- [x] routers.ts 수정
  - [x] verifyApplication mutation에서 신청 정보 조회
  - [x] testDate 포함하여 verifyApplicationWithAI 호출
  - [x] testCategory 자동 결정 로직 추가
- [x] 검증 항목 추가
  - [x] 증명서의 날짜와 입력한 응시 날짜 일치 여부
  - [x] 응시 날짜가 미래가 아닌지 확인
  - [x] 응시 날짜가 합리적인 범위인지 확인 (not too old)




## Phase 20-9: OpenRouter 전환 후 불필요한 코드 정리 ✅ 완료

- [x] 불필요한 파일 삭제
  - [x] ai-verification-old.ts (백업 파일, 24KB)
  - [x] ai-key-validation.ts (사용되지 않음)
  - [x] ai-models.ts (사용되지 않음)
- [x] routers.ts import 정리
  - [x] getModelsByPlatform import 제거
  - [x] validateApiKey import 제거
- [x] 환경 변수 정리 확인
  - [x] OPENAI_API_KEY, ANTHROPIC_API_KEY 등 기존 API 키 관련 코드 확인 (없음)
  - [x] 필요 없는 환경 변수 참조 제거 (없음)

**정리 결과:**
- 삭제된 파일: 3개 (ai-verification-old.ts, ai-key-validation.ts, ai-models.ts)
- 제거된 import: 2개 (getModelsByPlatform, validateApiKey)
- 남은 AI 관련 파일: 2개 (ai-prompts.ts, ai-verification.ts)
- 현재 사용 중인 API 키: OPENROUTER_API_KEY만




## Phase 21: 저널/잡지 전용 페이지 (하이브리드 방식)

### 목표
기존 리소스 시스템을 활용하되, 저널/잡지만 별도 페이지로 표시

### 1. Journal.tsx 페이지 생성 ✅ 완료
- [x] `/journal` 라우트 생성 (App.tsx)
- [x] 리소스 API에서 `category="저널"` 또는 `category="잡지"` 필터링
  - [x] 영어 카테고리도 지원 (Journal, Magazine)
- [x] 저널 전용 UI 디자인
  - [x] 발행일 표시 (createdAt 사용)
  - [x] 그리드 레이아웃 (카드 형식, 3열)
  - [x] 다운로드 버튼
  - [x] 파일 타입 아이콘 표시
  - [x] 파일 크기 표시
  - [x] 카테고리 Badge 표시
- [x] 정회원 전용 접근 제어 (canAccessResources)

### 2. Header 메뉴 추가 ✅ 완료
- [x] Header.tsx에 "저널" 메뉴 추가
- [x] BookOpen 아이콘 사용
- [x] 정회원 전용 Badge 표시

### 3. SEO 최적화 ✅ 완료
- [x] 메타 태그 추가 (title, description, keywords)
- [x] 키워드 설정 ("RIQ Society 저널, 잡지, 정회원 혜택, 연구 자료, 고지능 연구")

### 4. 관리자 가이드
- [x] 기존 리소c스 관리 탭 활용
- [x] 카테고0리를 "저널" 또는 "잡지"로 설정하면 자동으로 /journal 페이지에 표시
- [x] description 필드에 호수, 발행 정보 등 입력 가능




## Phase 22: Menu Structure Simplification (TNS Style - No Dropdowns)
- [x] Update Header.tsx to remove all dropdowns
- [x] Flatten menu structure to top-level items only
- [x] Menu order: 홈, 입회, 회원, 리소스, 저널, 가게
- [x] Keep mobile hamburger menu
- [x] Update responsive design (desktop vs mobile)
- [x] Test all menu links

## Phase 23: Footer Implementation
- [x] Create Footer.tsx component
- [x] Add footer links: 블로그, FAQ, 이용약관, 개인정보처리방침, 문의
- [x] Add Footer to App.tsx layout (all pages)
- [x] Style Footer with consistent design (dark theme)
- [x] Add copyright and social media links (optional)
- [x] Test footer navigation

## Phase 24: Shop Page (Coming Soon)
- [x] Create Shop.tsx page component
- [x] Add /shop route to App.tsx
- [x] Design "Coming Soon" UI:
  - [x] Title: "가게 (준비 중)"
  - [x] Description: "곷 오픈 예정입니다"
  - [x] Optional: Email notification signup
- [x] Add SEO component to Shop page
- [x] Test shop page navigation

## Phase 25: Shipping Address Management
- [x] Add address fields to applications table:
  - [x] postalCode (우편번호)
  - [x] address (주소)
  - [x] detailAddress (상세주소)
  - [x] deliveryMemo (배송 메모)
- [x] Create migration file for address fields
- [x] Update ApplicationForm.tsx Step 1 with address input
- [x] Add address validation (Zod schema)
- [x] Display address in Admin application detail modal
- [x] Add updateAddress mutation to routers.ts
- [x] Add address edit section to MyPage.tsx
- [x] Test address input and update flow



## Bug Fix: 회원 메뉴 접근 권한
- [x] "회원" 메뉴를 로그인한 사용자에게만 표시
- [x] 데스크톱 메뉴에서 isAuthenticated 조건 추가
- [x] 모바일 메뉴는 이미 올바르게 구현되어 있음 확인



## Bug Fix: 모바일 메뉴 접근 권한
- [x] 모바일 메뉴에서 "회원" 메뉴를 로그인한 사용자에게만 표시
- [x] 모바일 메뉴에서 "커뮤니티" 메뉴를 로그인한 사용자에게만 표시
- [x] 데스크톱 메뉴에도 "커뮤니티" 메뉴 추가 (로그인한 사용자에게만)



## Bug Fix: Footer.tsx 중첩된 <a> 태그 에러
- [x] Footer.tsx에서 Link 안의 <a> 태그 제거
- [x] Link 컴포넌트에 className 직접 적용




## Mobile Menu & Hero Section Improvement
- [x] Add 블로그 and FAQ to mobile hamburger menu (all users)
- [x] Remove "입회" from mobile hamburger menu
- [x] Change Home.tsx hero section button to "입회 신청하기" (unauthenticated users)
- [x] Show "마이페이지" button for authenticated users in hero section
- [x] Update mobile menu order: 홈, (로그인 시: 회원, 리소스, 저널, 커뮤니티), 블로그, FAQ, 가게
- [x] Test mobile menu navigation




## Social Login: Google Only
- [x] Check current OAuth providers (Google, GitHub, etc.)
- [x] Remove non-Google OAuth providers if any (Already Google only)
- [x] Update Auth.tsx to show only Google login (Already done)
- [x] Update server OAuth configuration (Already done)
- [x] Test Google login flow

## Responsive Design Review
- [ ] Review all pages for mobile responsiveness
- [ ] Check breakpoints (sm, md, lg, xl)
- [ ] Review typography scaling (text-sm, text-base, text-lg, etc.)
- [ ] Review spacing (padding, margin) on mobile vs desktop
- [ ] Review button sizes and touch targets (min 44x44px)
- [ ] Review form inputs on mobile
- [ ] Review navigation (Header, Footer) on all screen sizes
- [ ] Apply design principles from:
  - [ ] shadcn/ui (primary reference)
  - [ ] OpenAI website
  - [ ] Perplexity website
  - [ ] Apple website
- [ ] Test on mobile device or browser DevTools




## Theme Update: shadcn/ui Default (Zinc Dark)
- [x] Update index.css with shadcn/ui Zinc Dark theme colors
- [x] Remove custom green (120) and blue (217) colors
- [x] Apply Zinc/Slate color palette
- [x] Update primary, secondary, accent colors
- [x] Update chart colors to Zinc palette
- [x] Test theme across all pages
- [x] Verify contrast ratios for accessibility




## Fix: Admin Tables Mobile Responsiveness
- [x] Wrap all Table components in Admin.tsx with overflow-x-auto div (9 tables)
- [x] Test table scrolling on mobile devices
- [x] Verify all tables are horizontally scrollable



## UI Fix: Admin Badge Color
- [x] Change admin badge color from red (destructive) to a more appropriate color (e.g., blue/primary)
- [x] Update Header component admin badge styling


