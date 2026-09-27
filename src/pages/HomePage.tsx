import React, { useEffect, useState } from 'react';
import { Sparkles, Send, CheckCircle2, RotateCcw } from 'lucide-react';
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
import { useLanguage } from '../context/LanguageContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const loadHomeData = async () => {
    setIsLoading(true);
    setHasError(false);
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
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    showToast(t('home.newsletterSuccess'), 'success');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100">
      {/* 1. Hero Showcase */}
      <HeroSection onNavigate={onNavigate} />

      {/* 2. Trust Badges */}
      <TrustSection />

      {hasError ? (
        <div className="max-w-xl mx-auto my-16 p-8 rounded-3xl bg-[#0d0f17] border border-rose-500/30 text-center space-y-4">
          <p className="text-sm text-slate-300">{t('product.errorLoading')}</p>
          <button
            onClick={loadHomeData}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('product.retry')}</span>
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}

      {/* 9. Homepage VIP Newsletter Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-cyan-950/50 via-[#0d1122] to-indigo-950/50 border border-cyan-500/30 p-8 sm:p-12 overflow-hidden shadow-2xl text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('home.newsletterBadge')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk'] max-w-2xl mx-auto">
            {t('home.newsletterTitle')}
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            {t('home.newsletterSub')}
          </p>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              placeholder={t('home.newsletterPlaceholder')}
              className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>{t('home.newsletterBtn')}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {newsletterSubscribed && (
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('home.newsletterSuccess')}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
