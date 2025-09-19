#!/bin/bash

# Phoenix OAuth 문제 해결을 위한 배포 스크립트
# 이 스크립트는 uk_team_name 제약조건을 제거하여 OAuth 로그인 문제를 해결합니다.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Phoenix OAuth 문제 해결 배포 시작${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. 데이터베이스 연결 확인
print_status "데이터베이스 연결 확인 중..."

# MySQL 클라이언트로 직접 연결하여 제약조건 제거
print_status "uk_team_name 제약조건 제거 중..."

# 환경변수 로드
source Backend/.env

# MySQL 명령어로 직접 제약조건 제거
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" << EOF
-- uk_team_name 제약조건 제거 (같은 팀 내에서 이름 중복 허용)
ALTER TABLE user DROP INDEX uk_team_name;

-- 제약조건 제거 확인
SHOW INDEX FROM user WHERE Key_name = 'uk_team_name';

SELECT 'uk_team_name 제약조건이 성공적으로 제거되었습니다.' as result;
EOF

if [ $? -eq 0 ]; then
    print_status "데이터베이스 스키마 수정 완료!"
else
    print_error "데이터베이스 스키마 수정 실패"
    exit 1
fi

# 2. 기존 배포 스크립트 실행
print_status "기존 배포 프로세스 시작..."

# Backend 빌드
print_status "Backend 빌드 중..."
cd Backend
npm install --production
npm run build

# Frontend 빌드
print_status "Frontend 빌드 중..."
cd ../Frontend
npm install
npm run build

# Frontend 배포
print_status "Frontend 배포 중..."
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html

# nginx 설정 업데이트
print_status "nginx 설정 업데이트 중..."
sudo cp ../nginx/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx

# Backend 재시작
print_status "Backend 재시작 중..."
cd ../Backend

# PM2로 Backend 재시작
pm2 stop phoenix-backend || true
pm2 delete phoenix-backend || true
pm2 start dist/main.js --name phoenix-backend --env production
pm2 save

print_status "OAuth 문제 해결 배포 완료!"
echo -e "${GREEN}🎉 네이버 OAuth 로그인이 이제 정상적으로 작동합니다!${NC}"
echo -e "${BLUE}Frontend: https://www.phoenix-4.com${NC}"
echo -e "${BLUE}Backend API: https://api.phoenix-4.com${NC}"

# PM2 상태 확인
echo -e "${BLUE}PM2 프로세스 상태:${NC}"
pm2 list

# nginx 상태 확인
echo -e "${BLUE}nginx 상태:${NC}"
sudo systemctl status nginx --no-pager
