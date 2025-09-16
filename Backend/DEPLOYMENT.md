# Phoenix Backend 배포 가이드

## 🚀 AWS EC2 배포 준비사항

### 1. 환경 설정

#### 필수 환경 변수 (.env 파일)

```bash
# Database Configuration
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=phoenix

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=production
PORT=3000

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com
```

### 2. 데이터베이스 설정

#### MySQL 데이터베이스 생성

```sql
CREATE DATABASE phoenix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 데이터베이스 스키마 적용

```bash
# Database 폴더의 스키마 파일을 MySQL에 적용
mysql -u your_username -p phoenix < ../Database/phoenix_schema_mysql.sql
```

### 3. AWS EC2 배포 스크립트

#### 배포 스크립트 (deploy.sh)

```bash
#!/bin/bash

# 서버 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 18.x 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치 (프로세스 관리)
sudo npm install -g pm2

# 프로젝트 클론 또는 업데이트
cd /var/www
git clone https://github.com/your-repo/phoenix.git
cd phoenix/Backend

# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 실제 값으로 설정

# PM2로 애플리케이션 시작
pm2 start dist/main.js --name "phoenix-backend"

# PM2 설정 저장
pm2 save
pm2 startup

# Nginx 설정 (선택사항)
sudo apt install nginx -y
```

#### Nginx 설정 (/etc/nginx/sites-available/phoenix)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 보안 설정

#### 방화벽 설정

```bash
# UFW 방화벽 활성화
sudo ufw enable

# 필요한 포트만 열기
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # Backend (내부용)
```

#### SSL 인증서 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com
```

### 5. 모니터링 및 로그

#### PM2 모니터링

```bash
# 애플리케이션 상태 확인
pm2 status

# 로그 확인
pm2 logs phoenix-backend

# 애플리케이션 재시작
pm2 restart phoenix-backend

# 애플리케이션 중지
pm2 stop phoenix-backend
```

#### 시스템 모니터링

```bash
# 시스템 리소스 확인
htop
df -h
free -h

# 네트워크 상태 확인
netstat -tlnp
```

### 6. 백업 및 복구

#### 데이터베이스 백업

```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u your_username -p phoenix > /backup/phoenix_backup_$DATE.sql
```

#### 자동 백업 설정 (crontab)

```bash
# 매일 새벽 2시에 백업
0 2 * * * /path/to/backup-db.sh
```

### 7. 성능 최적화

#### PM2 클러스터 모드

```bash
# CPU 코어 수만큼 인스턴스 실행
pm2 start dist/main.js -i max --name "phoenix-backend"
```

#### Nginx 캐싱 설정

```nginx
# 정적 파일 캐싱
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 8. 트러블슈팅

#### 일반적인 문제들

1. **포트 충돌**

   ```bash
   # 포트 사용 중인 프로세스 확인
   sudo lsof -i :3000
   ```

2. **메모리 부족**

   ```bash
   # 메모리 사용량 확인
   free -h
   # 스왑 메모리 추가
   sudo fallocate -l 2G /swapfile
   ```

3. **데이터베이스 연결 실패**
   ```bash
   # MySQL 상태 확인
   sudo systemctl status mysql
   # 연결 테스트
   mysql -u username -p -h hostname
   ```

### 9. CI/CD 파이프라인 (GitHub Actions)

#### .github/workflows/deploy.yml

```yaml
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
            cd /var/www/phoenix/Backend
            git pull origin main
            npm install
            npm run build
            pm2 restart phoenix-backend
```

### 10. 헬스체크 엔드포인트

애플리케이션에 다음 엔드포인트들이 포함되어 있습니다:

- `GET /api/common/health` - 서비스 상태 확인
- `GET /api` - Swagger API 문서

### 11. 로그 관리

#### 로그 로테이션 설정

```bash
# logrotate 설정
sudo nano /etc/logrotate.d/phoenix

# 내용:
/var/log/phoenix/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

이 가이드를 따라하면 Phoenix Backend를 AWS EC2에 성공적으로 배포할 수 있습니다.
