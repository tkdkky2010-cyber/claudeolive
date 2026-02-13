# 최종 면책 조항 (구현용)

**작성일**: 2026-02-10
**적용 대상**: 올영 TOP 100 (올리브영 랭킹 기반 커머스 사이트)
**법적 근거**: Phase 1 법적 리스크 평가, 전자상거래법, 부정경쟁방지법, 상표법
**검토 상태**: Phase 1 완료, 법률 자문 최종 검토 대기

---

## 1. 상단 배너 문구 (모든 페이지 필수)

### 배경: #FFF9E6 (연한 노란색)
### 텍스트 색: #333333
### 폰트 크기: 14px (모바일 12px)
### 패딩: 상하 12px, 좌우 20px

### HTML 구현 코드

```html
<div class="disclaimer-banner" style="background-color: #FFF9E6; color: #333333; padding: 12px 20px; text-align: center; font-size: 14px; border-bottom: 1px solid #E6D89E;">
  본 사이트는 CJ올리브영(주)의 공식 사이트가 아니며, 제휴 관계가 없습니다. 올리브영에서 구매한 정품을 해외로 수출하는 독립 셀러가 운영합니다.
</div>
```

### React 컴포넌트 예시

```jsx
export function DisclaimerBanner() {
  return (
    <div className="bg-[#FFF9E6] text-[#333333] py-3 px-5 text-center text-sm border-b border-[#E6D89E]">
      본 사이트는 CJ올리브영(주)의 공식 사이트가 아니며, 제휴 관계가 없습니다.
      올리브영에서 구매한 정품을 해외로 수출하는 독립 셀러가 운영합니다.
    </div>
  );
}
```

### 모바일 간결 버전 (선택 사항)

```html
<div class="disclaimer-banner-mobile">
  올리브영 공식 사이트 아님 · 독립 셀러 운영 · 병행수입 정품
</div>
```

**권장**: 데스크톱/모바일 동일 문구 사용 (법적 안전성 우선)

---

## 2. 푸터 면책 조항 (실제 HTML 구현용)

### HTML 구조

```html
<footer class="site-footer">

  <!-- 면책 조항 섹션 -->
  <section class="disclaimer-section">
    <h3>본 사이트 정보</h3>
    <p>
      본 사이트는 <strong>CJ올리브영(주)의 공식 사이트가 아니며</strong>, 어떠한 제휴 관계도 없습니다.<br>
      올리브영에서 직접 구매한 정품을 병행수입 방식으로 해외 고객에게 판매하는 독립 셀러가 운영합니다.
    </p>

    <h4>상품 정보</h4>
    <ul>
      <li>모든 상품은 올리브영에서 구매한 정품입니다.</li>
      <li>병행수입을 통해 유통되는 정품으로, 제조사 공식 수입 경로와 무관합니다.</li>
      <li>병행수입 특성상 제조사 국내 공식 A/S가 적용되지 않을 수 있습니다.</li>
      <li>랭킹 정보는 1일 1회 업데이트되며 실시간이 아닙니다.</li>
    </ul>

    <h4>가격 및 배송</h4>
    <ul>
      <li>상품 가격은 올리브영 판매가와 동일합니다.</li>
      <li>해외 배송비는 무료입니다.</li>
      <li>국내 배송은 현재 제공하지 않습니다.</li>
    </ul>
  </section>

  <!-- 사업자 정보 섹션 -->
  <section class="business-info-section">
    <h3>사업자 정보</h3>
    <table class="business-info-table">
      <tbody>
        <tr>
          <td>상호(법인명)</td>
          <td>(주)OOO</td>
        </tr>
        <tr>
          <td>대표자</td>
          <td>홍길동</td>
        </tr>
        <tr>
          <td>사업자등록번호</td>
          <td>000-00-00000</td>
        </tr>
        <tr>
          <td>통신판매업 신고번호</td>
          <td>제0000-서울OO-00000호</td>
        </tr>
        <tr>
          <td>주소</td>
          <td>서울특별시 OO구 OO로 00</td>
        </tr>
        <tr>
          <td>이메일</td>
          <td><a href="mailto:contact@example.com">contact@example.com</a></td>
        </tr>
        <tr>
          <td>전화</td>
          <td>02-0000-0000</td>
        </tr>
        <tr>
          <td>개인정보보호책임자</td>
          <td>홍길동</td>
        </tr>
      </tbody>
    </table>

    <h4>고객센터</h4>
    <p>
      이메일: <a href="mailto:support@example.com">support@example.com</a><br>
      운영시간: 평일 10:00 - 18:00 (주말·공휴일 휴무)
    </p>
  </section>

  <!-- 푸터 링크 -->
  <section class="footer-links">
    <a href="/terms">이용약관</a>
    <span>|</span>
    <a href="/privacy">개인정보처리방침</a>
    <span>|</span>
    <a href="/refund">환불정책</a>
    <span>|</span>
    <a href="/shipping">배송정보</a>
  </section>

  <!-- 저작권 고지 -->
  <section class="copyright">
    <p>Copyright © 2026 (주)OOO. All rights reserved.</p>
  </section>

</footer>
```

### 스타일 가이드 (CSS)

```css
.disclaimer-section {
  background-color: #F9F9F9;
  padding: 30px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.disclaimer-section h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.disclaimer-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 10px;
  color: #555;
}

.disclaimer-section p {
  line-height: 1.6;
  color: #666;
  margin-bottom: 15px;
}

.disclaimer-section ul {
  list-style-type: disc;
  padding-left: 20px;
  color: #666;
}

.disclaimer-section li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.business-info-table {
  width: 100%;
  border-collapse: collapse;
}

.business-info-table td {
  padding: 10px 0;
  border-bottom: 1px solid #E0E0E0;
}

.business-info-table td:first-child {
  font-weight: 600;
  width: 200px;
  color: #555;
}

.footer-links {
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid #E0E0E0;
  border-bottom: 1px solid #E0E0E0;
}

.footer-links a {
  color: #555;
  text-decoration: none;
  margin: 0 10px;
}

.footer-links a:hover {
  text-decoration: underline;
}

.copyright {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 14px;
}
```

---

## 3. 외부 링크 안내 문구

### "올리브영에서 상품 보기" 버튼 툴팁/안내

```html
<button
  class="external-link-button"
  title="올리브영 공식 사이트로 이동합니다 (새 창)"
  onclick="window.open('https://www.oliveyoung.co.kr/...', '_blank')"
>
  올리브영에서 상품 보기
  <span class="external-icon">↗</span>
</button>
```

### 외부 링크 클릭 시 모달 (선택 사항, 권장하지 않음)

**주의**: 외부 링크 모달은 사용자 경험을 저해할 수 있으므로 권장하지 않음.
대신 버튼 디자인과 아이콘으로 충분히 외부 링크임을 표시.

만약 법적 요구사항이 있다면 아래 구현:

```html
<div class="external-link-modal">
  <h3>외부 사이트로 이동합니다</h3>
  <p>
    올리브영 공식 사이트로 이동합니다.<br>
    본 사이트와 올리브영은 어떠한 제휴 관계도 없습니다.
  </p>
  <button onclick="proceedToOliveYoung()">확인</button>
  <button onclick="closeModal()">취소</button>
</div>
```

**최종 권장**: 모달 없이 직접 링크, 버튼에 외부 링크 아이콘만 표시

---

## 4. 결제 페이지 동의 문구

### 주문 최종 확인 전 동의 체크박스

```html
<div class="checkout-agreements">

  <div class="agreement-item">
    <input type="checkbox" id="agree-product-info" required>
    <label for="agree-product-info">
      <strong>(필수)</strong> 상품 정보 및 병행수입 안내를 확인했습니다.
    </label>
    <button class="view-details" onclick="showProductInfoModal()">자세히 보기</button>
  </div>

  <div class="agreement-item">
    <input type="checkbox" id="agree-terms" required>
    <label for="agree-terms">
      <strong>(필수)</strong> <a href="/terms" target="_blank">이용약관</a>에 동의합니다.
    </label>
  </div>

  <div class="agreement-item">
    <input type="checkbox" id="agree-privacy" required>
    <label for="agree-privacy">
      <strong>(필수)</strong> <a href="/privacy" target="_blank">개인정보처리방침</a>에 동의합니다.
    </label>
  </div>

  <div class="agreement-item">
    <input type="checkbox" id="agree-refund" required>
    <label for="agree-refund">
      <strong>(필수)</strong> <a href="/refund" target="_blank">환불정책</a>을 확인했습니다.
    </label>
  </div>

  <div class="agreement-item">
    <input type="checkbox" id="agree-marketing">
    <label for="agree-marketing">
      (선택) 마케팅 정보 수신에 동의합니다.
    </label>
  </div>

</div>

<button
  class="checkout-button"
  id="final-checkout-button"
  disabled
>
  결제하기
</button>

<script>
// 필수 동의 항목 모두 체크 시 결제 버튼 활성화
const requiredCheckboxes = document.querySelectorAll('input[type="checkbox"][required]');
const checkoutButton = document.getElementById('final-checkout-button');

requiredCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    const allChecked = Array.from(requiredCheckboxes).every(cb => cb.checked);
    checkoutButton.disabled = !allChecked;
  });
});
</script>
```

### 병행수입 상품 정보 모달 (자세히 보기)

```html
<div id="product-info-modal" class="modal">
  <div class="modal-content">
    <h2>상품 및 병행수입 안내</h2>

    <h3>1. 상품 출처</h3>
    <p>
      모든 상품은 올리브영 공식 매장에서 직접 구매한 정품입니다.<br>
      본 사이트는 올리브영과 제휴 관계가 없는 독립 셀러입니다.
    </p>

    <h3>2. 병행수입이란?</h3>
    <p>
      병행수입은 제조사의 공식 수입 경로와 별도로, 정품을 해외에서 합법적으로 수입하여 판매하는 방식입니다.<br>
      상표법 제51조(소진이론)에 따라 합법적인 유통 방식입니다.
    </p>

    <h3>3. 병행수입 상품의 특성</h3>
    <ul>
      <li>정품이나, 제조사 공식 수입 경로가 아닙니다.</li>
      <li>제조사 국내 공식 A/S가 제공되지 않을 수 있습니다.</li>
      <li>상품 불량 시 본 사이트 고객센터를 통해 환불/교환 가능합니다.</li>
    </ul>

    <h3>4. 가격 및 배송</h3>
    <ul>
      <li>상품 가격은 올리브영 판매가와 동일합니다.</li>
      <li>해외 배송비는 무료입니다.</li>
      <li>배송 기간: 주문 후 7-14일 (국가별 상이)</li>
    </ul>

    <h3>5. 환불 정책</h3>
    <p>
      배송 완료 후 7일 이내 환불 요청 가능합니다.<br>
      상품 불량 시 전액 환불 또는 교환 가능합니다.<br>
      단순 변심 시 왕복 배송비 고객 부담입니다.
    </p>

    <button onclick="closeProductInfoModal()">확인</button>
  </div>
</div>
```

---

## 5. 상품 카드 면책 문구 (선택 사항)

### 상품 이미지 하단 또는 가격 옆

```html
<div class="product-source-label">
  출처: 올리브영
</div>
```

또는

```html
<div class="product-authenticity-badge">
  올리브영 정품
</div>
```

**스타일 가이드**:
```css
.product-source-label {
  font-size: 11px;
  color: #999;
  margin-top: 5px;
}

.product-authenticity-badge {
  display: inline-block;
  background-color: #E8F5E9;
  color: #2E7D32;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 5px;
}
```

**권장**: 상품 카드에는 최소한의 정보만 표시, 자세한 내용은 푸터/체크아웃에서 확인

---

## 6. 이용약관 핵심 조항 (별도 문서 작성 필요)

### 필수 포함 사항

```
제1조 (목적)
본 약관은 올영 TOP 100(이하 "회사")가 제공하는 해외 직구 서비스의 이용 조건 및 절차를 규정함을 목적으로 합니다.

제2조 (정의)
1. "사이트"란 회사가 운영하는 올영 TOP 100 웹사이트를 말합니다.
2. "상품"이란 올리브영에서 구매한 정품으로, 병행수입 방식으로 유통됩니다.
3. "이용자"란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.

제3조 (회사와 올리브영의 관계)
1. 본 사이트는 CJ올리브영(주)의 공식 사이트가 아니며, 어떠한 제휴 관계도 없습니다.
2. 올리브영은 본 사이트의 거래 내용에 대해 책임을 지지 않습니다.
3. 상품 관련 문의는 본 사이트 고객센터로만 가능합니다.

제4조 (병행수입 상품의 특성)
1. 모든 상품은 병행수입 정품입니다.
2. 제조사 국내 공식 A/S가 적용되지 않을 수 있습니다.
3. 상품 불량 시 회사의 환불/교환 정책이 적용됩니다.

제5조 (환불 및 교환)
1. 배송 완료 후 7일 이내 환불 요청 가능합니다.
2. 상품 불량 시 전액 환불 또는 교환 가능합니다.
3. 단순 변심 시 왕복 배송비는 고객 부담입니다.

제6조 (개인정보 보호)
회사는 개인정보보호법에 따라 이용자의 개인정보를 보호합니다.
자세한 내용은 개인정보처리방침을 참조하시기 바랍니다.
```

---

## 7. 개인정보처리방침 핵심 조항 (별도 문서 작성 필요)

### 필수 포함 사항

```
1. 수집하는 개인정보 항목
- 필수: 이름, 이메일, 배송지 주소, 전화번호
- 선택: 마케팅 수신 동의 여부

2. 개인정보의 수집 및 이용 목적
- 주문/배송 처리
- 고객 문의 응대
- 마케팅 정보 발송 (동의 시)

3. 개인정보의 보유 및 이용 기간
- 회원 탈퇴 시까지 (단, 법령에 따라 일부 정보는 5년간 보관)

4. 개인정보의 제3자 제공
- 배송 업체: 이름, 주소, 전화번호 (배송 목적)
- 결제 대행사: 결제 정보 (결제 처리 목적)

5. 개인정보 보호책임자
- 이름: 홍길동
- 이메일: privacy@example.com
- 전화: 02-0000-0000
```

---

## 8. MVP 결제 준비 중 알림 문구

### 결제 버튼 클릭 시 모달

```html
<div class="payment-coming-soon-modal">
  <h2>결제 기능 준비 중</h2>
  <p>
    현재 결제 시스템을 개발 중입니다.<br>
    빠른 시일 내에 서비스를 시작하겠습니다.
  </p>
  <p>
    상품에 대한 문의나 선주문을 원하시면<br>
    <strong>contact@example.com</strong>으로 이메일을 보내주세요.
  </p>
  <button class="close-modal-button">확인</button>
</div>
```

---

## 법적 준수 최종 체크리스트

### 페이지 레벨
- [ ] 모든 페이지 상단에 면책 배너 표시
- [ ] 푸터에 사업자 정보 전체 표기
- [ ] 푸터에 면책 조항 상세 표기
- [ ] 이용약관, 개인정보처리방침, 환불정책 링크

### UI 요소
- [ ] "올리브영에서 상품 보기" 버튼에 외부 링크 아이콘
- [ ] 외부 링크 `target="_blank"` 설정
- [ ] 상품 카드에 "출처: 올리브영" 표시 (선택)

### 결제 플로우
- [ ] 병행수입 안내 동의 체크박스 (필수)
- [ ] 이용약관 동의 체크박스 (필수)
- [ ] 개인정보처리방침 동의 체크박스 (필수)
- [ ] 환불정책 확인 체크박스 (필수)
- [ ] 모든 필수 동의 후에만 결제 버튼 활성화

### 콘텐츠
- [ ] "올리브영 공식", "파트너", "제휴" 등 금지 표현 전체 제거
- [ ] "병행수입 정품" 명확히 표시
- [ ] "CJ올리브영(주)와 무관" 명확히 표시

---

## 추가 권장 사항

### 1. 법률 자문 검토 항목
- [ ] 통신판매업 신고 완료
- [ ] 이용약관 전문 변호사 검토
- [ ] 개인정보처리방침 전문 변호사 검토
- [ ] 환불정책 전자상거래법 준수 확인

### 2. 리스크 관리
- [ ] 올리브영으로부터 저작권/상표권 침해 경고 대응 계획
- [ ] 고객 분쟁 발생 시 대응 매뉴얼
- [ ] 상품 불량 시 환불/교환 프로세스 문서화

### 3. 투명성 강화
- [ ] "자주 묻는 질문(FAQ)" 페이지 제작
  - "올리브영과 관계가 어떻게 되나요?"
  - "정품인가요?"
  - "A/S는 어떻게 받나요?"
- [ ] 고객 후기 섹션 (신뢰도 향상)

---

**작성자**: Oliveyoung Marketing Copywriter Agent
**법적 근거**: 전자상거래법, 부정경쟁방지법, 상표법, 개인정보보호법
**최종 검토 필요**: 법률 자문 변호사

---

## 부록: 금지 표현 vs 허용 표현 최종 정리

| 금지 (절대 사용 금지) | 허용 (안전한 표현) |
|---------------------|------------------|
| 올리브영 공식 파트너 | 올리브영 정품 판매 |
| 올리브영 공식 사이트 | 올리브영 랭킹 정보 제공 사이트 |
| 올리브영과 제휴 | 올리브영에서 구매한 정품 |
| 정식 수입품 | 병행수입 정품 |
| 공식 판매가 | 올리브영 동일 가격 |
| 올리브영 인증 셀러 | 독립 셀러 |
| 올리브영 추천 | 랭킹 기반 인기 상품 |
| 올리브영에서 구매하기 | 올리브영에서 상품 보기 |

---

**최종 업데이트**: 2026-02-10
**다음 검토 예정**: 법률 자문 후 재검토
