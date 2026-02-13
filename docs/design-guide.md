# 디자인 가이드라인

## 1. 컬러 시스템

### Primary Colors
- Primary Green: #2C7A3F
- Primary Green Hover: #246731
- Primary Green Active: #1D5226
- Primary Green Disabled: #8FB89A

### Secondary Colors
- Secondary Orange: #FF6B35 (할인율, 강조)
- Light Green Background: #F4F8F5

### Neutral Colors
- Text Primary: #1A1A1A
- Text Secondary: #666666
- Text Tertiary: #999999
- Border: #E0E0E0
- Background: #FFFFFF
- Background Gray: #F8F8F8

### Semantic Colors
- Success: #2C7A3F
- Error: #E53935
- Warning: #FFA726
- Info: #42A5F5
- Link External: #5C6AC4

## 2. 타이포그래피

### 폰트 패밀리
```css
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
```

### 폰트 스케일

| 역할 | 모바일 | 데스크톱 | 두께 |
|------|--------|---------|------|
| H1 | 24px | 32px | 700 |
| H2 | 20px | 24px | 700 |
| Body Large | 16px | 16px | 400 |
| Body | 14px | 14px | 400 |
| Caption | 12px | 12px | 400 |
| Price Large | 22px | 24px | 700 |
| Rank Number | 28px | 32px | 800 |

## 3. 간격 시스템 (8px 기반)

- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px

## 4. 브레이크포인트

- Mobile: 0 ~ 767px
- Tablet: 768px ~ 1199px
- Desktop: 1200px+
- Container max-width: 1440px

## 5. 그림자

```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 4px 8px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06);
--shadow-lg: 0 10px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.08);
```

## 6. 테두리 반경

- small: 4px (버튼), medium: 8px (카드), large: 12px (모달), pill: 9999px (뱃지)

## 7. 버튼 스타일

### Primary Button (장바구니 추가)
- 배경: #2C7A3F, 텍스트: #FFFFFF, 높이: 44~48px, 반경: 4px

### Secondary Button (올리브영에서 보기)
- 배경: #FFFFFF, 텍스트: #5C6AC4, 테두리: 1px solid #E0E0E0

## 8. CSS Variables

```css
:root {
  --color-primary: #2C7A3F;
  --color-primary-hover: #246731;
  --color-secondary: #FF6B35;
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #666666;
  --color-border: #E0E0E0;
  --color-bg: #FFFFFF;
  --color-bg-gray: #F8F8F8;
  --color-error: #E53935;
  --color-link-external: #5C6AC4;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease-in-out;
  --transition-slide: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
```
