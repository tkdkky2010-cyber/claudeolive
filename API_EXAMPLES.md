# API 사용 예제

이 문서는 실제 사용 가능한 API 호출 예제를 제공합니다.

## 기본 설정

서버 주소: `http://localhost:3001`

모든 예제는 `curl` 명령어를 사용합니다. Postman, Insomnia 등의 도구도 사용 가능합니다.

---

## 상품 API

### 1. 최신 랭킹 상품 목록 조회

```bash
curl http://localhost:3001/api/products
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "rank": 1,
        "name": "토리든 다이브인 저분자 히알루론산 세럼",
        "originalPrice": 28000,
        "salePrice": 23800,
        "discountRate": 15,
        "url": "https://www.oliveyoung.co.kr/store/goods/...",
        "rankingDate": "2026-02-10",
        "crawledAt": "2026-02-10T03:00:00.000Z"
      }
    ],
    "total": 100,
    "rankingDate": "2026-02-10",
    "updatedAt": "2026-02-10T03:00:00.000Z"
  }
}
```

### 2. 특정 상품 상세 조회

```bash
curl http://localhost:3001/api/products/1
```

### 3. 특정 날짜의 랭킹 조회

```bash
curl http://localhost:3001/api/products/date/2026-02-10
```

---

## 인증 API

### 1. 구글 로그인

```bash
curl -X POST http://localhost:3001/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "your-google-id-token-from-frontend"
  }'
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "avatarUrl": "https://lh3.googleusercontent.com/..."
    }
  }
}
```

**중요:** 응답의 `token` 값을 저장하세요. 이후 인증이 필요한 API 호출 시 사용합니다.

### 2. 현재 사용자 정보 조회

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. 로그아웃

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 장바구니 API

**모든 장바구니 API는 인증이 필요합니다.**

### 1. 장바구니 조회

```bash
curl http://localhost:3001/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "quantity": 2,
        "createdAt": "2026-02-10T12:00:00.000Z",
        "productId": 5,
        "rank": 5,
        "name": "메디힐 티트리 케어 솔루션 앰플 마스크",
        "originalPrice": 15000,
        "salePrice": 12000,
        "discountRate": 20,
        "url": "https://www.oliveyoung.co.kr/store/goods/..."
      }
    ],
    "summary": {
      "itemCount": 1,
      "totalQuantity": 2,
      "totalOriginalPrice": 30000,
      "totalPrice": 24000,
      "totalSavings": 6000
    }
  }
}
```

### 2. 장바구니에 상품 추가

```bash
curl -X POST http://localhost:3001/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 5,
    "quantity": 2
  }'
```

**참고:**
- `quantity`는 선택 사항입니다 (기본값: 1)
- 이미 장바구니에 있는 상품이면 수량이 추가됩니다

### 3. 장바구니 상품 수량 변경

```bash
curl -X PATCH http://localhost:3001/api/cart/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }'
```

### 4. 장바구니에서 상품 삭제

```bash
curl -X DELETE http://localhost:3001/api/cart/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. 장바구니 전체 비우기

```bash
curl -X DELETE http://localhost:3001/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 유틸리티 API

### 헬스 체크

```bash
curl http://localhost:3001/health
```

**응답:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-10T12:00:00.000Z",
  "uptime": 3600
}
```

### 루트 엔드포인트 (API 문서)

```bash
curl http://localhost:3001/
```

---

## JavaScript/Frontend 예제

### Fetch API 사용

```javascript
// 상품 목록 조회
const getProducts = async () => {
  const response = await fetch('http://localhost:3001/api/products');
  const data = await response.json();
  return data.data.products;
};

// 구글 로그인
const loginWithGoogle = async (idToken) => {
  const response = await fetch('http://localhost:3001/api/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken })
  });
  const data = await response.json();

  // JWT 토큰 저장
  localStorage.setItem('token', data.data.token);

  return data.data.user;
};

// 장바구니에 추가 (인증 필요)
const addToCart = async (productId, quantity = 1) => {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3001/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ productId, quantity })
  });

  return await response.json();
};

// 장바구니 조회 (인증 필요)
const getCart = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3001/api/cart', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  return data.data;
};
```

---

## 에러 응답 예시

### 인증 실패 (401)

```json
{
  "success": false,
  "error": "Access token required"
}
```

### 리소스 없음 (404)

```json
{
  "success": false,
  "error": "Product not found"
}
```

### 잘못된 요청 (400)

```json
{
  "success": false,
  "error": "Product ID is required"
}
```

### 서버 에러 (500)

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 팁

1. **JWT 토큰 만료**: 토큰은 7일간 유효합니다. 만료 시 다시 로그인하세요.

2. **CORS 이슈**: 프론트엔드 URL이 `http://localhost:3000`이 아니라면, `.env`에서 `FRONTEND_URL` 변경이 필요합니다.

3. **데이터 없음**: 처음 실행 시 `npm run crawl`을 실행하여 데이터를 수집하세요.

4. **Bearer 토큰 형식**: Authorization 헤더는 반드시 `Bearer YOUR_TOKEN` 형식이어야 합니다.
