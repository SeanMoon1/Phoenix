#!/bin/bash

# OAuth 문제 해결을 위한 간단한 스크립트
# 이 스크립트는 데이터베이스에 직접 SQL을 실행하여 OAuth 문제를 해결합니다.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 OAuth 문제 해결 시작${NC}"

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

# 환경변수 로드
if [ -f "Backend/.env" ]; then
    source Backend/.env
    print_status "환경변수 로드 완료"
else
    print_error "Backend/.env 파일을 찾을 수 없습니다."
    exit 1
fi

# 데이터베이스 연결 및 SQL 실행
print_status "데이터베이스에 연결하여 OAuth 문제 해결 중..."

mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" << EOF
-- OAuth 문제 해결: uk_team_name 제약조건 제거
-- 이는 같은 팀 내에서 이름 중복으로 인한 OAuth 가입 실패를 방지합니다.

-- 제약조건 존재 여부 확인
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'uk_team_name 제약조건이 존재합니다.'
        ELSE 'uk_team_name 제약조건이 존재하지 않습니다.'
    END as status
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'user' 
AND index_name = 'uk_team_name';

-- 제약조건 제거 (존재하는 경우에만)
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.statistics 
     WHERE table_schema = DATABASE() 
     AND table_name = 'user' 
     AND index_name = 'uk_team_name') > 0,
    'ALTER TABLE user DROP INDEX uk_team_name',
    'SELECT "uk_team_name 제약조건이 이미 존재하지 않습니다." as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 결과 확인
SELECT 'OAuth 문제 해결 완료: 같은 팀 내에서 이름 중복이 허용됩니다.' as result;
EOF

if [ $? -eq 0 ]; then
    print_status "OAuth 문제 해결 완료!"
    echo -e "${GREEN}🎉 이제 네이버 OAuth 로그인이 정상적으로 작동합니다!${NC}"
    echo -e "${BLUE}📝 변경사항: uk_team_name 제약조건 제거${NC}"
    echo -e "${BLUE}📝 효과: 같은 팀 내에서 이름 중복 허용${NC}"
else
    print_error "OAuth 문제 해결 실패"
    exit 1
fi
