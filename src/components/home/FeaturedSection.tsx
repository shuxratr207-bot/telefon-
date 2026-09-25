import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { ProductCard } from '../common/ProductCard.tsx';

interface FeaturedSectionProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ products, onNavigate }) => {
  const featured = products.filter(p => p.featured).slice(0, 4);

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CURATED BENCHMARKS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              Featured Flagships
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-lg">
              Hand-picked powerhouse devices that define the bleeding edge of speed, optics, and battery endurance.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/phones')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>See All Phones</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </section>
  );
};
