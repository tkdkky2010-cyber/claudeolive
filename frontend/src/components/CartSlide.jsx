import { useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';

export default function CartSlide() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    totalItems,
    subtotal,
    vat,
    total,
    updateQuantity,
    removeFromCart,
    isLoading,
  } = useCart();

  const slideRef = useRef(null);
  const itemsContainerRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isCartOpen, setIsCartOpen]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  // 장바구니 아이템이 변경될 때마다 스크롤을 최상단으로 이동
  useEffect(() => {
    if (isCartOpen && itemsContainerRef.current && cartItems.length > 0) {
      itemsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [cartItems.length, isCartOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsCartOpen(false);
    }
  };

  const handleCheckout = () => {
    alert('결제 기능은 준비 중입니다');
  };

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={handleOverlayClick}
    >
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* 슬라이드 패널 */}
      <div
        ref={slideRef}
        className="relative w-full sm:w-[400px] bg-white shadow-2xl flex flex-col animate-slide-in-right"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text">
            장바구니 ({totalItems})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-background rounded-lg transition-colors"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 장바구니 아이템 */}
        <div ref={itemsContainerRef} className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-text-secondary mb-4">장바구니가 비어 있습니다</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded font-medium transition-colors"
              >
                상품 둘러보기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="border border-border rounded-lg p-3">
                  <div className="flex gap-3">
                    {/* 상품 이미지 */}
                    <div className="w-20 h-20 flex-shrink-0 bg-background rounded overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-text-secondary p-2 text-center">
                          이미지 없음
                        </div>
                      )}
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-text line-clamp-2 mb-2">
                        {item.name}
                      </h3>
                      <p className="text-sm font-bold text-text mb-2">
                        {item.salePrice.toLocaleString()}원
                      </p>

                      {/* 수량 조절 */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center border border-border rounded hover:bg-background transition-colors"
                          aria-label="수량 감소"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center border border-border rounded hover:bg-background transition-colors"
                          aria-label="수량 증가"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex-shrink-0 text-text-secondary hover:text-error transition-colors p-1"
                      aria-label="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 결제 영역 */}
        {cartItems.length > 0 && (
          <div className="border-t border-border p-4 space-y-3 bg-background">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>소계</span>
                <span>{subtotal.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>VAT (10%)</span>
                <span>{vat.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>배송비</span>
                <span className="text-primary font-medium">무료</span>
              </div>
              <div className="flex justify-between text-base font-bold text-text pt-2 border-t border-border">
                <span>총 결제 금액</span>
                <span className="text-primary">{total.toLocaleString()}원</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold transition-colors"
            >
              결제하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
