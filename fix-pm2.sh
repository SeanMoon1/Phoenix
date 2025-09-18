#!/bin/bash

# Phoenix Platform PM2 문제 해결 스크립트
# NestJS DI 오류 및 실행 경로 문제 해결

set -e

echo "🔧 Phoenix Platform PM2 문제 해결 시작"
echo "======================================"

# Backend 디렉토리로 이동
cd Backend

echo "📦 의존성 설치 중..."
npm install

echo "🧹 기존 빌드 파일 정리..."
rm -rf dist/
rm -rf node_modules/.cache/

echo "🔨 클린 빌드 실행..."
npm run build

echo "✅ 빌드 완료! 빌드 결과 확인:"
ls -la dist/src/

echo "🛑 기존 PM2 프로세스 중지..."
pm2 stop phoenix-api || true
pm2 delete phoenix-api || true

echo "🚀 PM2로 새로 시작..."
pm2 start npm --name "phoenix-api" -- run start:prod

echo "⏳ 서비스 시작 대기 중..."
sleep 10

echo "📊 PM2 상태 확인:"
pm2 status

echo "📝 최근 로그 확인:"
pm2 logs phoenix-api --lines 20

echo "🎉 PM2 문제 해결 완료!"
echo ""
echo "서비스 상태를 확인하려면:"
echo "  pm2 status"
echo "  pm2 logs phoenix-api"
echo ""
echo "서비스를 중지하려면:"
echo "  pm2 stop phoenix-api"
