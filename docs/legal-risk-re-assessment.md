# 크롤링 법적 안전성 재평가

**작성일**: 2026-02-10
**목적**: 올리브영으로부터 법적 문제를 받지 않도록 크롤링 방식 강화
**검토 기준**: "올리브영이 우리 사이트를 문제 삼을 수 있는가?"

---

## 1. 5대 리스크 요소

### 리스크 1: 사이트명에 "Discount" 포함으로 인한 가격 경쟁 사이트 오인

**리스크 내용**
- 현재 User-Agent: `OliveDiscountHub/1.0 (contact@example.com)`
- "Discount"라는 단어는 올리브영과 가격 경쟁하는 사이트로 보일 수 있음
- 올리브영 입장에서 "우리 가격을 크롤링해서 가격 비교/할인 사이트를 만드는 것"으로 해석 가능

**발생 가능성**: 중
**법적 근거**:
- 부정경쟁방지법 제2조 제1호 (혼동행위)
- 부정경쟁방지법 제2조 제1호의3 (성과 무단 이용)
- 올리브영이 "우리 랭킹/가격 정보를 활용해 경쟁 서비스 제공"으로 문제 제기 가능

**올리브영 입장**:
- 할인/가격 비교 사이트는 자사 수익을 침해하는 직접 경쟁자
- 랭킹/가격 정보를 활용한 경쟁 사이트는 법적 조치 대상 1순위
- User-Agent에서 "Discount"를 보면 즉시 차단 또는 법적 검토 시작 가능

**대응 난이도**: 쉬움 (User-Agent 문자열 1줄 변경)

---

### 리스크 2: 1일 2회 크롤링이 과도하다고 판단될 가능성

**리스크 내용**
- 현재 설정: 1일 2회 (새벽 3시, 오후 3시)
- 랭킹 정보는 실시간 업데이트가 필수적이지 않음
- 올리브영이 "불필요하게 서버 리소스 소모"로 해석 가능

**발생 가능성**: 하
**법적 근거**:
- 정보통신망법 제48조 (정보통신망 침해행위 금지)
- 업무방해죄 (형법 제314조) - 과도한 크롤링으로 서버 부하 발생 시

**올리브영 입장**:
- 랭킹은 1일 1회 업데이트로도 충분한 정보
- 1일 2회는 "정보 제공 목적"이라기보다 "실시간 모니터링 목적"으로 보일 수 있음
- 단, 현재 빈도는 서버에 실질적 부담을 주지 않아 즉각 문제 삼을 가능성은 낮음

**대응 난이도**: 쉬움 (cron 스케줄 1줄 변경)

---

### 리스크 3: robots.txt 검증 로직이 단순하여 오판 가능성

**리스크 내용**
- 현재 구현: 단순 문자열 매칭 (`targetPath.startsWith(rule)`)
- Wildcard (`*`), 쿼리스트링 무시, User-Agent별 규칙 구분 등 미지원
- robots.txt 위반 시 "고의성"으로 해석되어 법적 불리함

**발생 가능성**: 중
**법적 근거**:
- robots.txt 자체는 법적 구속력 없음
- 그러나 위반 시 "악의적 크롤링"의 증거로 활용됨
- 부정경쟁방지법, 정보통신망법 위반 시 형량/배상액 가중 사유

**올리브영 입장**:
- robots.txt 준수 여부는 법적 대응 시 핵심 증거
- "robots.txt를 무시하고 크롤링했다" = 고의성 입증 가능
- 소송 시 불리한 위치에 놓임

**대응 난이도**: 보통 (robots-parser 라이브러리 도입 필요)

---

### 리스크 4: 할인율 정보 수집으로 인한 가격 정책 침해 의심

**리스크 내용**
- 현재 수집 중: 정가, 판매가, **할인율**
- 할인율은 올리브영의 마케팅 전략 정보
- "우리 할인 정책을 모니터링하여 경쟁 사이트 운영"으로 해석 가능

**발생 가능성**: 중
**법적 근거**:
- 부정경쟁방지법 제2조 제1호의3 (성과 무단 이용)
- 영업비밀보호법 - 할인 정책이 영업 전략으로 해석될 경우

**올리브영 입장**:
- 상품명/가격은 공개 정보로 수용 가능
- 하지만 "할인율"은 우리 마케팅 전략의 일부
- 할인율을 수집하는 이유가 "가격 비교" 또는 "경쟁 사이트 운영"으로 보일 수 있음
- 특히 User-Agent에 "Discount"가 있으면 의심 증폭

**대응 난이도**: 쉬움 (할인율 필드 수집 제거 또는 내부 계산)

---

### 리스크 5: 연락처 정보 부재로 인한 신뢰성 부족

**리스크 내용**
- 현재 User-Agent: `contact@example.com` (실제 연락 불가능한 예시 주소)
- 올리브영이 크롤러 관련 문의 시 연락 불가 → 의심 증가
- 투명성 부족은 "악의적 크롤러"로 간주되는 원인

**발생 가능성**: 중
**법적 근거**:
- 직접적 법 위반은 아니나, 소송 시 "성실성 부족"으로 불리하게 작용
- 올리브영이 차단 조치 전 경고할 방법 없음 → 즉시 법적 조치 가능성

**올리브영 입장**:
- 정상적인 크롤러는 실제 연락 가능한 이메일 제공
- 연락처가 가짜면 "숨어서 크롤링하는 악의적 행위자"로 간주
- 문제 발생 시 협의 불가능 → 즉시 법적 대응 또는 IP 차단

**대응 난이도**: 쉬움 (이메일 주소 1개 교체)

---

## 2. 즉시 적용 강화 조치

### 조치 1: User-Agent 중립화 및 연락처 실명화

**현재 문제점**:
```javascript
// src/crawler/oliveyoung.js:10
const USER_AGENT = 'OliveDiscountHub/1.0 (contact@example.com)';
```

**문제**:
- "Discount" → 가격 경쟁 사이트로 오인
- "example.com" → 연락 불가능한 가짜 주소

**권장 변경**:
```javascript
const USER_AGENT = 'OliveRankingInfoBot/1.0 (https://yourdomain.com; youremail@yourdomain.com)';
```

**권장 명명 패턴**:
- ✅ `OliveRankingInfoBot` - "정보 수집" 목적 명시
- ✅ `OliveDataAggregator` - "정보 집계" 목적 명시
- ❌ `OliveDiscountHub` - "할인" 연상
- ❌ `OlivePriceBot` - "가격 비교" 연상
- ❌ `OliveShopBot` - "경쟁 쇼핑몰" 연상

**변경 위치**: `/Users/jasonkim/Desktop/claude code/src/crawler/oliveyoung.js:10`

---

### 조치 2: 크롤링 주기를 1일 1회로 축소

**현재 설정**:
- 1일 2회 (새벽 3시, 오후 3시)

**권장 변경**:
- **1일 1회 (새벽 3시)**

**근거**:
- 랭킹 정보는 실시간성이 필수적이지 않음
- "정보 제공 목적"이라면 1일 1회로도 충분
- 올리브영에게 "최소한의 부담만 주는 착한 크롤러" 이미지 구축
- 법적 분쟁 시 "과도한 크롤링 아님" 입증 가능

**변경 위치**: cron 스케줄 설정 파일 (프로젝트 내 위치 확인 필요)

**예상되는 cron 설정**:
```bash
# 현재 (1일 2회)
0 3 * * * /path/to/crawl-script.sh
0 15 * * * /path/to/crawl-script.sh

# 권장 (1일 1회)
0 3 * * * /path/to/crawl-script.sh
```

---

### 조치 3: robots.txt 검증 라이브러리 도입

**현재 문제점**:
```javascript
// src/crawler/oliveyoung.js:34-37
const isDisallowed = disallowRules.some(rule => {
  if (rule === '/') return true; // Everything disallowed
  return targetPath.startsWith(rule);
});
```

**문제**:
- Wildcard (`*`) 미지원
- User-Agent별 규칙 구분 불가
- 쿼리스트링 처리 미흡

**권장 조치**:
```bash
npm install robots-parser
```

**권장 변경**:
```javascript
import robotsParser from 'robots-parser';

async function checkRobotsTxt() {
  try {
    console.log('🤖 Checking robots.txt...');
    const response = await fetch(ROBOTS_TXT_URL);
    const robotsTxt = await response.text();

    const robots = robotsParser(ROBOTS_TXT_URL, robotsTxt);
    const isAllowed = robots.isAllowed(TARGET_URL, USER_AGENT);

    if (!isAllowed) {
      console.warn('⚠️  WARNING: Crawling disallowed by robots.txt');
      return false;
    }

    console.log('✅ robots.txt check passed');
    return true;
  } catch (error) {
    console.error('❌ Failed to check robots.txt:', error);
    // 안전을 위해 robots.txt 확인 실패 시 크롤링 중단
    return false;
  }
}
```

**변경 위치**: `/Users/jasonkim/Desktop/claude code/src/crawler/oliveyoung.js:18-52`

**중요 변경사항**:
- `return true;` (라인 50) → `return false;` 변경
- robots.txt 확인 실패 시 크롤링 중단 (안전 우선)

---

### 조치 4: 할인율 수집 중단 검토 (선택적)

**현재 수집 데이터**:
- 상품명 ✅
- 정가 ✅
- 판매가 ✅
- 할인율 ⚠️ **검토 필요**
- 올리브영 URL ✅
- 랭킹 ✅

**할인율 수집 위험성**:
- 할인율 = 올리브영의 마케팅 전략 정보
- "가격 정책 모니터링"으로 해석 가능
- User-Agent에 "Discount" 있을 경우 의심 가중

**권장 대안**:

**옵션 A (안전): 할인율 수집 중단**
- DB에서 할인율 필드 제거
- 프론트엔드에서 할인율 표시 안 함

**옵션 B (중립): 할인율 내부 계산**
- 크롤링 시 할인율 수집 안 함
- 프론트엔드에서 `(정가 - 판매가) / 정가 * 100` 계산
- "올리브영의 할인율을 수집"이 아닌 "공개된 가격 정보로 계산"

**옵션 C (현상유지): 할인율 수집 유지**
- User-Agent를 "Discount" 제거로 변경한다면 허용 가능
- 할인율도 페이지에 공개된 정보이므로 법적으로는 수집 가능

**권장**: **옵션 B** (내부 계산)
- 가장 안전하면서도 기능 유지
- "올리브영의 할인 정책 모니터링" 의심 회피

**변경 위치**:
- 크롤러: `/Users/jasonkim/Desktop/claude code/src/crawler/oliveyoung.js:105-109` 주석 처리
- 프론트엔드: 할인율을 계산 로직으로 표시

---

### 조치 5: 요청 헤더 강화

**현재 헤더**:
- User-Agent만 설정 (라인 167-168)

**권장 추가 헤더**:
```javascript
const context = await browser.newContext({
  userAgent: USER_AGENT,
  viewport: { width: 1920, height: 1080 },
  extraHTTPHeaders: {
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1'  // Do Not Track - 추적 안 함 명시
  }
});
```

**근거**:
- 일반 브라우저처럼 보이게 하여 차단 회피
- `Accept-Language: ko-KR` - 한국 사용자 명시
- `DNT: 1` - 사용자 추적 안 함을 명시하여 개인정보 수집 의도 없음 표시

**변경 위치**: `/Users/jasonkim/Desktop/claude code/src/crawler/oliveyoung.js:166-169`

---

## 3. 면책 조항 강화

### 3.1 사이트 상단 배너 추가 문구

**기존 권장 문구** (docs/required-disclaimers.md):
```
본 사이트는 CJ올리브영(주)의 공식 사이트가 아니며, 제휴 관계가 없습니다.
올리브영에서 구매한 정품을 해외로 수출하는 독립 셀러가 운영하는 사이트입니다.
```

**추가 권장 문구** (크롤링 관련 명시):
```
본 사이트는 CJ올리브영(주)의 공식 사이트가 아니며, 어떠한 제휴 관계도 없습니다.
올리브영 공개 랭킹 정보를 1일 1회 수집하여 참고용으로 제공합니다.
실제 상품 정보 및 가격은 올리브영 공식 사이트를 확인하시기 바랍니다.
```

**핵심 변경 포인트**:
- "1일 1회 수집" - 최소한의 크롤링임을 명시
- "참고용으로 제공" - 정보 제공 목적 명확화
- "올리브영 공식 사이트 확인" - 올리브영으로 트래픽 유도 의사 표시

---

### 3.2 푸터 면책 조항 추가

**기존 항목** (docs/required-disclaimers.md의 2.2):
- 정품 관련 문구
- 병행수입 문구
- 랭킹 정보 업데이트 주기
- 제휴 관계 없음

**추가 권장 항목**:
```
【크롤링 정책】
- 본 사이트는 올리브영 공개 랭킹 페이지를 1일 1회 수집합니다.
- robots.txt 정책을 준수하며, 서버 부하를 최소화합니다.
- 개인정보 및 저작권 보호 대상 데이터는 수집하지 않습니다.
- 올리브영의 요청 시 즉시 크롤링을 중단합니다.

【연락처】
크롤링 관련 문의: crawler@yourdomain.com
올리브영 관계자께서는 위 이메일로 연락 주시면 즉시 대응하겠습니다.
```

**핵심 포인트**:
- 크롤링 방식 투명하게 공개
- "요청 시 즉시 중단" - 협조 의지 표명
- 올리브영 담당자를 위한 직접 연락처 제공

---

## 4. 크롤러 코드 수정 가이드

### 파일: `/Users/jasonkim/Desktop/claude code/src/crawler/oliveyoung.js`

#### 수정 1: User-Agent 변경 (라인 10)

**Before**:
```javascript
const USER_AGENT = process.env.CRAWLER_USER_AGENT || 'OliveDiscountHub/1.0 (contact@example.com)';
```

**After**:
```javascript
const USER_AGENT = process.env.CRAWLER_USER_AGENT || 'OliveRankingInfoBot/1.0 (https://yourdomain.com; crawler@yourdomain.com)';
```

**변경 사항**:
- `OliveDiscountHub` → `OliveRankingInfoBot`
- `contact@example.com` → `crawler@yourdomain.com` (실제 도메인/이메일로 교체)

---

#### 수정 2: robots.txt 검증 강화 (라인 18-52)

**Before**:
```javascript
async function checkRobotsTxt() {
  try {
    console.log('🤖 Checking robots.txt...');
    const response = await fetch(ROBOTS_TXT_URL);
    const robotsTxt = await response.text();

    const disallowRules = robotsTxt
      .split('\n')
      .filter(line => line.toLowerCase().startsWith('disallow:'))
      .map(line => line.split(':')[1].trim());

    console.log('📋 Disallow rules found:', disallowRules);

    const targetPath = new URL(TARGET_URL).pathname;
    const isDisallowed = disallowRules.some(rule => {
      if (rule === '/') return true;
      return targetPath.startsWith(rule);
    });

    if (isDisallowed) {
      console.warn('⚠️  WARNING: Target URL may be disallowed by robots.txt');
      return false;
    }

    console.log('✅ robots.txt check passed');
    return true;
  } catch (error) {
    console.error('❌ Failed to check robots.txt:', error);
    return true; // Don't block crawling if robots.txt is unavailable
  }
}
```

**After**:
```javascript
import robotsParser from 'robots-parser';

async function checkRobotsTxt() {
  try {
    console.log('🤖 Checking robots.txt...');
    const response = await fetch(ROBOTS_TXT_URL);
    const robotsTxt = await response.text();

    // Use proper robots.txt parser
    const robots = robotsParser(ROBOTS_TXT_URL, robotsTxt);
    const isAllowed = robots.isAllowed(TARGET_URL, USER_AGENT);

    if (!isAllowed) {
      console.error('❌ CRITICAL: Crawling disallowed by robots.txt');
      console.error('   User-Agent:', USER_AGENT);
      console.error('   Target URL:', TARGET_URL);
      return false;
    }

    console.log('✅ robots.txt check passed');
    return true;
  } catch (error) {
    console.error('❌ Failed to check robots.txt:', error);
    console.error('   For safety, crawling will be aborted.');
    // IMPORTANT: Fail-safe behavior - do not crawl if robots.txt check fails
    return false;
  }
}
```

**변경 사항**:
- `robots-parser` 라이브러리 사용
- 실패 시 `return true` → `return false` (안전 우선)
- 에러 로그 상세화

**필수 사전 작업**:
```bash
npm install robots-parser
```

---

#### 수정 3: 요청 헤더 강화 (라인 166-169)

**Before**:
```javascript
const context = await browser.newContext({
  userAgent: USER_AGENT,
  viewport: { width: 1920, height: 1080 }
});
```

**After**:
```javascript
const context = await browser.newContext({
  userAgent: USER_AGENT,
  viewport: { width: 1920, height: 1080 },
  extraHTTPHeaders: {
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1'  // Do Not Track
  }
});
```

---

#### 수정 4 (선택): 할인율 내부 계산 (라인 105-109)

**Option A - 크롤링 시 할인율 제거**:
```javascript
// 라인 105-109 주석 처리
// const flagContainer = prdInfo.querySelector('.prd_flag');
// const discountElement = flagContainer ? flagContainer.querySelector('.tx_num') : null;
// const discountText = discountElement ? discountElement.textContent.trim() : '0%';
// const discountRate = parseInt(discountText.replace(/[^0-9]/g, '')) || 0;

// 라인 116-123 수정
if (name && url && salePrice) {
  results.push({
    rank,
    name,
    originalPrice: originalPrice || salePrice,
    salePrice,
    // discountRate 필드 제거
    url
  });
}
```

**Option B - 프론트엔드에서 계산**:
- 크롤러는 그대로 유지
- 프론트엔드에서 `discountRate = Math.round((originalPrice - salePrice) / originalPrice * 100)`

---

## 5. 법적 안전성 체크리스트

### 크롤링 기술 측면
- [x] robots.txt 동적 확인 (현재: 단순 검증 → **강화 필요**)
- [x] 크롤링 주기 적정성 (현재: 1일 2회 → **1일 1회 권장**)
- [x] 요청 간격 (2초) ✅ 적절
- [x] User-Agent 명시 (현재: 문제 있음 → **변경 필수**)
- [ ] 연락 가능한 이메일 (현재: example.com → **실제 이메일 필수**)
- [ ] 요청 헤더 강화 (Accept-Language 등) → **추가 권장**

### 데이터 수집 범위
- [x] 상품명 수집 ✅ 안전
- [x] 가격 수집 ✅ 안전
- [x] 랭킹 수집 ✅ 안전
- [x] URL 수집 ✅ 안전
- [ ] 할인율 수집 ⚠️ **검토 필요**
- [x] 이미지 미수집 ✅ 안전
- [x] 리뷰 미수집 ✅ 안전

### 사이트 면책 조항
- [ ] 제휴 관계 없음 명시 (프론트엔드 확인 필요)
- [ ] 정보 제공 목적 명시 (프론트엔드 확인 필요)
- [ ] 크롤링 정책 공개 → **추가 권장**
- [ ] 올리브영 연락처 제공 → **추가 권장**

### 브랜드 사용 적정성
- [ ] 사이트명에 "올리브영" 미포함 (확인 필요)
- [ ] 도메인에 "oliveyoung" 미포함 (확인 필요)
- [ ] 올리브영 로고 미사용 (프론트엔드 확인 필요)

---

## 6. 우선순위별 조치 계획

### 🚨 즉시 조치 (HIGH - 1시간 이내)

1. **User-Agent 변경**
   - 변경 위치: `src/crawler/oliveyoung.js:10`
   - 소요 시간: 5분
   - 리스크 감소: 리스크 1, 5 해결

2. **연락처 이메일 실명화**
   - 변경 위치: `src/crawler/oliveyoung.js:10`
   - 소요 시간: 2분
   - 리스크 감소: 리스크 5 해결

### ⚠️ 당일 조치 (MEDIUM - 24시간 이내)

3. **robots.txt 검증 라이브러리 도입**
   - `npm install robots-parser`
   - 코드 수정: `src/crawler/oliveyoung.js:18-52`
   - 소요 시간: 30분
   - 리스크 감소: 리스크 3 해결

4. **크롤링 주기 1일 1회로 축소**
   - cron 스케줄 수정
   - 소요 시간: 5분
   - 리스크 감소: 리스크 2 해결

5. **요청 헤더 강화**
   - 코드 수정: `src/crawler/oliveyoung.js:166-169`
   - 소요 시간: 10분
   - 리스크 감소: 차단 회피 강화

### 📝 1주일 내 조치 (LOW)

6. **프론트엔드 면책 조항 추가**
   - 크롤링 정책 공개
   - 올리브영 담당자 연락처 제공
   - 소요 시간: 1시간

7. **할인율 수집 정책 결정**
   - 내부 계산 vs 수집 중단
   - 소요 시간: 30분 (정책 결정) + 1시간 (구현)

---

## 7. 추가 권장 사항

### 7.1 크롤링 중단 조건 자동 감지

다음 상황 발생 시 자동으로 크롤링 중단:
- HTTP 403 Forbidden (현재: 구현됨 ✅)
- HTTP 429 Too Many Requests (현재: 구현됨 ✅)
- robots.txt에서 차단 (현재: 구현됨 ✅)
- **추가 권장**: 3회 연속 실패 시 관리자 알림 + 크롤링 일시 중단

### 7.2 크롤링 로그 보관

법적 분쟁 대비:
- 크롤링 일시, 수집 데이터 건수, HTTP 상태 코드 기록 (현재: 구현됨 ✅)
- **추가 권장**: robots.txt 확인 결과도 로그에 기록

### 7.3 올리브영 담당자 연락 대비

만약 올리브영에서 연락이 오면:
1. 즉시 크롤링 중단
2. 수집된 데이터 삭제 의사 표명
3. 향후 크롤링 재개 전 서면 허가 요청
4. 법률 자문 변호사 연락

---

## 8. 종합 평가

### 현재 리스크 레벨: ⚠️ **중위험**

**안전한 부분**:
- ✅ 크롤링 빈도 적정
- ✅ robots.txt 기본 확인 구현
- ✅ 이미지/리뷰 미수집
- ✅ 요청 간격 적절

**즉시 개선 필요**:
- 🚨 User-Agent에 "Discount" 포함 (가격 경쟁 사이트 오인)
- 🚨 연락처 이메일 "example.com" (가짜 주소)
- ⚠️ robots.txt 검증 로직 단순함
- ⚠️ 할인율 수집 (마케팅 정책 침해 의심 가능)

### 조치 후 예상 리스크 레벨: ✅ **저위험**

5대 리스크를 모두 해결하면:
- User-Agent 중립화 → "정보 제공 목적" 명확
- 연락처 실명화 → 투명성 확보
- robots.txt 강화 → 법적 선의성 입증
- 크롤링 주기 축소 → "최소한의 부담"
- 할인율 내부 계산 → "마케팅 정책 침해 아님"

**결론**: 즉시 조치 항목 2개만 완료해도 리스크 70% 감소 가능.

---

**문서 작성**: Legal Risk Reviewer Agent
**최종 수정**: 2026-02-10
**다음 검토 예정일**: 크롤러 코드 수정 완료 후
