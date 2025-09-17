# Phoenix Platform Docker 배포 가이드

이 문서는 Phoenix Platform을 Docker 컨테이너로 배포하는 방법을 설명합니다.

## 📋 사전 요구사항

- Docker 20.10+
- Docker Compose 2.0+
- Git
- OpenSSL (SSL 인증서 생성용)

## 🚀 빠른 시작

### 1. 개발 환경 배포

```bash
# 저장소 클론
git clone <repository-url>
cd Phoenix

# 환경변수 설정
cp env.example .env
# .env 파일을 편집하여 필요한 값들을 설정

# 배포 실행
./deploy.sh development
```

### 2. 프로덕션 환경 배포

```bash
# 프로덕션 환경변수 설정
cp env.production .env
# .env 파일을 편집하여 실제 프로덕션 값들을 설정

# SSL 인증서 준비 (Let's Encrypt 또는 상용 인증서)
# nginx/ssl/ 디렉토리에 phoenix.crt와 phoenix.key 파일 배치

# 프로덕션 배포 실행
./deploy.sh production
```

## 🔧 환경변수 설정

### 필수 환경변수

| 변수명                | 설명                        | 예시                       |
| --------------------- | --------------------------- | -------------------------- |
| `DB_PASSWORD`         | MySQL 데이터베이스 비밀번호 | `secure_password_123!`     |
| `JWT_SECRET`          | JWT 토큰 서명용 비밀키      | `your_jwt_secret_key_here` |
| `MYSQL_ROOT_PASSWORD` | MySQL root 비밀번호         | `root_password_123!`       |
| `REDIS_PASSWORD`      | Redis 비밀번호              | `redis_password_123!`      |

### OAuth 설정 (선택사항)

| 변수명                 | 설명                           |
| ---------------------- | ------------------------------ |
| `GOOGLE_CLIENT_ID`     | Google OAuth 클라이언트 ID     |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 시크릿 |
| `GOOGLE_CALLBACK_URL`  | Google OAuth 콜백 URL          |

## 🐳 Docker 서비스 구성

### 서비스 목록

1. **mysql**: MySQL 8.0 데이터베이스
2. **backend**: NestJS API 서버
3. **frontend**: React + Nginx 웹 서버
4. **redis**: Redis 캐시 서버
5. **nginx**: 리버스 프록시 (프로덕션만)

### 포트 매핑

| 서비스   | 포트 | 설명            |
| -------- | ---- | --------------- |
| Frontend | 80   | 웹 애플리케이션 |
| Backend  | 3000 | API 서버        |
| MySQL    | 3306 | 데이터베이스    |
| Redis    | 6379 | 캐시 서버       |

## 🔒 보안 설정

### 1. 환경변수 보안

- `.env` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션에서는 강력한 비밀번호를 사용하세요
- 정기적으로 비밀번호를 변경하세요

### 2. SSL/TLS 설정

프로덕션 환경에서는 반드시 SSL 인증서를 설정하세요:

```bash
# Let's Encrypt 인증서 생성 (예시)
certbot certonly --standalone -d yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/phoenix.crt
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/phoenix.key
```

### 3. 방화벽 설정

```bash
# 필요한 포트만 열기
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22  # SSH
sudo ufw enable
```

## 📊 모니터링 및 로그

### 로그 확인

```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### 헬스 체크

```bash
# 서비스 상태 확인
docker-compose ps

# 헬스 체크 엔드포인트
curl http://localhost:80/health
curl http://localhost:3000/health
```

## 🔄 업데이트 및 유지보수

### 애플리케이션 업데이트

```bash
# 코드 업데이트 후
git pull origin main

# 컨테이너 재빌드 및 재시작
docker-compose down
docker-compose up --build -d
```

### 데이터베이스 백업

```bash
# 데이터베이스 백업
docker-compose exec mysql mysqldump -u root -p phoenix > backup_$(date +%Y%m%d_%H%M%S).sql

# 데이터베이스 복원
docker-compose exec -T mysql mysql -u root -p phoenix < backup_file.sql
```

### 볼륨 정리

```bash
# 사용하지 않는 볼륨 정리
docker volume prune

# 모든 컨테이너 및 볼륨 정리 (주의!)
docker-compose down -v
docker system prune -a
```

## 🚨 문제 해결

### 일반적인 문제들

1. **포트 충돌**

   ```bash
   # 포트 사용 중인 프로세스 확인
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :3000
   ```

2. **메모리 부족**

   ```bash
   # Docker 메모리 사용량 확인
   docker stats
   ```

3. **데이터베이스 연결 실패**
   ```bash
   # MySQL 컨테이너 로그 확인
   docker-compose logs mysql
   ```

### 로그 레벨 조정

환경변수에서 로그 레벨을 조정할 수 있습니다:

```bash
# .env 파일에 추가
LOG_LEVEL=debug  # debug, info, warn, error
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. Docker 및 Docker Compose 버전
2. 시스템 리소스 (메모리, 디스크 공간)
3. 네트워크 연결
4. 환경변수 설정
5. 로그 파일

추가 도움이 필요하면 개발팀에 문의하세요.
