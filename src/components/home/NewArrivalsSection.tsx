import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { ProductCard } from '../common/ProductCard.tsx';

interface NewArrivalsSectionProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

export const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({ products, onNavigate }) => {
  const newArrivals = products.filter(p => p.newArrival).slice(0, 4);

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>JUST UNVEILED</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              New Arrivals
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-lg">
              Freshly released flagship models equipped with 3nm architecture and enhanced on-device neural engines.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/phones?sort=newest')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>See New Releases</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </section>
  );
};
