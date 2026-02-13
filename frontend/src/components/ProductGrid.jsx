import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import ProductCard from './ProductCard';

export default function ProductGrid({ category = '전체' }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Always send category parameter
      const url = `/products?category=${encodeURIComponent(category)}`;
      const response = await apiClient.get(url);
      console.log(`${category} 카테고리 API 응답:`, response.data);

      // API 응답 구조: { success: true, data: { products: [...] } }
      const productList = response.data.data?.products || response.data.products || [];
      console.log(`${category} 상품 목록:`, productList.length, '개');
      setProducts(productList);
    } catch (err) {
      console.error('상품 로드 실패:', err);
      setError(`${category} 상품을 불러올 수 없습니다`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [category]); // category가 변경되면 다시 로드

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-text-secondary">상품을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg className="w-16 h-16 text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-text-secondary mb-4">{error}</p>
        <button
          onClick={loadProducts}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded font-medium transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-text-secondary">표시할 상품이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
