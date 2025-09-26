# Redis 설정 가이드

## 🚀 Redis 기반 인증 코드 시스템

### 1. 개발 환경 설정

#### Docker Compose 사용 (권장)

```bash
# Redis 서버 시작
docker-compose -f docker-compose.redis.yml up -d

# Redis 상태 확인
docker-compose -f docker-compose.redis.yml ps

# Redis 로그 확인
docker-compose -f docker-compose.redis.yml logs redis
```

#### 로컬 Redis 설치

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS (Homebrew)
brew install redis

# Windows (WSL)
sudo apt-get install redis-server
```

### 2. 환경 변수 설정

#### 개발 환경 (.env.development)

```env
# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

#### 운영 환경 (.env.production)

```env
# Redis 설정
REDIS_HOST=your-redis-cluster-endpoint
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password
REDIS_DB=0
```

### 3. AWS ElastiCache 설정

#### Redis 클러스터 생성

```bash
# AWS CLI로 Redis 클러스터 생성
aws elasticache create-replication-group \
  --replication-group-id phoenix-redis-cluster \
  --description "Phoenix Redis Cluster" \
  --node-type cache.t3.micro \
  --engine redis \
  --num-cache-clusters 2 \
  --cache-parameter-group-name default.redis7 \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-group-name phoenix-subnet-group \
  --at-rest-encryption-enabled \
  --transit-encryption-enabled \
  --auth-token your-secure-redis-password
```

#### 보안 그룹 설정

- **포트 6379**: Redis 서버 포트
- **소스**: 애플리케이션 서버 IP/보안 그룹

### 4. Redis 모니터링

#### Redis Commander (웹 UI)

```bash
# Docker로 Redis Commander 실행
docker run -d \
  --name redis-commander \
  -p 8081:8081 \
  -e REDIS_HOSTS=local:your-redis-host:6379 \
  rediscommander/redis-commander:latest
```

#### Redis CLI 명령어

```bash
# Redis 연결
redis-cli -h your-redis-host -p 6379 -a your-password

# 인증 코드 확인
KEYS reset_code:*

# 특정 사용자 인증 코드 확인
GET reset_code:user@example.com

# 모든 인증 코드 삭제
FLUSHDB

# Redis 상태 확인
INFO memory
INFO stats
```

### 5. 성능 최적화

#### Redis 설정 최적화

```conf
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

#### 애플리케이션 설정

```typescript
// Redis 연결 설정
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  // 연결 풀 설정
  family: 4,
  keepAlive: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
};
```

### 6. 보안 설정

#### Redis 인증

```bash
# Redis 비밀번호 설정
CONFIG SET requirepass "your-secure-password"

# 비밀번호 확인
AUTH your-secure-password
```

#### 네트워크 보안

- VPC 내부에서만 접근 가능하도록 설정
- 보안 그룹으로 포트 제한
- SSL/TLS 암호화 (Redis 6.0+)

### 7. 백업 및 복구

#### 자동 백업 설정

```bash
# cron으로 정기 백업
0 2 * * * redis-cli --rdb /backup/redis-$(date +\%Y\%m\%d).rdb
```

#### 데이터 복구

```bash
# 백업에서 복구
redis-cli --rdb /backup/redis-20240101.rdb
```

### 8. 모니터링 및 알림

#### Redis 메트릭 수집

- **메모리 사용량**: `INFO memory`
- **연결 수**: `INFO clients`
- **명령어 통계**: `INFO stats`
- **키 개수**: `DBSIZE`

#### 알림 설정

- 메모리 사용률 80% 이상
- 연결 수 제한 근접
- 명령어 실행 시간 증가
- Redis 서버 다운

### 9. 트러블슈팅

#### 일반적인 문제들

**연결 실패**

```bash
# Redis 서버 상태 확인
redis-cli ping

# 포트 확인
netstat -tlnp | grep 6379

# 방화벽 확인
sudo ufw status
```

**메모리 부족**

```bash
# 메모리 사용량 확인
INFO memory

# 큰 키 확인
redis-cli --bigkeys

# 만료된 키 정리
redis-cli --scan --pattern "reset_code:*" | xargs redis-cli del
```

**성능 문제**

```bash
# 느린 명령어 확인
redis-cli --latency-history

# 명령어 통계
INFO commandstats
```

### 10. 운영 체크리스트

#### 배포 전 확인사항

- [ ] Redis 서버 정상 동작
- [ ] 네트워크 연결 확인
- [ ] 인증 설정 확인
- [ ] 백업 설정 확인
- [ ] 모니터링 설정 확인

#### 운영 중 확인사항

- [ ] 메모리 사용량 모니터링
- [ ] 연결 수 모니터링
- [ ] 명령어 실행 시간 모니터링
- [ ] 에러 로그 확인
- [ ] 백업 상태 확인

### 11. API 엔드포인트

#### Redis 헬스체크

```bash
GET /auth/redis/health

# 응답 예시
{
  "success": true,
  "data": {
    "connected": true,
    "stats": {
      "memory": "used_memory:1234567",
      "keys": 42,
      "uptime": 1234567
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "message": "Redis 연결 정상"
}
```

이제 Redis 기반의 안전하고 확장 가능한 인증 코드 시스템이 완성되었습니다! 🚀
