import React, { useEffect, useState } from 'react';
import { HeroSection } from '../components/home/HeroSection.tsx';
import { TrustSection } from '../components/home/TrustSection.tsx';
import { ShopByBrandSection } from '../components/home/ShopByBrandSection.tsx';
import { FeaturedSection } from '../components/home/FeaturedSection.tsx';
import { FlashDealsSection } from '../components/home/FlashDealsSection.tsx';
import { BestSellersSection } from '../components/home/BestSellersSection.tsx';
import { NewArrivalsSection } from '../components/home/NewArrivalsSection.tsx';
import { RecentlyViewedSection } from '../components/home/RecentlyViewedSection.tsx';
import { Product, Brand, Banner } from '../types/index.ts';
import { api } from '../services/api.ts';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [prodRes, brandRes, banRes] = await Promise.all([
          api.getProducts(),
          api.getBrands(),
          api.getBanners(),
        ]);
        setProducts(prodRes.products);
        setBrands(brandRes.brands);
        setBanners(banRes.banners);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100">
      {/* 1. Hero Showcase */}
      <HeroSection onNavigate={onNavigate} />

      {/* 2. Trust Badges */}
      <TrustSection />

      {/* 3. Shop by Brand */}
      <ShopByBrandSection brands={brands} onNavigate={onNavigate} />

      {/* 4. Featured Flagships */}
      <FeaturedSection products={products} onNavigate={onNavigate} />

      {/* 5. Flash Deals (with Countdown Clock) */}
      <FlashDealsSection products={products} onNavigate={onNavigate} />

      {/* 6. Best Sellers */}
      <BestSellersSection products={products} onNavigate={onNavigate} />

      {/* 7. New Arrivals */}
      <NewArrivalsSection products={products} onNavigate={onNavigate} />

      {/* 8. Recently Viewed & Recommended */}
      <RecentlyViewedSection products={products} onNavigate={onNavigate} />
    </div>
  );
};
