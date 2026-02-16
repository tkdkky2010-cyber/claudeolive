import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api'; // Use the configured api client with auth headers
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 장바구니 데이터 로드
  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('📦 [loadCart] Not authenticated, clearing cart');
      setCartItems([]);
      return;
    }

    console.log('📦 [loadCart] Loading cart...');
    setIsLoading(true);
    try {
      const response = await api.get(`/cart`);
      console.log('📦 [loadCart] Raw response:', response);
      console.log('📦 [loadCart] Response data:', response.data);
      console.log('📦 [loadCart] Cart items:', response.data.data?.items || response.data.items);

      // Backend returns { success: true, data: { items: [...] } }
      // So we need response.data.data.items
      const items = response.data.data?.items || response.data.items || [];
      console.log('📦 [loadCart] Setting cart items count:', items.length);
      console.log('📦 [loadCart] Cart items:', items);
      setCartItems(items);
    } catch (error) {
      console.error('❌ [loadCart] 장바구니 로드 실패:', error);
      console.error('Response:', error.response?.data);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // 인증 상태 변경 시 장바구니 로드
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // 장바구니 추가
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    try {
      console.log('🛒 [CartContext] Adding to cart:', { productId, quantity });
      const response = await api.post(`/cart`, { productId, quantity });
      console.log('✅ [CartContext] Cart API response:', response.data);
      await loadCart(); // 장바구니 새로고침
      setIsCartOpen(true); // 장바구니 자동으로 열기
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ [CartContext] 장바구니 추가 실패:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Error message:', error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message || '장바구니 추가에 실패했습니다'
      };
    }
  };

  // 수량 변경
  const updateQuantity = async (cartItemId, quantity) => {
    if (!isAuthenticated) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    if (quantity < 1) {
      return removeFromCart(cartItemId);
    }

    try {
      await api.patch(`/cart/${cartItemId}`, { quantity });
      await loadCart();
      return { success: true };
    } catch (error) {
      console.error('수량 변경 실패:', error);
      return {
        success: false,
        error: error.response?.data?.error || '수량 변경에 실패했습니다'
      };
    }
  };

  // 장바구니 삭제
  const removeFromCart = async (cartItemId) => {
    if (!isAuthenticated) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    try {
      await api.delete(`/cart/${cartItemId}`);
      await loadCart();
      return { success: true };
    } catch (error) {
      console.error('장바구니 삭제 실패:', error);
      return {
        success: false,
        error: error.response?.data?.error || '삭제에 실패했습니다'
      };
    }
  };

  // 계산 값들
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  // Backend returns flat structure: item.salePrice (not item.product.salePrice)
  const subtotal = cartItems.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);
  const vat = Math.floor(subtotal * 0.1);
  const total = subtotal + vat;

  const value = {
    cartItems,
    isCartOpen,
    isLoading,
    totalItems,
    subtotal,
    vat,
    total,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart: loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
