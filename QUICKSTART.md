# 빠른 시작 가이드

## 1. 의존성 설치

```bash
npm install
```

## 2. Playwright 브라우저 설치

```bash
npx playwright install chromium
```

## 3. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 필요한 값을 설정합니다:

```env
# 필수: Google OAuth 클라이언트 ID (나중에 설정 가능)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# 선택: JWT Secret (프로덕션에서 반드시 변경)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 4. 데이터베이스 초기화

```bash
npm run init-db
```

성공 메시지가 출력되면 `./data/oliveyoung.db` 파일이 생성됩니다.

## 5. 첫 크롤링 실행 (선택)

서버를 시작하기 전에 데이터를 미리 수집하고 싶다면:

```bash
npm run crawl
```

실행 시간: 약 10-30초 (네트워크 속도에 따라 다름)

## 6. 서버 시작

```bash
npm run dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

## 7. API 테스트

### 헬스 체크

```bash
curl http://localhost:3001/health
```

### 상품 목록 조회

```bash
curl http://localhost:3001/api/products
```

처음 실행 시 데이터가 없을 수 있습니다. 이 경우:
1. `npm run crawl` 실행
2. 또는 스케줄된 시간(3 AM/3 PM KST)까지 대기

## Google OAuth 설정 (선택)

구글 로그인 기능을 사용하려면:

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성
3. "API 및 서비스" → "사용자 인증 정보" 이동
4. "OAuth 2.0 클라이언트 ID" 생성
5. 승인된 JavaScript 원본: `http://localhost:3000`
6. 클라이언트 ID를 `.env`의 `GOOGLE_CLIENT_ID`에 설정

## 문제 해결

### "Database is empty" 에러
→ `npm run crawl` 실행

### "Google OAuth is not configured" 에러
→ `.env`에 `GOOGLE_CLIENT_ID` 설정

### Playwright 브라우저 에러
→ `npx playwright install chromium` 실행

### 포트 충돌 (3001 already in use)
→ `.env`에서 `PORT=3002`로 변경

## 다음 단계

- 프론트엔드 연결
- 크롤링 스케줄 확인 (매일 3 AM/3 PM KST)
- 로그 모니터링
- 배포 준비 (README.md 참고)
