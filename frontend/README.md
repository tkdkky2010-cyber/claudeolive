# 올영 TOP 100 - 프론트엔드

올리브영 랭킹 커머스 사이트의 React 프론트엔드입니다.

## 기술 스택

- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Axios** - HTTP 클라이언트
- **Context API** - 전역 상태 관리
- **Google Identity Services** - 구글 로그인

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 Google Client ID를 설정하세요:

```bash
cp .env.example .env
```

```env
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 http://localhost:5173 에서 실행됩니다.

## 빌드

프로덕션 빌드:

```bash
npm run build
```

빌드 미리보기:

```bash
npm run preview
```

## 주요 기능

### 인증
- Google OAuth 로그인
- JWT 토큰 기반 인증
- 자동 토큰 갱신

### 장바구니
- 로그인 시 서버 동기화
- 실시간 수량 조절
- VAT 및 총액 자동 계산

### 상품 표시
- 반응형 그리드 (2/3/4열)
- 랭킹 뱃지 (금/은/동)
- 올리브영 외부 링크

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── DisclaimerBanner.jsx
│   ├── Header.jsx
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   ├── CartSlide.jsx
│   ├── AuthModal.jsx
│   ├── Footer.jsx
│   └── Toast.jsx
├── contexts/           # Context API
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── api/               # API 클라이언트
│   └── client.js
├── App.jsx            # 메인 앱
├── main.jsx          # 엔트리 포인트
└── index.css         # 글로벌 스타일
```

## API 엔드포인트

백엔드 서버 (포트 3001):

- `GET /api/products` - 상품 목록
- `POST /api/auth/google` - 구글 로그인
- `GET /api/auth/me` - 현재 사용자
- `GET /api/cart` - 장바구니 조회
- `POST /api/cart` - 장바구니 추가
- `PATCH /api/cart/:id` - 수량 변경
- `DELETE /api/cart/:id` - 장바구니 삭제

## 디자인 시스템

### 색상
- Primary Green: #2C7A3F
- Secondary Orange: #FF6B35
- Text: #1A1A1A
- Border: #E0E0E0
- Background: #F8F8F8

### 반응형 브레이크포인트
- 모바일: < 768px (2열)
- 태블릿: 768px - 1024px (3열)
- 데스크톱: > 1024px (4열)

## 라이선스

MIT
