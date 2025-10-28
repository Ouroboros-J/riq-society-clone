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

- [ ] 재검토 시스템 개선
  - [ ] 재검토 결과 이메일 알림
  - [ ] AI 오탐률 통계 대시보드

- [ ] 전체 기능 테스트
  - [ ] Google OAuth 로그인 테스트
  - [ ] 이메일 발송 테스트 (실제 수신 확인)
  - [ ] 입회 신청 전체 플로우 테스트
  - [ ] AI 자동 검증 테스트
  - [ ] 재검토 요청 테스트

