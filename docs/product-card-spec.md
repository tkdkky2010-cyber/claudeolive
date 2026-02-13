# 상품 카드 컴포넌트 상세 스펙

## 카드 구조
```
+-------------------------------+
| [순위 뱃지]                    |  좌상단 오버레이
|                               |
|      상품 이미지 (1:1)         |
|                               |
+-------------------------------+
| 상품명 (2줄 말줄임)            |
|                               |
| [25%] 22,500원  ~~30,000원~~ |
|                               |
| +---------------------------+ |
| |  장바구니 추가              | |  Primary CTA
| +---------------------------+ |
| +---------------------------+ |
| |  올리브영에서 보기  ↗       | |  Secondary CTA
| +---------------------------+ |
+-------------------------------+
```

## 상세 치수
- 카드: 배경 #FFFFFF, 테두리 1px solid #E0E0E0, 반경 8px
- 이미지: 1:1 비율, 배경 #F8F8F8
- 상품명: 16px/400, 2줄 말줄임, 높이 48px 고정
- 할인율 뱃지: 배경 #FF6B35, 텍스트 #FFFFFF, 13px/700
- 할인가: 22px/700, 정상가: 16px/400 취소선 #999999
- Primary 버튼: 100%, 48px, 배경 #2C7A3F
- Secondary 버튼: 100%, 48px, 텍스트 #5C6AC4, 테두리 #E0E0E0

## 순위 뱃지
- 1위: gradient gold (#FFD700→#FFA500), 56px, 원형
- 2위: gradient silver (#E8E8E8→#C0C0C0)
- 3위: gradient bronze (#CD7F32→#A0522D)
- 4~100위: rgba(26,26,26,0.75), 48px, 원형

## 호버 상태
- box-shadow: var(--shadow-md), transform: translateY(-4px)

## Props (TypeScript)
```typescript
interface ProductCardProps {
  rank: number;
  productName: string;
  imageUrl: string;
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  externalUrl: string;
  onAddToCart: () => void;
  isLoading?: boolean;
}
```
