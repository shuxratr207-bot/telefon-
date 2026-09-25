import React, { useState, useEffect } from 'react';
import { History, Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { ProductCard } from '../common/ProductCard.tsx';

interface RecentlyViewedSectionProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({ products, onNavigate }) => {
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nova_recently_viewed');
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const matched = ids.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
        if (matched.length > 0) {
          setViewedProducts(matched.slice(0, 4));
          return;
        }
      }
    } catch {}

    // Fallback: Recommended devices
    setViewedProducts(products.slice(4, 8));
  }, [products]);

  if (viewedProducts.length === 0) return null;

  return (
    <section className="py-20 relative bg-[#06070a]/70 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <History className="w-3.5 h-3.5" />
              <span>EXPLORATION HISTORY &amp; PICKS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              Recommended For You
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-lg">
              Tailored smartphones based on your recent visits and flagship category benchmarks.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/phones')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {viewedProducts.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </section>
  );
};
