import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import AuthModal from './AuthModal';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleCartClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setIsCartOpen(true);
  };

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  return (
    <>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-18">
            {/* 로고 */}
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                올영 TOP 100
              </h1>
              <span className="hidden sm:inline ml-3 text-sm text-text-secondary">
                올리브영 동일 가격, 해외 무료배송
              </span>
            </div>

            {/* 우측 메뉴 */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* 장바구니 */}
              <button
                onClick={handleCartClick}
                className="relative p-2 hover:bg-background rounded-lg transition-colors"
                aria-label="장바구니"
              >
                <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              {/* 로그인/사용자 */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={user?.user_metadata?.avatar_url || 'https://via.placeholder.com/32'}
                      alt={user?.user_metadata?.name || user?.email}
                      className="w-8 h-8 rounded-full border border-border"
                    />
                    <span className="hidden sm:inline text-sm font-medium text-text">
                      {user?.user_metadata?.name || user?.email}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-text-secondary hover:text-text transition-colors px-3 py-1.5 hover:bg-background rounded"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  로그인
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
