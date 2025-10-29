# GitHub 저장소 사용 가이드

**저장소**: https://github.com/Ouroboros-J/riq-society-clone
**상태**: be1a124e 체크포인트 코드 업로드 완료

---

## 🚀 새 계정에서 프로젝트 복원하기

### **방법 1: GitHub에서 직접 클론 (가장 간단)**

```bash
# 1단계: 저장소 클론
git clone https://github.com/Ouroboros-J/riq-society-clone.git
cd riq-society-clone

# 2단계: 프로젝트 생성 (Manus)
webdev_init_project --name riq-society-clone --features db,server,user

# 3단계: 코드 복사
cp -r ~/riq-society-clone/* /home/ubuntu/riq-society-clone/

# 4단계: 의존성 설치
cd /home/ubuntu/riq-society-clone
pnpm install

# 5단계: 데이터베이스 마이그레이션
pnpm db:push

# 6단계: 개발 서버 시작
pnpm dev

# 7단계: 브라우저에서 확인
# http://localhost:5173
```

---

## 📋 단계별 상세 설명

### **1단계: GitHub 저장소 클론**

```bash
# 홈 디렉토리에서 실행
cd ~
git clone https://github.com/Ouroboros-J/riq-society-clone.git

# 결과:
# Cloning into 'riq-society-clone'...
# remote: Enumerating objects: 1503, done.
# ...
# Receiving objects: 100% (1503/1503), done.
```

**확인**:
```bash
cd riq-society-clone
ls -la
# 모든 파일이 보여야 함
```

---

### **2단계: Manus에서 프로젝트 생성**

```bash
# 새 계정에서 프로젝트 초기화
webdev_init_project --name riq-society-clone --features db,server,user

# 또는 Management UI에서:
# Create Project → riq-society-clone → Features: Database, Server, User
```

**결과**:
```
프로젝트 생성 완료
경로: /home/ubuntu/riq-society-clone
```

---

### **3단계: GitHub 코드를 프로젝트로 복사**

```bash
# 홈 디렉토리의 클론한 코드를 프로젝트 디렉토리로 복사
cp -r ~/riq-society-clone/* /home/ubuntu/riq-society-clone/

# 또는 더 안전하게:
cd ~/riq-society-clone
cp -r . /home/ubuntu/riq-society-clone/
```

**확인**:
```bash
ls -la /home/ubuntu/riq-society-clone/
# 다음 파일들이 보여야 함:
# - client/
# - server/
# - drizzle/
# - package.json
# - COMPLETE_CONVERSATION_LOG.md
# - JOURNAL_IMPLEMENTATION_SUMMARY.md
# - 등등...
```

---

### **4단계: 의존성 설치**

```bash
cd /home/ubuntu/riq-society-clone

# 의존성 설치
pnpm install

# 또는
npm install
```

**소요 시간**: 약 3-5분

**확인**:
```bash
ls -la node_modules/
# node_modules 폴더가 생성되어야 함
```

---

### **5단계: 데이터베이스 마이그레이션**

```bash
cd /home/ubuntu/riq-society-clone

# 데이터베이스 마이그레이션 실행
pnpm db:push

# 또는
npm run db:push
```

**확인**:
```bash
# 마이그레이션 성공 메시지가 보여야 함
# ✓ Migrations applied
```

**문제 발생 시**:
- MYSQL_SETUP_GUIDE.md 참고
- MySQL 서비스 실행 확인
- DATABASE_URL 환경 변수 확인

---

### **6단계: 개발 서버 시작**

```bash
cd /home/ubuntu/riq-society-clone

# 개발 서버 시작
pnpm dev

# 또는
npm run dev
```

**결과**:
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

### **7단계: 브라우저에서 확인**

```
http://localhost:5173
```

**확인 사항**:
- ✅ 홈페이지 로드
- ✅ Header 메뉴 표시
- ✅ 저널 메뉴 표시 (정회원 로그인 후)
- ✅ 모든 기능 정상 작동

---

## 🔄 Git 히스토리 확인

### **커밋 히스토리 보기**

```bash
cd /home/ubuntu/riq-society-clone

# 최근 커밋 확인
git log --oneline -5

# 결과:
# a3acf5a Journal system implementation complete - checkpoint be1a124e
# be1a124 Checkpoint: Journal Frontend System Complete
# d18e68c Checkpoint: Journal Management System Complete
# f07022a Checkpoint: 에러 수정 및 Privacy 페이지 추가
# 971aa6e Checkpoint: 배지 색상 중립화 및 입회 메뉴 로직 개선
```

### **특정 커밋 상세 보기**

```bash
git show a3acf5a
# 또는
git show be1a124e
```

---

## 📚 참고 문서

### **프로젝트 루트에 포함된 문서**

```
/home/ubuntu/riq-society-clone/
├── COMPLETE_CONVERSATION_LOG.md
│   └─ 전체 작업 내용 (코드 포함)
├── JOURNAL_IMPLEMENTATION_SUMMARY.md
│   └─ 구현 요약
├── NEXT_STEPS.md
│   └─ 다음 단계 (읽은 저널 추적 기능)
├── MYSQL_SETUP_GUIDE.md
│   └─ MySQL 설정 및 문제 해결
├── ACCOUNT_MIGRATION_GUIDE.md
│   └─ 계정 이동 절차
└── GITHUB_USAGE_GUIDE.md (이 문서)
    └─ GitHub 저장소 사용 방법
```

---

## ✅ 복원 완료 확인 체크리스트

```bash
# 1. 프로젝트 상태 확인
webdev_check_status
# → Status: running ✅

# 2. 파일 확인
ls -la /home/ubuntu/riq-society-clone/
# → 모든 파일 보임 ✅

# 3. 의존성 확인
ls -la node_modules/ | head
# → node_modules 폴더 존재 ✅

# 4. 데이터베이스 확인
pnpm db:check
# → 마이그레이션 완료 ✅

# 5. 개발 서버 확인
pnpm dev
# → http://localhost:5173 접속 가능 ✅

# 6. 기능 확인
# → 홈페이지, 저널, 관리자 페이지 정상 작동 ✅
```

---

## 🚨 문제 해결

### **문제 1: git clone 실패**

```bash
# 오류: "fatal: unable to access repository"

# 해결 방법:
# 1. 인터넷 연결 확인
# 2. GitHub 저장소 URL 확인
# 3. 다시 시도
git clone https://github.com/Ouroboros-J/riq-society-clone.git
```

### **문제 2: pnpm install 실패**

```bash
# 오류: "ERR! 404 Not Found"

# 해결 방법:
# 1. pnpm 캐시 초기화
pnpm store prune

# 2. node_modules 삭제 후 재설치
rm -rf node_modules
pnpm install
```

### **문제 3: pnpm db:push 실패**

```bash
# 오류: "ECONNREFUSED 127.0.0.1:3306"

# 해결 방법:
# 1. MySQL 서비스 확인
sudo systemctl status mysql

# 2. MySQL 시작
sudo systemctl start mysql

# 3. 데이터베이스 연결 확인
mysql -u root -p'password' -e "SELECT 1;"

# 자세한 내용은 MYSQL_SETUP_GUIDE.md 참고
```

### **문제 4: pnpm dev 실패**

```bash
# 오류: "EADDRINUSE :::5173"

# 해결 방법:
# 1. 포트 사용 중인 프로세스 확인
lsof -i :5173

# 2. 프로세스 종료
kill -9 [PID]

# 3. 개발 서버 재시작
pnpm dev
```

---

## 🎯 다음 단계

### **즉시 할 수 있는 작업**

1. **읽은 저널 추적 기능 구현**
   - NEXT_STEPS.md 참고
   - useReadJournals 커스텀 훅 생성
   - Journals.tsx, JournalDetail.tsx 수정

2. **마크다운 실시간 프리뷰 추가** (선택사항)
   - Admin.tsx 에디터 개선

3. **추가 기능 구현**
   - 댓글 시스템
   - 통계 기능
   - 기타 기능

---

## 📞 빠른 참고

### **자주 사용하는 명령어**

```bash
# 개발 서버 시작
pnpm dev

# 빌드
pnpm build

# 데이터베이스 마이그레이션
pnpm db:push

# 마이그레이션 생성
pnpm db:generate

# Git 커밋
git add .
git commit -m "메시지"

# Git 푸시
git push origin master

# 프로젝트 상태 확인
webdev_check_status

# 체크포인트 저장
webdev_save_checkpoint --description "설명"
```

---

## ✨ 정리

| 단계 | 명령어 | 소요 시간 |
|------|--------|---------|
| 1. Git 클론 | `git clone ...` | 1분 |
| 2. 프로젝트 생성 | `webdev_init_project ...` | 2분 |
| 3. 코드 복사 | `cp -r ...` | 1분 |
| 4. 의존성 설치 | `pnpm install` | 3-5분 |
| 5. DB 마이그레이션 | `pnpm db:push` | 1분 |
| 6. 개발 서버 시작 | `pnpm dev` | 1분 |
| **총 소요 시간** | | **약 10-15분** |

---

**이제 새 계정에서 GitHub 저장소를 사용해서 프로젝트를 복원할 수 있습니다!** 🚀

---

**마지막 업데이트**: 2025-10-29
**저장소**: https://github.com/Ouroboros-J/riq-society-clone
**상태**: be1a124e 체크포인트 완료

