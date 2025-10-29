# RIQ Society 저널 시스템 구현 요약

## 작업 완료 현황

### 1. 데이터베이스 및 백엔드 (완료)
- **스키마 변경**: `journals` 테이블에 2개 필드 추가
  - `pdfUrl` (TEXT, NULL 허용) - PDF 다운로드 링크
  - `viewCount` (INT, 기본값 0) - 조회수 추적
  
- **마이그레이션**: `pnpm db:push` 실행 완료 (migration: 0029_absent_obadiah_stane.sql)

- **백엔드 API 구현** (`server/db-journals.ts`):
  - `incrementJournalViewCount(id)` 함수 추가 - 조회수 증가

- **tRPC 라우터** (`server/routers.ts`):
  - `journal.create` - pdfUrl 필드 추가
  - `journal.update` - pdfUrl 필드 추가
  - `journal.incrementViewCount` - 새로운 mutation 추가 (memberProcedure)

### 2. 프론트엔드 - 저널 목록 페이지 (완료)
**파일**: `client/src/pages/Journals.tsx`

**기능**:
- 정회원 전용 (memberProcedure로 보호)
- 비회원/일반회원 접근 시 입회 안내 페이지 표시
- 카드 그리드 레이아웃 (3열 반응형)
- 썸네일, 제목, 요약, 카테고리, 발행일, 조회수 표시
- 카테고리 필터링 (동적 추출)
- 제목/내용 검색 기능
- 정렬 옵션 (최신순/오래된순)
- PDF 다운로드 가능 여부 표시 (다운로드 아이콘)

### 3. 프론트엔드 - 저널 상세 페이지 (완료)
**파일**: `client/src/pages/JournalDetail.tsx`

**기능**:
- 정회원 전용 (memberProcedure로 보호)
- 마크다운 렌더링 (react-markdown + remark-gfm)
- 코드 하이라이팅 (react-syntax-highlighter)
- 썸네일 이미지 표시
- 메타데이터: 작성일, 카테고리, 조회수
- PDF 다운로드 버튼 (pdfUrl이 있을 경우만 표시)
- 공유 버튼 (URL 복사)
- 관련 저널 추천 (같은 카테고리, 최대 3개)
- SEO 메타태그 (Open Graph 포함)
- 조회수 자동 증가 (페이지 방문 시)

### 4. 라우팅 (완료)
**파일**: `client/src/App.tsx`

```typescript
<Route path="/journals" component={Journals} />
<Route path="/journals/:slug" component={JournalDetail} />
```

### 5. Header 메뉴 업데이트 (완료)
**파일**: `client/src/components/Header.tsx`

- 데스크톱 메뉴: `/journals` 링크 추가
- 모바일 메뉴: `/journals` 링크 추가
- 정회원이 아닌 경우 "정회원 전용" 배지 표시
- 정회원에게만 메뉴 표시

### 6. 관리자 에디터 개선 (완료)
**파일**: `client/src/pages/Admin.tsx`

**추가된 기능**:
- `journalPdfUrl` 상태 변수 추가
- PDF URL 입력 필드 추가 (선택사항)
- 저널 추가/수정 시 pdfUrl 포함
- 저널 수정 시 기존 pdfUrl 로드

### 7. 설치된 라이브러리
```bash
pnpm add react-markdown remark-gfm react-syntax-highlighter @types/react-syntax-highlighter
```

### 8. 버그 수정
**Application.tsx**: React Hooks 순서 에러 수정
- useEffect를 조건부 return 이전으로 이동
- 모든 렌더링에서 동일한 Hook 순서 보장

## 현재 상태

**최신 체크포인트**: `be1a124e`
- 모든 저널 기능 완성 및 테스트 완료
- 빌드 성공
- 개발 서버 정상 작동

## 다음 단계 (미완료)

### 읽은 저널 추적 기능 (진행 예정)
- [ ] localStorage를 사용한 읽은 저널 ID 저장
- [ ] 저널 상세 페이지 방문 시 자동으로 읽은 저널 목록에 추가
- [ ] 저널 목록 페이지에서 읽은 저널 시각적 표시
  - 체크마크 아이콘 또는 배지 추가
  - 읽음 상태 표시 (예: "읽음" 배지)
- [ ] 읽은 저널 카운트 표시 (예: "읽음 (3/10)")

### 선택사항 (미구현)
- 마크다운 실시간 프리뷰 (split view)
- 이미지/PDF 파일 직접 업로드 (현재는 URL 입력)

## 주요 기술 스택

| 항목 | 기술 |
|------|------|
| 마크다운 렌더링 | react-markdown + remark-gfm |
| 코드 하이라이팅 | react-syntax-highlighter |
| 상태 관리 | React Hooks (useState) |
| 데이터 페칭 | tRPC |
| 라우팅 | wouter |
| UI 컴포넌트 | shadcn/ui |
| 스타일링 | Tailwind CSS |

## 파일 구조

```
client/src/
├── pages/
│   ├── Journals.tsx           (저널 목록 페이지)
│   ├── JournalDetail.tsx      (저널 상세 페이지)
│   └── Admin.tsx              (관리자 에디터 수정)
├── components/
│   └── Header.tsx             (메뉴 업데이트)
└── App.tsx                    (라우트 추가)

server/
├── db-journals.ts             (DB 함수)
└── routers.ts                 (tRPC 라우터)

drizzle/
└── schema.ts                  (스키마 변경)
```

## 주의사항

1. **PDF URL 입력**: 관리자는 S3 등에 PDF를 업로드하고 URL을 입력해야 함
2. **정회원 전용**: memberProcedure로 보호되어 있음
3. **조회수 추적**: 페이지 방문 시 자동으로 증가 (중복 방문도 카운트)
4. **마크다운 지원**: GFM(GitHub Flavored Markdown) 지원

## 배포 전 체크리스트

- [x] 데이터베이스 마이그레이션 완료
- [x] 백엔드 API 구현 완료
- [x] 프론트엔드 페이지 구현 완료
- [x] 라우팅 설정 완료
- [x] Header 메뉴 업데이트 완료
- [x] 관리자 에디터 업데이트 완료
- [x] 빌드 성공
- [ ] 읽은 저널 추적 기능 (다음 단계)

