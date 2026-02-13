import { useState } from 'react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import Header from '../components/Header';
import CategoryTabs from '../components/CategoryTabs';
import ProductGrid from '../components/ProductGrid';
import CartSlide from '../components/CartSlide';
import Footer from '../components/Footer';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('전체');

  return (
    <div className="min-h-screen flex flex-col">
      <DisclaimerBanner />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-text mb-2">
            올리브영 랭킹 TOP 100
          </h2>
          <p className="text-text-secondary">
            올리브영 동일 가격으로 해외 무료배송을 받아보세요
          </p>
        </div>

        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <ProductGrid category={selectedCategory} />
      </main>

      <Footer />
      <CartSlide />
    </div>
  );
}
