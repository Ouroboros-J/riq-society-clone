# 다른 Manus 계정으로 프로젝트 이동 가이드

**현재 상태**: 체크포인트 `be1a124e`로 저장됨
**목표**: 새 계정에서 동일한 프로젝트 상태 복원

---

## 📋 이동 전 확인사항

### 현재 계정에서 수행할 작업

#### **1단계: 최신 상태 확인**

```bash
# 프로젝트 디렉토리 이동
cd /home/ubuntu/riq-society-clone

# 현재 상태 확인
git status

# 최신 커밋 확인
git log --oneline -5
```

#### **2단계: 모든 변경사항 저장**

```bash
# 저장되지 않은 변경사항이 있는지 확인
git status

# 변경사항이 있으면 커밋
git add .
git commit -m "Final changes before account migration"

# 또는 체크포인트로 저장
webdev_save_checkpoint --description "Ready for account migration"
```

#### **3단계: 체크포인트 버전 확인**

```bash
# 최신 체크포인트 확인
webdev_check_status

# 또는 Management UI에서 확인
# Dashboard → Checkpoints → 최신 버전 확인
```

**최신 체크포인트**: `be1a124e`

---

## 🔄 새 계정에서 프로젝트 복원

### **방법 1: 체크포인트 복원 (가장 권장)**

#### **1단계: 새 계정 로그인**

```bash
# 새 Manus 계정으로 로그인
# https://manus.im 에서 로그인
```

#### **2단계: 프로젝트 초기화**

```bash
# 새 프로젝트 생성 (같은 이름으로)
webdev_init_project \
  --name riq-society-clone \
  --features db,server,user

# 또는 Management UI에서:
# Create Project → riq-society-clone → Features: Database, Server, User
```

#### **3단계: 체크포인트 복원**

```bash
# 최신 체크포인트에서 복원
webdev_rollback_checkpoint \
  --version be1a124e

# 또는 Management UI에서:
# Dashboard → Checkpoints → be1a124e → Rollback
```

**결과**:
- ✅ 모든 코드 자동 복원
- ✅ 데이터베이스 스키마 자동 적용
- ✅ 의존성 자동 설치
- ✅ 개발 서버 자동 시작

#### **4단계: 상태 확인**

```bash
# 프로젝트 상태 확인
webdev_check_status

# 개발 서버 실행 확인
# http://localhost:5173 접속

# 또는 Management UI에서:
# Preview → 프로젝트 미리보기 확인
```

---

### **방법 2: 코드 다운로드 후 수동 설정**

#### **1단계: 현재 계정에서 코드 다운로드**

```bash
# Management UI에서:
# Code 패널 → Download All Files

# 또는 명령줄에서:
cd /home/ubuntu/riq-society-clone
tar -czf riq-society-clone.tar.gz .
# 파일 다운로드
```

#### **2단계: 새 계정에서 프로젝트 생성**

```bash
webdev_init_project \
  --name riq-society-clone \
  --features db,server,user
```

#### **3단계: 코드 복사**

```bash
# 다운로드한 파일 압축 해제
tar -xzf riq-society-clone.tar.gz -C /home/ubuntu/riq-society-clone/

# 또는 파일 탐색기에서 복사
```

#### **4단계: 의존성 설치**

```bash
cd /home/ubuntu/riq-society-clone

# 의존성 설치
pnpm install

# 또는
npm install
```

#### **5단계: 환경 변수 설정**

```bash
# .env 파일 확인
cat .env

# 필요한 환경 변수:
# - DATABASE_URL
# - VITE_APP_TITLE
# - VITE_OAUTH_PORTAL_URL
# - 기타 API 키

# 새 계정에 맞게 수정
nano .env
```

#### **6단계: 데이터베이스 마이그레이션**

```bash
# 데이터베이스 마이그레이션 실행
pnpm db:push

# 또는
pnpm db:generate
```

#### **7단계: 개발 서버 시작**

```bash
pnpm dev

# 브라우저에서 확인
# http://localhost:5173
```

---

## 📊 방법 비교

| 항목 | 체크포인트 복원 | 코드 다운로드 |
|------|--------------|-----------|
| **소요 시간** | 5분 | 20분 |
| **자동화** | 100% | 50% |
| **오류 가능성** | 매우 낮음 | 중간 |
| **설정 필요** | 최소 | 많음 |
| **권장도** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## ✅ 이동 완료 후 확인사항

### **1. 프로젝트 상태 확인**

```bash
# 프로젝트 정보 확인
webdev_check_status

# 예상 결과:
# Project: riq-society-clone
# Version: be1a124e
# Status: running
# Build: success
```

### **2. 개발 서버 확인**

```bash
# 브라우저에서 접속
http://localhost:5173

# 확인 사항:
# ✅ 홈페이지 로드
# ✅ 헤더 메뉴 표시
# ✅ 저널 메뉴 표시 (정회원 로그인 시)
```

### **3. 관리자 페이지 확인**

```bash
# 관리자 계정으로 로그인
http://localhost:5173/admin

# 확인 사항:
# ✅ 저널 탭 표시
# ✅ 저널 목록 조회 가능
# ✅ 저널 추가/수정/삭제 가능
```

### **4. 저널 페이지 확인**

```bash
# 정회원 계정으로 로그인
http://localhost:5173/journals

# 확인 사항:
# ✅ 저널 목록 표시
# ✅ 카테고리 필터링 작동
# ✅ 검색 기능 작동
# ✅ 정렬 옵션 작동
```

### **5. 저널 상세 페이지 확인**

```bash
# 저널 클릭
http://localhost:5173/journals/[slug]

# 확인 사항:
# ✅ 마크다운 렌더링
# ✅ 메타데이터 표시
# ✅ PDF 다운로드 버튼 (있는 경우)
# ✅ 공유 버튼 작동
# ✅ 관련 저널 표시
```

### **6. 데이터베이스 연결 확인**

```bash
# 데이터베이스 상태 확인
pnpm db:check

# 또는 Management UI에서:
# Database 패널 → 테이블 목록 확인
```

---

## 🔧 문제 해결

### **문제 1: 체크포인트 복원 실패**

```bash
# 원인: 체크포인트 버전 오류

# 해결 방법
# 1. 사용 가능한 체크포인트 확인
webdev_check_status

# 2. 올바른 버전으로 복원
webdev_rollback_checkpoint --version be1a124e

# 3. 여전히 실패하면 수동 설정 사용
```

### **문제 2: 의존성 설치 실패**

```bash
# 원인: Node.js 버전 호환성

# 해결 방법
# 1. Node.js 버전 확인
node --version

# 2. pnpm 캐시 초기화
pnpm store prune

# 3. 다시 설치
pnpm install
```

### **문제 3: 데이터베이스 연결 실패**

```bash
# 원인: DATABASE_URL 오류

# 해결 방법
# 1. .env 파일 확인
cat .env | grep DATABASE_URL

# 2. MySQL 서비스 확인
sudo systemctl status mysql

# 3. 데이터베이스 생성 확인
mysql -u root -p'password' -e "SHOW DATABASES;"

# MYSQL_SETUP_GUIDE.md 참고
```

### **문제 4: 포트 충돌**

```bash
# 원인: 포트 3000 또는 5173이 이미 사용 중

# 해결 방법
# 1. 사용 중인 프로세스 확인
lsof -i :3000
lsof -i :5173

# 2. 프로세스 종료
kill -9 [PID]

# 3. 개발 서버 재시작
pnpm dev
```

---

## 📚 참고 문서

### 새 계정에서 참고할 문서

1. **COMPLETE_CONVERSATION_LOG.md**
   - 전체 작업 내용
   - 구현 세부사항
   - 코드 변경사항

2. **JOURNAL_IMPLEMENTATION_SUMMARY.md**
   - 완료된 기능 목록
   - 파일 구조
   - 기술 스택

3. **NEXT_STEPS.md**
   - 다음 단계 (읽은 저널 추적)
   - 구현 코드 예제
   - 테스트 체크리스트

4. **MYSQL_SETUP_GUIDE.md**
   - MySQL 설정 방법
   - 데이터베이스 연결 검증
   - 문제 해결

5. **ACCOUNT_MIGRATION_GUIDE.md** (이 문서)
   - 계정 이동 절차
   - 체크포인트 복원
   - 문제 해결

---

## 🚀 빠른 시작 (체크포인트 복원)

```bash
# 1. 새 계정에서 프로젝트 생성
webdev_init_project --name riq-society-clone --features db,server,user

# 2. 체크포인트 복원
webdev_rollback_checkpoint --version be1a124e

# 3. 상태 확인
webdev_check_status

# 4. 브라우저에서 확인
# http://localhost:5173
```

**총 소요 시간**: 약 5분

---

## 📞 추가 지원

### 문제 발생 시

1. **COMPLETE_CONVERSATION_LOG.md** 확인
   - 비슷한 문제 해결 방법 찾기

2. **MYSQL_SETUP_GUIDE.md** 확인
   - 데이터베이스 관련 문제

3. **NEXT_STEPS.md** 확인
   - 구현 관련 문제

4. **Management UI** 사용
   - Preview: 실시간 미리보기
   - Code: 파일 탐색
   - Database: DB 상태 확인
   - Dashboard: 프로젝트 상태

---

## ✨ 이동 후 다음 단계

### 즉시 할 수 있는 작업

1. **읽은 저널 추적 기능 구현** (NEXT_STEPS.md 참고)
   - useReadJournals 커스텀 훅 생성
   - JournalDetail.tsx 수정
   - Journals.tsx 수정

2. **마크다운 실시간 프리뷰 추가** (선택사항)
   - Admin.tsx 에디터 개선

3. **추가 기능 구현**
   - 댓글 시스템
   - 조회수 통계
   - 저널 검색 고도화

---

**마지막 업데이트**: 2025-10-29
**최신 체크포인트**: be1a124e
**상태**: 이동 준비 완료 ✅

