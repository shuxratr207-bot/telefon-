import React from 'react';
import { motion } from 'motion/react';
import { Award, ArrowRight, TrendingUp } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { ProductCard } from '../common/ProductCard.tsx';

interface BestSellersSectionProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({ products, onNavigate }) => {
  const bestSellers = products.filter(p => p.bestSeller).slice(0, 4);

  return (
    <section className="py-20 relative bg-[#07080d]/60 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>COMMUNITY FAVORITES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              Best Sellers
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-lg">
              The highest rated and most sought-after smartphones verified by verified owners worldwide.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/phones?sort=popular')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View Rankings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product, idx) => (
            <div key={product.id} className="relative">
              <div className="absolute -top-3 -left-2 z-20 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-extrabold text-xs flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-[#090a0f]">
                #{idx + 1}
              </div>
              <ProductCard product={product} onNavigate={onNavigate} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
