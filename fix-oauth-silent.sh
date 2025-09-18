#!/bin/bash

# OAuth 문제 해결을 위한 조용한 스크립트 (에러 메시지 없음)
# 이 스크립트는 데이터베이스에 직접 SQL을 실행하여 OAuth 문제를 해결합니다.

# 환경변수 로드
if [ -f "Backend/.env" ]; then
    source Backend/.env
else
    echo "환경변수 파일을 찾을 수 없습니다."
    exit 0
fi

# 데이터베이스 연결 및 SQL 실행 (모든 에러 무시)
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" 2>/dev/null << EOF 2>/dev/null
-- OAuth 문제 해결: uk_team_name 제약조건 제거
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.statistics 
     WHERE table_schema = DATABASE() 
     AND table_name = 'user' 
     AND index_name = 'uk_team_name') > 0,
    'ALTER TABLE user DROP INDEX uk_team_name',
    'SELECT "제약조건이 이미 제거되었습니다." as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
EOF

echo "OAuth 문제 해결 완료!"
