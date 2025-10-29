# MySQL Root 계정 패스워드 인증 설정 및 데이터베이스 연결 검증 가이드

## 1. MySQL Root 계정 패스워드 설정

### 1.1 현재 상태 확인
```bash
# MySQL 서비스 상태 확인
sudo systemctl status mysql

# MySQL 접속 시도 (auth_socket 사용 중)
sudo mysql -u root
```

### 1.2 Root 계정 패스워드 설정 (2가지 방법)

#### **방법 A: MySQL 쉘에서 직접 설정 (권장)**

```bash
# 1. root 권한으로 MySQL 접속 (현재 auth_socket 사용)
sudo mysql -u root

# 2. MySQL 쉘에서 패스워드 변경
mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_secure_password';
mysql> FLUSH PRIVILEGES;
mysql> EXIT;
```

#### **방법 B: 명령줄에서 직접 설정**

```bash
# 한 줄로 실행
sudo mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_secure_password'; FLUSH PRIVILEGES;"
```

### 1.3 패스워드 설정 확인

```bash
# 패스워드로 접속 테스트
mysql -u root -p
# 프롬프트에서 설정한 패스워드 입력

# 또는 한 줄로
mysql -u root -p'your_secure_password' -e "SELECT 1;"
```

---

## 2. 환경 변수 설정

### 2.1 프로젝트 환경 변수 확인

**파일**: `/home/ubuntu/riq-society-clone/.env` (또는 `.env.local`)

```bash
# 현재 설정 확인
cat /home/ubuntu/riq-society-clone/.env
```

### 2.2 데이터베이스 연결 설정

```env
# MySQL 연결 정보
DATABASE_URL="mysql://root:your_secure_password@localhost:3306/riq_society_db"

# 또는 더 자세한 형식
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=riq_society_db
```

### 2.3 Drizzle ORM 설정 확인

**파일**: `/home/ubuntu/riq-society-clone/drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "riq_society_db",
  },
});
```

---

## 3. 데이터베이스 생성 및 초기화

### 3.1 데이터베이스 생성

```bash
# 방법 1: MySQL 쉘 사용
mysql -u root -p'your_secure_password' -e "CREATE DATABASE IF NOT EXISTS riq_society_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 방법 2: 확인과 함께
mysql -u root -p'your_secure_password' << EOF
CREATE DATABASE IF NOT EXISTS riq_society_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE riq_society_db;
SHOW TABLES;
EOF
```

### 3.2 데이터베이스 사용자 생성 (선택사항)

```bash
# 별도의 애플리케이션 사용자 생성 (보안 권장)
mysql -u root -p'your_secure_password' << EOF
CREATE USER 'riq_app'@'localhost' IDENTIFIED BY 'app_password';
GRANT ALL PRIVILEGES ON riq_society_db.* TO 'riq_app'@'localhost';
FLUSH PRIVILEGES;
EOF
```

---

## 4. 데이터베이스 연결 검증

### 4.1 기본 연결 테스트

```bash
# 1. 패스워드로 접속 가능 확인
mysql -u root -p'your_secure_password' -e "SELECT VERSION();"

# 2. 데이터베이스 목록 확인
mysql -u root -p'your_secure_password' -e "SHOW DATABASES;"

# 3. 특정 데이터베이스 선택 및 테이블 확인
mysql -u root -p'your_secure_password' riq_society_db -e "SHOW TABLES;"
```

### 4.2 프로젝트에서 연결 테스트

```bash
# 프로젝트 디렉토리로 이동
cd /home/ubuntu/riq-society-clone

# 환경 변수 설정 확인
echo $DATABASE_URL
# 또는
cat .env | grep DATABASE_URL

# Drizzle 마이그레이션 실행 (연결 테스트)
pnpm db:push

# 또는 마이그레이션만 생성
pnpm db:generate
```

### 4.3 Node.js에서 직접 연결 테스트

**파일**: `test-db-connection.js` (프로젝트 루트에 생성)

```javascript
import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'riq_society_db',
    });

    console.log('✅ 데이터베이스 연결 성공!');
    
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ 쿼리 실행 성공:', rows);

    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✅ 테이블 목록:', tables);

    await connection.end();
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    process.exit(1);
  }
}

testConnection();
```

**실행**:
```bash
# 먼저 mysql2 패키지 설치
pnpm add mysql2

# 테스트 실행
node test-db-connection.js
```

### 4.4 개발 서버에서 연결 테스트

```bash
# 개발 서버 시작
pnpm dev

# 브라우저에서 애플리케이션 접속
# http://localhost:5173 (또는 설정된 포트)

# 관리자 페이지 접속 후 데이터베이스 쿼리 실행 확인
# /admin 페이지에서 FAQ, 블로그, 저널 등의 데이터 조회 가능 여부 확인
```

---

## 5. 문제 해결

### 5.1 "Access denied for user 'root'@'localhost'"

```bash
# 원인: 패스워드 설정이 안 되었거나 잘못된 패스워드

# 해결 방법 1: auth_socket으로 다시 접속
sudo mysql -u root

# 해결 방법 2: 패스워드 리셋
sudo mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password'; FLUSH PRIVILEGES;"
```

### 5.2 "Can't connect to MySQL server on 'localhost'"

```bash
# 원인: MySQL 서비스가 실행 중이지 않음

# 해결 방법
sudo systemctl start mysql
sudo systemctl status mysql

# 또는 포트 확인
sudo netstat -tlnp | grep 3306
# 또는
sudo ss -tlnp | grep 3306
```

### 5.3 "Unknown database 'riq_society_db'"

```bash
# 원인: 데이터베이스가 생성되지 않음

# 해결 방법
mysql -u root -p'your_secure_password' -e "CREATE DATABASE riq_society_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 5.4 "ECONNREFUSED 127.0.0.1:3306"

```bash
# 원인: Node.js에서 MySQL에 연결할 수 없음

# 확인 사항
1. MySQL 서비스 실행 중인지 확인
   sudo systemctl status mysql

2. .env 파일의 DATABASE_URL 확인
   cat .env | grep DATABASE_URL

3. 환경 변수가 제대로 로드되는지 확인
   node -e "console.log(process.env.DATABASE_URL)"

4. 방화벽 확인
   sudo ufw status
   sudo ufw allow 3306/tcp (필요시)
```

### 5.5 "Drizzle migration failed"

```bash
# 원인: 데이터베이스 연결 문제 또는 스키마 오류

# 해결 방법
1. 연결 테스트 먼저 실행
   mysql -u root -p'your_secure_password' riq_society_db -e "SELECT 1;"

2. 마이그레이션 파일 확인
   ls -la drizzle/*.sql

3. 마이그레이션 다시 실행
   pnpm db:push

4. 마이그레이션 상태 확인
   pnpm db:check
```

---

## 6. 보안 권장사항

### 6.1 Root 계정 보안

```bash
# 1. 강력한 패스워드 설정 (최소 12자, 대소문자, 숫자, 특수문자 포함)
mysql -u root -p'old_password' -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'StrongP@ssw0rd123';"

# 2. Root 원격 접속 비활성화 (로컬만 허용)
mysql -u root -p'your_secure_password' -e "DELETE FROM mysql.user WHERE User='root' AND Host!='localhost'; FLUSH PRIVILEGES;"

# 3. 익명 사용자 제거
mysql -u root -p'your_secure_password' -e "DELETE FROM mysql.user WHERE User=''; FLUSH PRIVILEGES;"
```

### 6.2 애플리케이션 사용자 설정 (권장)

```bash
# Root 대신 애플리케이션 전용 사용자 생성
mysql -u root -p'your_secure_password' << EOF
CREATE USER 'riq_app'@'localhost' IDENTIFIED BY 'AppP@ssw0rd123';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP ON riq_society_db.* TO 'riq_app'@'localhost';
FLUSH PRIVILEGES;
EOF

# .env 파일 수정
# DATABASE_URL="mysql://riq_app:AppP@ssw0rd123@localhost:3306/riq_society_db"
```

### 6.3 환경 변수 보안

```bash
# .env 파일 권한 설정
chmod 600 /home/ubuntu/riq-society-clone/.env

# .env 파일을 git에서 제외 (이미 설정되어야 함)
cat /home/ubuntu/riq-society-clone/.gitignore | grep .env
```

---

## 7. 검증 체크리스트

### 설정 완료 후 확인 사항

- [ ] MySQL 서비스 실행 중
  ```bash
  sudo systemctl status mysql
  ```

- [ ] Root 계정 패스워드 인증 작동
  ```bash
  mysql -u root -p'your_secure_password' -e "SELECT 1;"
  ```

- [ ] 데이터베이스 생성됨
  ```bash
  mysql -u root -p'your_secure_password' -e "SHOW DATABASES;" | grep riq_society_db
  ```

- [ ] .env 파일 설정됨
  ```bash
  cat .env | grep DATABASE_URL
  ```

- [ ] Drizzle 마이그레이션 성공
  ```bash
  cd /home/ubuntu/riq-society-clone && pnpm db:push
  ```

- [ ] 테이블 생성됨
  ```bash
  mysql -u root -p'your_secure_password' riq_society_db -e "SHOW TABLES;"
  ```

- [ ] 개발 서버 연결 성공
  ```bash
  cd /home/ubuntu/riq-society-clone && pnpm dev
  # 브라우저에서 http://localhost:5173 접속
  ```

- [ ] 관리자 페이지 데이터 조회 가능
  ```
  /admin 페이지 접속 → FAQ, 블로그, 저널 등 데이터 표시
  ```

---

## 8. 빠른 참고 명령어

```bash
# MySQL 서비스 제어
sudo systemctl start mysql      # 시작
sudo systemctl stop mysql       # 중지
sudo systemctl restart mysql    # 재시작
sudo systemctl status mysql     # 상태 확인

# 데이터베이스 연결
mysql -u root -p'password' -e "SELECT 1;"
mysql -u root -p'password' database_name -e "SHOW TABLES;"

# 마이그레이션
pnpm db:push                    # 마이그레이션 실행
pnpm db:generate                # 마이그레이션 파일 생성
pnpm db:check                   # 마이그레이션 상태 확인

# 개발 서버
pnpm dev                        # 개발 서버 시작
pnpm build                      # 빌드
```

---

## 9. 참고: Drizzle ORM 설정 파일

**파일**: `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "riq_society_db",
  },
});
```

---

## 10. 다음 단계

설정 완료 후:

1. ✅ MySQL 서비스 실행 확인
2. ✅ Root 계정 패스워드 설정
3. ✅ 데이터베이스 생성
4. ✅ .env 파일 설정
5. ✅ 연결 테스트 (위의 4.1-4.4 참고)
6. ✅ Drizzle 마이그레이션 실행
7. ✅ 개발 서버 시작
8. ✅ 애플리케이션 테스트

모든 단계가 완료되면 저널 시스템을 포함한 전체 애플리케이션이 정상 작동할 것입니다!

---

**마지막 업데이트**: 2025-10-29

