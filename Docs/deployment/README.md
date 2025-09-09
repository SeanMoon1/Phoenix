# Phoenix 배포 가이드

## 🚀 배포 개요

Phoenix 재난 대응 훈련 시스템의 AWS EC2 배포 가이드입니다.

## 📋 배포 전 체크리스트

### 필수 요구사항

- [ ] AWS 계정 및 EC2 인스턴스 준비
- [ ] 도메인 설정 (선택사항)
- [ ] SSL 인증서 준비 (Let's Encrypt 사용 가능)
- [ ] 데이터베이스 설정 (MySQL)

### 소프트웨어 요구사항

- **Node.js**: 18.x LTS 이상
- **MySQL**: 8.0 이상
- **Nginx**: 최신 버전
- **PM2**: 프로세스 관리

## 🏗️ 인프라 구조

```
Internet
    ↓
Route 53 (DNS)
    ↓
CloudFront (CDN) - 선택사항
    ↓
Application Load Balancer - 선택사항
    ↓
EC2 Instance
    ├── Nginx (Reverse Proxy)
    ├── PM2 (Process Manager)
    ├── Phoenix Backend (NestJS)
    └── Phoenix Frontend (React)
    ↓
RDS MySQL (Database)
```

## 💰 AWS 비용 최적화

### EC2 인스턴스

- **개발/테스트**: t3.micro (1 vCPU, 1GB RAM) - 월 $8.50
- **소규모 운영**: t3.small (2 vCPU, 2GB RAM) - 월 $17.00
- **중규모 운영**: t3.medium (2 vCPU, 4GB RAM) - 월 $34.00

### RDS MySQL

- **개발**: db.t3.micro (1 vCPU, 1GB RAM) - 월 $15.00
- **소규모 운영**: db.t3.small (2 vCPU, 2GB RAM) - 월 $30.00
- **중규모 운영**: db.t3.medium (2 vCPU, 4GB RAM) - 월 $60.00

### 스토리지

- **EC2 EBS**: GP2 SSD 20GB - 월 $2.00
- **RDS 스토리지**: GP2 SSD 20GB - 월 $2.30

### 예상 월 비용

- **최소 구성**: $25.50/월 (t3.micro + db.t3.micro)
- **소규모 운영**: $49.30/월 (t3.small + db.t3.small)
- **중규모 운영**: $96.30/월 (t3.medium + db.t3.medium)

## 🔧 자동 배포 스크립트

### 1. 배포 스크립트 실행

```bash
# Linux/Mac
chmod +x Scripts/deploy/deploy.sh
./Scripts/deploy/deploy.sh

# Windows
Scripts\deploy\deploy.bat
```

### 2. 수동 배포 단계

#### EC2 인스턴스 설정

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 18.x 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치
sudo npm install -g pm2

# Nginx 설치
sudo apt install -y nginx

# MySQL 설치
sudo apt install -y mysql-server
```

#### 애플리케이션 배포

```bash
# 애플리케이션 디렉토리 생성
sudo mkdir -p /var/www/phoenix
sudo chown -R $USER:$USER /var/www/phoenix

# 소스 코드 복사
scp -r Backend/ user@your-server:/var/www/phoenix/
scp -r Frontend/ user@your-server:/var/www/phoenix/

# 의존성 설치 및 빌드
cd /var/www/phoenix/Backend
npm ci --production
npm run build

cd /var/www/phoenix/Frontend
npm ci
npm run build
```

## 🔐 보안 설정

### 방화벽 설정

```bash
# UFW 방화벽 설정
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### SSL 인증서 설정

```bash
# Let's Encrypt 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 자동 갱신 설정
sudo crontab -e
# 다음 라인 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 데이터베이스 보안

```bash
# MySQL 보안 설정
sudo mysql_secure_installation

# 데이터베이스 사용자 생성
sudo mysql -e "CREATE USER 'phoenix_user'@'localhost' IDENTIFIED BY 'secure_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON phoenix.* TO 'phoenix_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

## 📊 모니터링 설정

### PM2 모니터링

```bash
# PM2 모니터링 대시보드
pm2 monit

# 로그 확인
pm2 logs phoenix-backend

# 상태 확인
pm2 status
```

### Nginx 로그 모니터링

```bash
# 액세스 로그
sudo tail -f /var/log/nginx/access.log

# 에러 로그
sudo tail -f /var/log/nginx/error.log
```

### 시스템 리소스 모니터링

```bash
# CPU, 메모리 사용량
htop

# 디스크 사용량
df -h

# 네트워크 상태
netstat -tulpn
```

## 🔄 CI/CD 파이프라인

### GitHub Actions 설정

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to EC2
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USERNAME }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/phoenix
            git pull origin main
            cd Backend && npm ci --production && npm run build
            cd ../Frontend && npm ci && npm run build
            pm2 restart phoenix-backend
```

## 🚨 백업 및 복구

### 데이터베이스 백업

```bash
# 자동 백업 스크립트
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u phoenix_user -p phoenix > $BACKUP_DIR/phoenix_$DATE.sql

# 오래된 백업 삭제 (30일 이상)
find $BACKUP_DIR -name "phoenix_*.sql" -mtime +30 -delete
```

### 애플리케이션 백업

```bash
# 소스 코드 백업
tar -czf /var/backups/phoenix_$(date +%Y%m%d).tar.gz /var/www/phoenix

# 설정 파일 백업
cp /etc/nginx/sites-available/phoenix /var/backups/nginx_config_$(date +%Y%m%d)
```

## 🔧 트러블슈팅

### 일반적인 문제들

#### 1. PM2 프로세스가 시작되지 않음

```bash
# 로그 확인
pm2 logs phoenix-backend

# 환경 변수 확인
pm2 env 0

# 수동 재시작
pm2 restart phoenix-backend
```

#### 2. Nginx 502 Bad Gateway

```bash
# Backend 서비스 상태 확인
pm2 status

# 포트 확인
netstat -tulpn | grep 3000

# Nginx 설정 확인
sudo nginx -t
```

#### 3. 데이터베이스 연결 실패

```bash
# MySQL 서비스 상태
sudo systemctl status mysql

# 연결 테스트
mysql -u phoenix_user -p -h localhost phoenix

# 방화벽 확인
sudo ufw status
```

## 📈 성능 최적화

### Nginx 최적화

```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 1024;

# Gzip 압축
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# 캐싱 설정
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### PM2 클러스터 모드

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "phoenix-backend",
      script: "dist/main.js",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "1G",
    },
  ],
};
```

## 🎯 배포 후 확인사항

### 기능 테스트

- [ ] Frontend 접속 확인
- [ ] Backend API 응답 확인
- [ ] 데이터베이스 연결 확인
- [ ] 인증 시스템 동작 확인
- [ ] 파일 업로드/다운로드 확인

### 성능 테스트

- [ ] 페이지 로딩 속도 측정
- [ ] API 응답 시간 측정
- [ ] 동시 사용자 처리 능력 테스트
- [ ] 메모리 사용량 모니터링

### 보안 테스트

- [ ] SSL 인증서 유효성 확인
- [ ] 방화벽 설정 확인
- [ ] 데이터베이스 접근 권한 확인
- [ ] 로그 파일 접근 권한 확인
