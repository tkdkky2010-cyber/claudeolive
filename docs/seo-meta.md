# SEO 메타 태그 및 구조화된 데이터

**작성일**: 2026-02-10
**적용 대상**: 올영 TOP 100 (올리브영 랭킹 기반 커머스 사이트)
**SEO 전략**: 법적 안전성 유지 + 올리브영 연관 검색 유입 최대화

---

## 메인 페이지 메타 태그

### Title 태그

**옵션 1 (권장 - 키워드 최적화)**:
```html
<title>올영 TOP 100 - 올리브영 인기 랭킹 상품 해외 직구 | 동일 가격 무료배송</title>
```

**옵션 2 (브랜드 중심)**:
```html
<title>올영 TOP 100 | 올리브영 정품 해외 직구 쇼핑몰</title>
```

**옵션 3 (검색 의도 최적화)**:
```html
<title>올리브영 인기 상품 해외 직구 - 올영 TOP 100 | 동일 가격 무료배송</title>
```

**권장**: 옵션 1
- 길이: 58자 (모바일 검색 결과 최적화)
- 핵심 키워드: "올리브영", "랭킹", "해외 직구", "무료배송"
- 차별화 포인트 명확

**SEO 주의사항**:
- ❌ "올리브영 공식" 절대 금지 (법적 리스크 + 허위 정보)
- ✅ "올리브영 정품", "올리브영 상품" 등은 허용 (사실 진술)

---

### Meta Description

**권장안 (155자 이내)**:
```html
<meta name="description" content="올리브영 TOP 100 랭킹 상품을 동일 가격에 해외 무료배송으로 만나보세요. 매일 업데이트되는 인기 K뷰티 정품을 병행수입 방식으로 안전하게 구매하세요. 구글 간편 로그인, 결제 준비 중.">
```

**대체안 (간결형, 130자)**:
```html
<meta name="description" content="올리브영 인기 랭킹 상품 해외 직구. 동일 가격, 무료배송으로 K뷰티 정품을 만나보세요. 매일 업데이트되는 TOP 100 상품 리스트.">
```

**권장**: 첫 번째 안
- 핵심 차별점 포함: 동일 가격, 무료배송, 병행수입 정품
- 행동 유도: "만나보세요", "구매하세요"
- 투명성: "병행수입 방식", "결제 준비 중" 명시

---

### Meta Keywords (선택 사항)

```html
<meta name="keywords" content="올리브영, 올리브영 해외직구, 올리브영 랭킹, K뷰티, 한국 화장품, 병행수입, 올리브영 정품, 뷰티 랭킹, 스킨케어, 메이크업, 올영, 올리브영 인기상품">
```

**주의**:
- 현대 SEO에서 meta keywords는 거의 무시됨
- 그러나 일부 국내 검색엔진(네이버)에서 참고 가능
- 과도한 키워드 반복은 스팸으로 간주될 수 있음

---

### Open Graph (OG) 태그

```html
<!-- 기본 OG 태그 -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://example.com">
<meta property="og:site_name" content="올영 TOP 100">

<!-- 제목 및 설명 -->
<meta property="og:title" content="올영 TOP 100 - 올리브영 인기 랭킹 상품 해외 직구">
<meta property="og:description" content="올리브영 TOP 100 랭킹 상품을 동일 가격에 해외 무료배송으로 만나보세요. 매일 업데이트되는 인기 K뷰티 정품.">

<!-- 이미지 -->
<meta property="og:image" content="https://example.com/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="올영 TOP 100 - 올리브영 인기 상품 랭킹">

<!-- 로케일 -->
<meta property="og:locale" content="ko_KR">
```

**OG 이미지 제작 가이드**:
- 크기: 1200x630px (Facebook 권장)
- 포함 요소: 사이트 로고, "TOP 100" 텍스트, 대표 상품 이미지 3-5개
- ❌ 올리브영 로고 사용 금지 (상표권 침해)
- ✅ "올리브영 정품" 텍스트는 허용

---

### Twitter Card 태그

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@yourtwitterhandle">
<meta name="twitter:title" content="올영 TOP 100 - 올리브영 인기 랭킹 상품 해외 직구">
<meta name="twitter:description" content="올리브영 TOP 100 랭킹 상품을 동일 가격에 해외 무료배송으로 만나보세요.">
<meta name="twitter:image" content="https://example.com/twitter-card.jpg">
<meta name="twitter:image:alt" content="올영 TOP 100 - 올리브영 인기 상품 랭킹">
```

---

### 추가 메타 태그

```html
<!-- 모바일 최적화 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 테마 컬러 (모바일 브라우저 주소창) -->
<meta name="theme-color" content="#00A3E0">

<!-- 검색엔진 크롤링 허용 -->
<meta name="robots" content="index, follow">

<!-- 저자 정보 -->
<meta name="author" content="올영 TOP 100">

<!-- 캐노니컬 URL (중복 콘텐츠 방지) -->
<link rel="canonical" href="https://example.com">
```

---

## 구조화된 데이터 (JSON-LD)

### 1. Organization 스키마

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "올영 TOP 100",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "올리브영 인기 랭킹 상품 해외 직구 쇼핑몰. 동일 가격, 무료배송.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "KR",
    "addressRegion": "서울특별시",
    "addressLocality": "OO구",
    "streetAddress": "OO로 00"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+82-2-0000-0000",
    "contactType": "고객 서비스",
    "email": "contact@example.com",
    "availableLanguage": "Korean"
  },
  "sameAs": [
    "https://www.facebook.com/yourpage",
    "https://www.instagram.com/yourpage"
  ]
}
</script>
```

---

### 2. WebSite 스키마 (검색창 포함)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "올영 TOP 100",
  "url": "https://example.com",
  "description": "올리브영 인기 랭킹 상품 해외 직구",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

**주의**: 검색 기능이 MVP에 없다면 `potentialAction` 제거

---

### 3. ItemList 스키마 (TOP 100 상품 리스트)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "올리브영 TOP 100 인기 상품 랭킹",
  "description": "매일 업데이트되는 올리브영 인기 상품 리스트",
  "numberOfItems": 100,
  "itemListOrder": "https://schema.org/ItemListOrderDescending",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "name": "상품명 예시",
        "image": "https://example.com/product-image.jpg",
        "description": "상품 설명",
        "brand": {
          "@type": "Brand",
          "name": "브랜드명"
        },
        "offers": {
          "@type": "Offer",
          "url": "https://example.com/product/1",
          "priceCurrency": "KRW",
          "price": "29900",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "올영 TOP 100"
          }
        }
      }
    }
    // ... 나머지 상품 99개 (동적 생성 권장)
  ]
}
</script>
```

**구현 시 주의사항**:
- 동적 생성: 크롤링 데이터 기반으로 서버에서 렌더링
- 상품 개수: 전체 100개 포함 (SEO 효과 극대화)
- 가격 정보: 실제 판매가 정확히 반영
- Availability: 재고 상태 실시간 반영 (가능하면)

---

### 4. BreadcrumbList 스키마 (카테고리 페이지용)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "홈",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "스킨케어",
      "item": "https://example.com/category/skincare"
    }
  ]
}
</script>
```

**적용 시점**: 카테고리 필터링 기능 추가 시

---

## 페이지별 메타 태그 (향후 확장용)

### 상품 상세 페이지 (개별 상품)

```html
<title>[상품명] - 올영 TOP 100 | 올리브영 정품 해외 직구</title>

<meta name="description" content="[상품명] 올리브영 동일 가격, 무료배송. 병행수입 정품 K뷰티를 안전하게 구매하세요.">

<meta property="og:type" content="product">
<meta property="og:title" content="[상품명] - 올영 TOP 100">
<meta property="og:image" content="[상품 이미지 URL]">
<meta property="product:price:amount" content="[가격]">
<meta property="product:price:currency" content="KRW">
```

### 카테고리 페이지 (스킨케어, 메이크업 등)

```html
<title>[카테고리명] TOP 랭킹 - 올영 TOP 100 | 올리브영 인기 상품</title>

<meta name="description" content="올리브영 [카테고리명] 인기 랭킹. 매일 업데이트되는 트렌드 상품을 동일 가격 무료배송으로 만나보세요.">
```

---

## Robots.txt 권장 설정

```
User-agent: *
Allow: /

# 크롤링 제외 (개인정보, 관리자 페이지)
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /cart/
Disallow: /user/

# 검색 결과 페이지 제외 (중복 콘텐츠 방지)
Disallow: /search?

# 사이트맵
Sitemap: https://example.com/sitemap.xml
```

---

## Sitemap.xml 구조

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- 메인 페이지 -->
  <url>
    <loc>https://example.com</loc>
    <lastmod>2026-02-10</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- 상품 페이지 (100개) -->
  <url>
    <loc>https://example.com/product/1</loc>
    <lastmod>2026-02-10</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- 정적 페이지 -->
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2026-02-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

</urlset>
```

**업데이트 빈도**: 1일 1회 (크롤링 주기와 동일)

---

## SEO 체크리스트

### 기술적 SEO
- [ ] HTTPS 적용
- [ ] 모바일 반응형 디자인
- [ ] 페이지 로딩 속도 최적화 (Core Web Vitals)
- [ ] 구조화된 데이터 검증 (Google Rich Results Test)
- [ ] Sitemap.xml 제출 (Google Search Console, Naver Webmaster)
- [ ] Robots.txt 설정

### 콘텐츠 SEO
- [ ] 타이틀 태그 최적화 (50-60자)
- [ ] 메타 설명 최적화 (150-160자)
- [ ] H1 태그 (페이지당 1개, 키워드 포함)
- [ ] 이미지 alt 속성 (모든 이미지)
- [ ] 내부 링크 구조 (관련 상품, 카테고리)

### 법적 준수 SEO
- [ ] "올리브영 공식" 키워드 전체 제거
- [ ] "병행수입", "정품" 키워드 투명하게 사용
- [ ] 메타 태그에서 과장 표현 제거
- [ ] OG 이미지에 올리브영 로고 미사용

---

## 네이버 검색 최적화 (선택 사항)

### 네이버 웹마스터 도구 메타 태그

```html
<meta name="naver-site-verification" content="[인증 코드]">
```

### 네이버 쇼핑 EP (선택 사항)

**주의**: 네이버 쇼핑 EP 연동 시 네이버의 쇼핑몰 정책 추가 검토 필요
- 해외 배송 전용 쇼핑몰의 EP 허용 여부 확인
- 병행수입 상품의 EP 정책 준수 여부 확인

---

## Google Search Console 설정 가이드

1. **사이트 소유권 인증**
   - HTML 파일 업로드 또는 메타 태그 추가

2. **Sitemap 제출**
   - `https://example.com/sitemap.xml` 제출

3. **URL 검사**
   - 메인 페이지 및 주요 상품 페이지 색인 요청

4. **Core Web Vitals 모니터링**
   - LCP (Largest Contentful Paint): 2.5초 이하 목표
   - FID (First Input Delay): 100ms 이하 목표
   - CLS (Cumulative Layout Shift): 0.1 이하 목표

---

**작성자**: Oliveyoung Marketing Copywriter Agent
**검증 도구**: Google Rich Results Test, Schema.org Validator
**참고 기준**: Google SEO Starter Guide, Schema.org Documentation
