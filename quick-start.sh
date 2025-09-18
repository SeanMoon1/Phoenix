#!/bin/bash

# Phoenix Platform Quick Start Script
# 빠른 시작을 위한 간단한 스크립트

set -e

echo "🚀 Phoenix Platform 빠른 시작"
echo "================================"

# 환경변수 파일 확인
if [ ! -f ".env" ]; then
    echo "📝 환경변수 파일을 생성합니다..."
    cp env.example .env
    echo "⚠️  .env 파일을 편집하여 필요한 설정을 변경하세요."
    echo "   특히 다음 값들을 변경해야 합니다:"
    echo "   - DB_PASSWORD"
    echo "   - JWT_SECRET"
    echo "   - MYSQL_ROOT_PASSWORD"
    echo "   - REDIS_PASSWORD"
    echo ""
    echo "편집 완료 후 Enter를 눌러 계속하세요..."
    read
fi

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되지 않았습니다."
    echo "   https://docs.docker.com/get-docker/ 에서 Docker를 설치하세요."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되지 않았습니다."
    echo "   https://docs.docker.com/compose/install/ 에서 Docker Compose를 설치하세요."
    exit 1
fi

echo "✅ Docker 환경이 준비되었습니다."

# 개발 환경으로 배포
echo "🐳 Docker 컨테이너를 시작합니다..."
./deploy.sh development

echo ""
echo "🎉 Phoenix Platform이 성공적으로 시작되었습니다!"
echo ""
echo "📱 접속 정보:"
echo "   Frontend: http://localhost:80"
echo "   Backend API: http://localhost:3000"
echo "   Database: localhost:3306"
echo ""
echo "📊 서비스 상태 확인:"
echo "   docker-compose ps"
echo ""
echo "📝 로그 확인:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 서비스 중지:"
echo "   docker-compose down"
echo ""
echo "자세한 내용은 DOCKER_DEPLOYMENT.md 파일을 참조하세요."
