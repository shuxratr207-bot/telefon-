import React, { useState, useEffect } from 'react';
import { History, ArrowRight } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { ProductCard } from '../common/ProductCard.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

export function saveRecentlyViewed(productId: string) {
  try {
    const stored = localStorage.getItem('nova_recently_viewed');
    const ids: string[] = stored ? JSON.parse(stored) : [];
    const updated = [productId, ...ids.filter((id) => id !== productId)].slice(0, 8);
    localStorage.setItem('nova_recently_viewed', JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

interface RecentlyViewedSectionProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  products,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nova_recently_viewed');
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const matched = ids
          .map((id) => products.find((p) => p.id === id))
          .filter(Boolean) as Product[];
        if (matched.length > 0) {
          setViewedProducts(matched.slice(0, 4));
          return;
        }
      }
    } catch {}

    setViewedProducts(products.slice(4, 8));
  }, [products]);

  if (viewedProducts.length === 0) return null;

  return (
    <section className="py-14 lg:py-24 relative bg-[#06070a]/70 border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 lg:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <History className="w-3.5 h-3.5" />
              <span>{t('home.recentBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              {t('home.recentTitle')}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/phones')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {viewedProducts.map((product) => (
            <div
              key={product.id}
              className="w-[80vw] max-w-[310px] sm:w-auto sm:max-w-none shrink-0 snap-start"
            >
              <ProductCard product={product} onNavigate={onNavigate} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
