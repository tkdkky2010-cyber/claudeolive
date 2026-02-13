export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 면책 조항 박스 */}
        <div className="bg-disclaimer border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="font-bold text-sm text-[#333333] mb-2">면책 조항</h3>
          <p className="text-sm text-[#333333] leading-relaxed">
            본 사이트는 CJ올리브영(주)의 공식 사이트가 아니며, 제휴 관계가 없습니다.
            올리브영에서 구매한 정품을 해외로 수출하는 독립 셀러가 운영합니다.
            상품의 품질 및 정품 여부는 올리브영 공식 구매 영수증으로 보증됩니다.
          </p>
        </div>

        {/* 3열 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 회사 정보 */}
          <div>
            <h3 className="font-bold text-text mb-4">회사 정보</h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>상호: 올영글로벌</p>
              <p>대표: 홍길동</p>
              <p>사업자등록번호: 123-45-67890</p>
              <p>통신판매업신고: 제2024-서울강남-00000호</p>
            </div>
          </div>

          {/* 고객 지원 */}
          <div>
            <h3 className="font-bold text-text mb-4">고객 지원</h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>이메일: support@oliveyoungglobal.com</p>
              <p>운영시간: 평일 09:00 - 18:00</p>
              <p>주말 및 공휴일 휴무</p>
              <p className="pt-2">
                <a href="#" className="text-primary hover:underline">자주 묻는 질문</a>
              </p>
            </div>
          </div>

          {/* 법적 고지 */}
          <div>
            <h3 className="font-bold text-text mb-4">법적 고지</h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>
                <a href="#" className="hover:text-text transition-colors">이용약관</a>
              </p>
              <p>
                <a href="#" className="hover:text-text transition-colors">개인정보처리방침</a>
              </p>
              <p>
                <a href="#" className="hover:text-text transition-colors">환불 정책</a>
              </p>
              <p>
                <a href="#" className="hover:text-text transition-colors">배송 정책</a>
              </p>
            </div>
          </div>
        </div>

        {/* 사업자 정보 */}
        <div className="border-t border-border pt-6 pb-4">
          <div className="text-xs text-text-secondary space-y-1">
            <p>주소: 서울특별시 강남구 테헤란로 123 (역삼동)</p>
            <p>호스팅 서비스 제공: AWS</p>
            <p className="pt-2">
              본 사이트에서 판매되는 모든 상품은 올리브영 공식 매장에서 구매한 정품이며,
              해외 배송을 위한 통관 절차를 거쳐 발송됩니다.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-sm text-text-secondary">
            &copy; {currentYear} 올영 TOP 100. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
