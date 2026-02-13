# 환경변수 설정 가이드

## Google OAuth 설정

### 1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. **API 및 서비스** → **사용자 인증 정보**로 이동
4. **사용자 인증 정보 만들기** → **OAuth 클라이언트 ID** 선택
5. 애플리케이션 유형: **웹 애플리케이션**
6. 승인된 JavaScript 원본 추가:
   - `http://localhost:5173` (Vite 개발 서버)
   - `http://localhost:3000` (백엔드 서버)
   - 프로덕션 도메인 (배포 시)
7. 승인된 리디렉션 URI 추가:
   - `http://localhost:5173`
   - 프로덕션 도메인 (배포 시)
8. **만들기** 클릭 후 **클라이언트 ID** 복사

### 2. 백엔드 환경변수 설정

프로젝트 루트에 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 수정:

```env
GOOGLE_CLIENT_ID=<복사한-클라이언트-ID>.apps.googleusercontent.com
JWT_SECRET=<랜덤-문자열-32자-이상>
PORT=3000
```

**JWT_SECRET 생성 방법:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. 프론트엔드 환경변수 설정

`frontend/` 폴더에 `.env` 파일 생성:

```bash
cd frontend
cp .env.example .env
```

`frontend/.env` 파일 수정:

```env
VITE_GOOGLE_CLIENT_ID=<백엔드와-동일한-클라이언트-ID>.apps.googleusercontent.com
VITE_API_URL=http://localhost:3000/api
```

**⚠️ 주의:** 프론트엔드와 백엔드의 `GOOGLE_CLIENT_ID`는 **반드시 동일**해야 합니다!

## 서버 실행

### 백엔드
```bash
npm install
npm run dev
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

## 문제 해결

### "Google OAuth is not configured" 에러
- `.env` 파일에 `GOOGLE_CLIENT_ID`가 설정되어 있는지 확인
- 서버를 재시작

### "Invalid ID token" 에러
- 프론트엔드와 백엔드의 `GOOGLE_CLIENT_ID`가 일치하는지 확인
- Google Cloud Console에서 승인된 JavaScript 원본이 올바른지 확인

### Google 로그인 버튼이 보이지 않음
- 브라우저 개발자 도구 콘솔에서 에러 확인
- `frontend/.env`의 `VITE_GOOGLE_CLIENT_ID`가 설정되어 있는지 확인
- 페이지 새로고침
