# 크롤링 허용 범위 및 준수 가이드라인

**작성일**: 2026-02-10
**적용 대상**: 올리브영 랭킹 페이지 크롤링

---

## 1. 수집 허용 데이터

| 수집 항목 | 리스크 | 판정 |
|----------|--------|------|
| 순위 | ✅ 안전 | 허용 |
| 상품명 | ✅ 안전 | 허용 |
| 가격 | ✅ 안전 | 허용 |
| 할인율 | ✅ 안전 | 허용 |
| 올리브영 상품 링크 | ✅ 안전 | 허용 |
| 상품 이미지 URL | ❌ 위험 | 사용 금지 (저작권) |
| 리뷰 본문 | ❌ 위험 | 수집 금지 |
| 평점 | ⚠️ 주의 | 집계 통계만 허용 |
| 상세 설명/성분/효능 | ❌ 위험 | 수집 금지 |

---

## 2. 기술적 준수 사항

### User-Agent 명시 (필수)
```
User-Agent: YourSiteName/1.0 (https://yoursite.com; contact@yoursite.com)
```

### 크롤링 빈도
- 1일 1회 (새벽 3시 권장)
- 각 요청 사이 2초 대기
- 1일 최대 요청 수: 100

### 에러 핸들링
- 403 Forbidden: 즉시 중단 (재시도 안 함)
- 429 Too Many Requests: Retry-After 헤더 준수
- 500+ Server Error: 점진적 백오프 후 재시도

### Robots.txt 동적 확인 (필수)
- 크롤링 전 매번 robots.txt 확인
- 차단 시 즉시 크롤링 중단

---

## 3. DB 저장 구조 (안전한 스키마)

```sql
CREATE TABLE oliveyoung_rankings (
  id SERIAL PRIMARY KEY,
  crawled_at TIMESTAMP NOT NULL,
  ranking_date DATE NOT NULL,
  rank INTEGER NOT NULL,
  product_name VARCHAR(500) NOT NULL,
  original_price INTEGER,
  sale_price INTEGER,
  discount_rate INTEGER,
  oliveyoung_product_url TEXT NOT NULL,
  -- 이미지 URL 저장 금지 (저작권)
  -- 리뷰 텍스트 저장 금지 (저작권/개인정보)
  UNIQUE(ranking_date, rank)
);
```

---

## 4. 올리브영 차단 시 대응

1. 크롤링 즉시 중단
2. 올리브영에 공식 API 제공 요청
3. 제휴 계약 협의
4. 법률 자문 변호사 상담
