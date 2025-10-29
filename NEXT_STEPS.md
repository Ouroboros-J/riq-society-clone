# 다른 계정에서 계속 작업하기 위한 가이드

## 1. 현재 상태 확인

### 최신 체크포인트
- **버전**: `be1a124e`
- **상태**: 저널 시스템 프론트엔드 완성
- **빌드**: 성공
- **개발 서버**: 정상 작동

### 복원 방법
새로운 계정에서 작업을 시작할 때:
```bash
# 프로젝트 초기화 (필요시)
webdev_rollback_checkpoint --version be1a124e
```

## 2. 즉시 필요한 추가 작업

### A. 읽은 저널 추적 기능 (우선순위: 높음)

#### 구현 내용
사용자가 읽은 저널을 시각적으로 표시하는 기능

#### 구현 단계

**1단계: 커스텀 훅 생성**
```typescript
// client/src/hooks/useReadJournals.ts
export function useReadJournals() {
  const [readJournalIds, setReadJournalIds] = useState<number[]>([]);

  // localStorage에서 읽은 저널 로드
  useEffect(() => {
    const saved = localStorage.getItem('read-journals');
    if (saved) {
      setReadJournalIds(JSON.parse(saved));
    }
  }, []);

  // 읽은 저널 추가
  const markAsRead = (journalId: number) => {
    setReadJournalIds((prev) => {
      const updated = [...new Set([...prev, journalId])];
      localStorage.setItem('read-journals', JSON.stringify(updated));
      return updated;
    });
  };

  const isRead = (journalId: number) => readJournalIds.includes(journalId);

  return { readJournalIds, markAsRead, isRead };
}
```

**2단계: JournalDetail.tsx 수정**
```typescript
// 페이지 로드 시 읽은 저널로 표시
useEffect(() => {
  if (journalQuery.data?.id) {
    markAsRead(journalQuery.data.id);
  }
}, [journalQuery.data?.id]);
```

**3단계: Journals.tsx 수정**
```typescript
// 저널 카드에 읽음 표시 추가
const { isRead } = useReadJournals();

// 카드 렌더링 시
{isRead(journal.id) && (
  <Badge className="absolute top-2 right-2">읽음</Badge>
)}

// 또는 체크마크 아이콘
{isRead(journal.id) && (
  <Check className="h-4 w-4 text-green-500" />
)}
```

#### 예상 결과
- 저널 목록에서 읽은 저널에 "읽음" 배지 또는 체크마크 표시
- localStorage에 읽은 저널 ID 자동 저장
- 새로고침 후에도 읽음 상태 유지

### B. 선택사항: 마크다운 실시간 프리뷰 (우선순위: 낮음)

관리자 에디터에 split view로 마크다운 실시간 프리뷰 추가

#### 구현 방법
- Admin.tsx의 저널 다이얼로그에 2열 레이아웃 추가
- 왼쪽: 마크다운 입력
- 오른쪽: 실시간 렌더링 결과

#### 필요 라이브러리
```bash
pnpm add react-split-pane
```

## 3. 테스트 체크리스트

### 저널 목록 페이지
- [ ] 정회원만 접근 가능
- [ ] 비회원 접근 시 입회 안내 표시
- [ ] 카테고리 필터링 작동
- [ ] 검색 기능 작동
- [ ] 정렬 옵션 작동
- [ ] PDF 아이콘 표시 (PDF URL이 있을 경우)

### 저널 상세 페이지
- [ ] 마크다운 렌더링 정상
- [ ] 코드 하이라이팅 정상
- [ ] PDF 다운로드 버튼 작동
- [ ] 공유 버튼 작동 (URL 복사)
- [ ] 관련 저널 추천 표시
- [ ] 조회수 증가 확인

### 관리자 에디터
- [ ] 저널 추가 기능 작동
- [ ] 저널 수정 기능 작동
- [ ] 저널 삭제 기능 작동
- [ ] PDF URL 입력 저장
- [ ] 공개/비공개 토글 작동

### 읽은 저널 추적 (새로 구현 시)
- [ ] 저널 상세 페이지 방문 시 읽음 표시
- [ ] 저널 목록에서 읽음 배지 표시
- [ ] localStorage에 데이터 저장
- [ ] 새로고침 후에도 읽음 상태 유지

## 4. 데이터베이스 상태

### 현재 스키마
```sql
CREATE TABLE journals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  thumbnailUrl TEXT,
  pdfUrl TEXT,                    -- 새로 추가됨
  category VARCHAR(100),
  authorId INT NOT NULL,
  isPublished INT DEFAULT 0,
  publishedAt TIMESTAMP,
  viewCount INT DEFAULT 0,        -- 새로 추가됨
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);
```

### 마이그레이션 파일
- `drizzle/0029_absent_obadiah_stane.sql` - 최신 마이그레이션

## 5. 환경 변수 확인

필요한 환경 변수는 모두 설정되어 있음:
- `VITE_APP_TITLE` - 앱 제목
- `VITE_OAUTH_PORTAL_URL` - OAuth 포털
- 기타 기존 변수들

## 6. 빌드 및 배포

### 로컬 개발
```bash
cd /home/ubuntu/riq-society-clone
pnpm install
pnpm dev
```

### 빌드
```bash
pnpm build
```

### 체크포인트 저장
```bash
webdev_save_checkpoint --description "읽은 저널 추적 기능 추가"
```

## 7. 주의사항

### 중요
1. **데이터베이스**: 마이그레이션은 이미 완료됨 (다시 실행 불필요)
2. **라이브러리**: react-markdown, remark-gfm, react-syntax-highlighter 설치됨
3. **API**: memberProcedure로 보호되어 있음 (정회원만 접근)

### 파일 수정 시 주의
- `Journals.tsx`: 목록 페이지 (필터링, 검색 로직 있음)
- `JournalDetail.tsx`: 상세 페이지 (마크다운 렌더링)
- `Admin.tsx`: 관리자 에디터 (매우 큼, 저널 섹션은 2271-2400줄)

## 8. 문제 해결

### 빌드 에러
```
Could not load /path/to/file
```
→ import 경로 확인 (예: `@/_core/hooks/useRole` vs `@/hooks/useRole`)

### 마이그레이션 에러
```
pnpm db:push
```
→ 이미 완료됨, 필요시만 실행

### 런타임 에러
→ 브라우저 콘솔 확인, 특히 tRPC 호출 에러 확인

## 9. 연락처 및 참고 자료

- **프로젝트 경로**: `/home/ubuntu/riq-society-clone`
- **요약 문서**: `JOURNAL_IMPLEMENTATION_SUMMARY.md`
- **이 가이드**: `NEXT_STEPS.md`
- **todo.md**: 전체 작업 현황 추적

---

**마지막 업데이트**: 2025-10-29
**최신 체크포인트**: be1a124e

