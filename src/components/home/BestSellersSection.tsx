import React from 'react';
import { Award, ArrowRight } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { ProductCard } from '../common/ProductCard.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface BestSellersSectionProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({ products, onNavigate }) => {
  const { t } = useLanguage();
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 4);

  if (bestSellers.length === 0) return null;

  return (
    <section className="py-14 lg:py-24 bg-[#080C18]/70 border-y border-white/5">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 lg:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2.5">
              <Award className="w-3.5 h-3.5" />
              <span>{t('home.bestSellersBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-['Space_Grotesk'] font-extrabold text-white tracking-tight">
              {t('home.bestSellersTitle')}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/phones')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-all group self-start sm:self-auto"
          >
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Mobile Horizontal Slider + Desktop Multi-Column Grid */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {bestSellers.map((product) => (
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
