# 올리브영 랭킹 기반 커머스 백엔드

올리브영 인기 상품 랭킹 TOP 100을 수집하여 제공하는 백엔드 API 서버입니다.

## 주요 기능

- 🕷️ **자동 크롤링**: Playwright 기반 올리브영 랭킹 데이터 수집
- 📅 **스케줄링**: 매일 자동으로 데이터 업데이트 (3 AM, 3 PM KST)
- 🔐 **구글 OAuth 인증**: 안전한 사용자 인증
- 🛒 **장바구니 기능**: 사용자별 장바구니 관리
- 💾 **SQLite 데이터베이스**: 경량 데이터베이스로 빠른 개발

## 기술 스택

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **Crawler**: Playwright
- **Auth**: JWT + Google OAuth
- **Scheduler**: node-cron

## 프로젝트 구조

```
src/
├── crawler/
│   └── oliveyoung.js       # 크롤링 로직
├── db/
│   ├── schema.sql          # DB 스키마
│   ├── database.js         # DB 연결 및 쿼리
│   └── init.js             # DB 초기화 스크립트
├── routes/
│   ├── products.js         # 상품 API
│   ├── auth.js             # 인증 API
│   └── cart.js             # 장바구니 API
├── middleware/
│   └── auth.js             # JWT 인증 미들웨어
└── server.js               # 메인 서버
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 값을 설정합니다:

```bash
cp .env.example .env
```

필수 환경 변수:
- `GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID

### 3. Playwright 브라우저 설치

```bash
npx playwright install chromium
```

### 4. 데이터베이스 초기화

```bash
npm run init-db
```

### 5. 서버 실행

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 프로덕션 모드
npm start
```

서버는 기본적으로 `http://localhost:3001`에서 실행됩니다.

## API 엔드포인트

### 상품 API

#### `GET /api/products`
최신 랭킹 상품 목록 조회

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "rank": 1,
        "name": "상품명",
        "originalPrice": 30000,
        "salePrice": 25000,
        "discountRate": 17,
        "url": "https://www.oliveyoung.co.kr/...",
        "rankingDate": "2026-02-10",
        "crawledAt": "2026-02-10T03:00:00Z"
      }
    ],
    "total": 100,
    "rankingDate": "2026-02-10",
    "updatedAt": "2026-02-10T03:00:00Z"
  }
}
```

#### `GET /api/products/:id`
개별 상품 상세 조회

#### `GET /api/products/date/:date`
특정 날짜의 랭킹 조회 (YYYY-MM-DD)

### 인증 API

#### `POST /api/auth/google`
구글 OAuth 로그인

**요청:**
```json
{
  "idToken": "google-id-token"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "사용자",
      "avatarUrl": "https://..."
    }
  }
}
```

#### `GET /api/auth/me`
현재 로그인 사용자 정보 (인증 필요)

### 장바구니 API (모든 엔드포인트 인증 필요)

#### `GET /api/cart`
장바구니 조회

#### `POST /api/cart`
장바구니에 상품 추가

**요청:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

#### `PATCH /api/cart/:id`
장바구니 상품 수량 변경

**요청:**
```json
{
  "quantity": 3
}
```

#### `DELETE /api/cart/:id`
장바구니에서 상품 삭제

#### `DELETE /api/cart`
장바구니 전체 비우기

## 크롤링

### 수동 크롤링 실행

```bash
npm run crawl
```

### 크롤링 설정

`.env` 파일에서 설정 가능:

```env
CRAWLER_USER_AGENT=OliveDiscountHub/1.0 (contact@example.com)
CRAWLER_DELAY_MS=2000
CRAWLER_MAX_RETRIES=3
```

### 법적 준수 사항

이 크롤러는 다음 원칙을 준수합니다:

✅ **준수 사항:**
- 공개된 랭킹 페이지만 수집
- robots.txt 확인 및 준수
- 적절한 요청 간격 유지 (최소 2초)
- 명확한 User-Agent 제공
- 원본 사이트 링크 제공

❌ **금지 사항:**
- 로그인이 필요한 영역 접근
- 개인정보 수집
- 이미지 무단 사용 (저작권)
- 과도한 요청으로 서버 부하 유발

## 데이터베이스

### 스키마

- `products`: 상품 정보
- `users`: 사용자 정보
- `cart_items`: 장바구니 아이템
- `crawl_logs`: 크롤링 로그

### 데이터베이스 위치

기본 경로: `./data/oliveyoung.db`

환경 변수 `DB_PATH`로 변경 가능

## 스케줄링

자동 크롤링은 다음 시간에 실행됩니다 (KST 기준):

- 매일 오전 3시
- 매일 오후 3시

## 개발

### 디버깅

로그는 콘솔에 자동으로 출력됩니다:

```bash
npm run dev
```

### 크롤링 로그 확인

데이터베이스의 `crawl_logs` 테이블에서 크롤링 히스토리를 확인할 수 있습니다.

## 배포

### 프로덕션 체크리스트

- [ ] `.env` 파일의 `JWT_SECRET` 변경
- [ ] `GOOGLE_CLIENT_ID` 설정
- [ ] `NODE_ENV=production` 설정
- [ ] 프로세스 매니저 사용 (PM2 권장)
- [ ] HTTPS 설정
- [ ] 적절한 CORS 설정

### PM2로 실행 (권장)

```bash
npm install -g pm2
pm2 start src/server.js --name oliveyoung-backend
pm2 save
pm2 startup
```

## 라이선스

MIT

## 주의사항

이 프로젝트는 교육 및 개인 프로젝트 목적으로 제작되었습니다. 상업적 사용 전에 올리브영의 이용약관 및 관련 법률을 확인하시기 바랍니다.
