#!/bin/bash

# Phoenix 개발 환경 초기 설정 스크립트
# 로컬 개발 환경 구축용

echo "🚀 Phoenix 개발 환경 설정 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 에러 처리 함수
handle_error() {
    echo -e "${RED}❌ 설정 실패: $1${NC}"
    exit 1
}

# Node.js 버전 확인
echo -e "${YELLOW}📦 Node.js 버전 확인...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js가 설치되지 않았습니다. Node.js 18.x 이상을 설치해주세요.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js 18.x 이상이 필요합니다. 현재 버전: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 버전: $(node -v)${NC}"

# MySQL 설치 확인
echo -e "${YELLOW}📦 MySQL 설치 확인...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}MySQL이 설치되지 않았습니다. 설치를 진행합니다...${NC}"
    
    # OS별 MySQL 설치
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install mysql
            brew services start mysql
        else
            echo -e "${RED}Homebrew가 설치되지 않았습니다. MySQL을 수동으로 설치해주세요.${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt update
        sudo apt install -y mysql-server
        sudo systemctl start mysql
        sudo systemctl enable mysql
    else
        echo -e "${RED}지원하지 않는 운영체제입니다. MySQL을 수동으로 설치해주세요.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ MySQL 설치 확인 완료${NC}"

# 데이터베이스 생성
echo -e "${YELLOW}🗄️ 데이터베이스 설정...${NC}"
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS phoenix;" || handle_error "데이터베이스 생성 실패"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'phoenix_dev'@'localhost' IDENTIFIED BY 'phoenix_dev_2024';" || handle_error "개발용 사용자 생성 실패"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON phoenix.* TO 'phoenix_dev'@'localhost';" || handle_error "권한 부여 실패"
mysql -u root -p -e "FLUSH PRIVILEGES;" || handle_error "권한 새로고침 실패"

echo -e "${GREEN}✅ 데이터베이스 설정 완료${NC}"

# Backend 설정
echo -e "${BLUE}🔧 Backend 설정...${NC}"
cd ../Backend || handle_error "Backend 디렉토리를 찾을 수 없습니다"

# 환경 변수 파일 생성
cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=phoenix_dev
DB_PASSWORD=phoenix_dev_2024
DB_DATABASE=phoenix

# Application Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=phoenix_jwt_secret_2024_development
JWT_EXPIRES_IN=24h
EOF

echo -e "${GREEN}✅ Backend .env 파일 생성 완료${NC}"

# 의존성 설치
echo -e "${YELLOW}📥 Backend 의존성 설치...${NC}"
npm install || handle_error "Backend 의존성 설치 실패"

# Frontend 설정
echo -e "${BLUE}🔧 Frontend 설정...${NC}"
cd ../Frontend || handle_error "Frontend 디렉토리를 찾을 수 없습니다"

# 의존성 설치
echo -e "${YELLOW}📥 Frontend 의존성 설치...${NC}"
npm install || handle_error "Frontend 의존성 설치 실패"

# SQL 스키마 적용
echo -e "${YELLOW}🗄️ 데이터베이스 스키마 적용...${NC}"
cd ../Database/schema || handle_error "Database/schema 디렉토리를 찾을 수 없습니다"
mysql -u phoenix_dev -pphoenix_dev_2024 phoenix < phoenix_schema_mysql.sql || handle_error "스키마 적용 실패"

echo -e "${GREEN}✅ 데이터베이스 스키마 적용 완료${NC}"

# 개발 서버 시작 스크립트 생성
echo -e "${YELLOW}📝 개발 서버 시작 스크립트 생성...${NC}"
cd ../../Scripts/setup || handle_error "Scripts/setup 디렉토리를 찾을 수 없습니다"

cat > start-dev.sh << 'EOF'
#!/bin/bash

# Phoenix 개발 서버 시작 스크립트

echo "🚀 Phoenix 개발 서버 시작..."

# 터미널 탭에서 Backend 실행
echo "📦 Backend 서버 시작 (포트 3000)..."
cd ../../Backend
npm run start:dev &

# 잠시 대기
sleep 3

# 터미널 탭에서 Frontend 실행
echo "📦 Frontend 서버 시작 (포트 3001)..."
cd ../Frontend
npm run dev &

echo "✅ 개발 서버가 시작되었습니다!"
echo "🌐 Frontend: http://localhost:3001"
echo "🔧 Backend API: http://localhost:3000"
echo "📚 API 문서: http://localhost:3000/api"

# 프로세스 종료를 위한 대기
echo "종료하려면 Ctrl+C를 누르세요..."
wait
EOF

chmod +x start-dev.sh

cat > start-dev.bat << 'EOF'
@echo off
REM Phoenix 개발 서버 시작 스크립트 (Windows)

echo 🚀 Phoenix 개발 서버 시작...

REM Backend 서버 시작
echo 📦 Backend 서버 시작 (포트 3000)...
start "Phoenix Backend" cmd /k "cd ..\..\Backend && npm run start:dev"

REM 잠시 대기
timeout /t 3 /nobreak > nul

REM Frontend 서버 시작
echo 📦 Frontend 서버 시작 (포트 3001)...
start "Phoenix Frontend" cmd /k "cd ..\..\Frontend && npm run dev"

echo ✅ 개발 서버가 시작되었습니다!
echo 🌐 Frontend: http://localhost:3001
echo 🔧 Backend API: http://localhost:3000
echo 📚 API 문서: http://localhost:3000/api

pause
EOF

echo -e "${GREEN}✅ 개발 서버 시작 스크립트 생성 완료${NC}"

# 완료 메시지
echo -e "${GREEN}🎉 Phoenix 개발 환경 설정 완료!${NC}"
echo -e "${BLUE}📋 다음 단계:${NC}"
echo "1. 개발 서버 시작: ./Scripts/setup/start-dev.sh (Linux/Mac) 또는 start-dev.bat (Windows)"
echo "2. 브라우저에서 http://localhost:3001 접속"
echo "3. API 문서 확인: http://localhost:3000/api"
echo -e "${YELLOW}💡 유용한 명령어:${NC}"
echo "- Backend만 실행: cd Backend && npm run start:dev"
echo "- Frontend만 실행: cd Frontend && npm run dev"
echo "- 데이터베이스 초기화: cd Backend && npm run seed"
