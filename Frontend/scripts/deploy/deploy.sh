#!/bin/bash

# Phoenix AWS EC2 배포 스크립트
# PM2, Nginx 설정 포함

echo "🚀 Phoenix AWS EC2 배포 스크립트 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 설정 변수
APP_NAME="phoenix"
BACKEND_PORT=3000
FRONTEND_PORT=3001
NGINX_CONFIG="/etc/nginx/sites-available/phoenix"
NGINX_ENABLED="/etc/nginx/sites-enabled/phoenix"

# 에러 처리 함수
handle_error() {
    echo -e "${RED}❌ 배포 실패: $1${NC}"
    exit 1
}

# 시스템 업데이트
echo -e "${YELLOW}📦 시스템 패키지 업데이트...${NC}"
sudo apt update && sudo apt upgrade -y || handle_error "시스템 업데이트 실패"

# Node.js 설치 (18.x LTS)
echo -e "${YELLOW}📦 Node.js 설치...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs || handle_error "Node.js 설치 실패"

# PM2 설치
echo -e "${YELLOW}📦 PM2 설치...${NC}"
sudo npm install -g pm2 || handle_error "PM2 설치 실패"

# Nginx 설치
echo -e "${YELLOW}📦 Nginx 설치...${NC}"
sudo apt install -y nginx || handle_error "Nginx 설치 실패"

# MySQL 설치
echo -e "${YELLOW}📦 MySQL 설치...${NC}"
sudo apt install -y mysql-server || handle_error "MySQL 설치 실패"

# 애플리케이션 디렉토리 생성
echo -e "${YELLOW}📁 애플리케이션 디렉토리 설정...${NC}"
sudo mkdir -p /var/www/phoenix
sudo chown -R $USER:$USER /var/www/phoenix

# Backend 배포
echo -e "${BLUE}🔧 Backend 배포...${NC}"
cd /var/www/phoenix/backend || handle_error "Backend 디렉토리 이동 실패"

# 환경 변수 파일 생성
cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=phoenix_user
DB_PASSWORD=phoenix_password_2024
DB_DATABASE=phoenix

# Application Configuration
NODE_ENV=production
PORT=3000

# JWT Configuration
JWT_SECRET=phoenix_jwt_secret_2024_production
JWT_EXPIRES_IN=24h
EOF

# PM2 설정 파일 생성
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'phoenix-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/phoenix-backend-error.log',
    out_file: '/var/log/pm2/phoenix-backend-out.log',
    log_file: '/var/log/pm2/phoenix-backend.log',
    time: true
  }]
};
EOF

# PM2로 애플리케이션 시작
pm2 start ecosystem.config.js || handle_error "PM2 시작 실패"
pm2 save || handle_error "PM2 설정 저장 실패"
pm2 startup || handle_error "PM2 자동 시작 설정 실패"

# Nginx 설정
echo -e "${BLUE}🔧 Nginx 설정...${NC}"
sudo tee $NGINX_CONFIG > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend (React)
    location / {
        root /var/www/phoenix/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # API 문서
    location /api-docs {
        proxy_pass http://localhost:3000/api;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Nginx 사이트 활성화
sudo ln -sf $NGINX_CONFIG $NGINX_ENABLED
sudo nginx -t || handle_error "Nginx 설정 검증 실패"
sudo systemctl restart nginx || handle_error "Nginx 재시작 실패"
sudo systemctl enable nginx || handle_error "Nginx 자동 시작 설정 실패"

# 방화벽 설정
echo -e "${BLUE}🔧 방화벽 설정...${NC}"
sudo ufw allow 'Nginx Full' || handle_error "방화벽 설정 실패"
sudo ufw allow ssh || handle_error "SSH 방화벽 설정 실패"
sudo ufw --force enable || handle_error "방화벽 활성화 실패"

# MySQL 데이터베이스 설정
echo -e "${BLUE}🔧 MySQL 데이터베이스 설정...${NC}"
sudo mysql -e "CREATE DATABASE IF NOT EXISTS phoenix;" || handle_error "데이터베이스 생성 실패"
sudo mysql -e "CREATE USER IF NOT EXISTS 'phoenix_user'@'localhost' IDENTIFIED BY 'phoenix_password_2024';" || handle_error "사용자 생성 실패"
sudo mysql -e "GRANT ALL PRIVILEGES ON phoenix.* TO 'phoenix_user'@'localhost';" || handle_error "권한 부여 실패"
sudo mysql -e "FLUSH PRIVILEGES;" || handle_error "권한 새로고침 실패"

# SSL 인증서 설정 (Let's Encrypt)
echo -e "${YELLOW}🔒 SSL 인증서 설정 (선택사항)...${NC}"
read -p "SSL 인증서를 설정하시겠습니까? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo apt install -y certbot python3-certbot-nginx || handle_error "Certbot 설치 실패"
    echo -e "${YELLOW}도메인을 입력하세요 (예: your-domain.com):${NC}"
    read DOMAIN
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN || handle_error "SSL 인증서 설정 실패"
fi

echo -e "${GREEN}🎉 Phoenix 배포 완료!${NC}"
echo -e "${BLUE}📊 서비스 상태 확인:${NC}"
echo "PM2 상태: pm2 status"
echo "Nginx 상태: sudo systemctl status nginx"
echo "MySQL 상태: sudo systemctl status mysql"
echo -e "${YELLOW}💡 로그 확인:${NC}"
echo "애플리케이션 로그: pm2 logs phoenix-backend"
echo "Nginx 로그: sudo tail -f /var/log/nginx/error.log"
