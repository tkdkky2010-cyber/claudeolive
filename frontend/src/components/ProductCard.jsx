import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const getRankBadgeStyle = (rank) => {
    if (rank === 1) {
      return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
    }
    if (rank === 2) {
      return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
    }
    if (rank === 3) {
      return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
    }
    return 'bg-black bg-opacity-60 text-white';
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('로그인이 필요합니다', 'error');
      return;
    }

    setIsAdding(true);
    const result = await addToCart(product.id, 1);
    setIsAdding(false);

    if (result.success) {
      showToast('장바구니에 추가되었습니다', 'success');
    } else {
      showToast(result.error || '추가 실패', 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      {/* 이미지 영역 */}
      <div className="relative aspect-square bg-background">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <p className="text-sm text-text-secondary text-center line-clamp-3">
              {product.name}
            </p>
          </div>
        )}

        {/* 순위 뱃지 */}
        <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-sm font-bold ${getRankBadgeStyle(product.rank)}`}>
          {product.rank}위
        </div>
      </div>

      {/* 상품 정보 */}
      <div className="p-4 space-y-3">
        {/* 상품명 */}
        <h3 className="text-base font-medium text-text line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        {/* 가격 정보 */}
        <div className="space-y-1">
          {product.discountRate > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-secondary font-bold text-lg">
                  {product.discountRate}%
                </span>
                <span className="text-text font-bold text-xl">
                  {product.salePrice?.toLocaleString() || 0}원
                </span>
              </div>
              <div className="text-text-secondary text-sm line-through">
                {product.originalPrice?.toLocaleString() || 0}원
              </div>
            </>
          ) : (
            <div className="text-text font-bold text-xl">
              {product.salePrice?.toLocaleString() || 0}원
            </div>
          )}
        </div>

        {/* 버튼 그룹 */}
        <div className="space-y-2 pt-2">
          {/* 장바구니 추가 버튼 */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? '추가 중...' : '장바구니 추가'}
          </button>

          {/* 올리브영에서 보기 버튼 */}
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full border-2 border-link text-link py-3 rounded font-medium transition-colors hover:bg-link hover:text-white flex items-center justify-center gap-2 group"
          >
            <span>올리브영에서 상품 보기</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
