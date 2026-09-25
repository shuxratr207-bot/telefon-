import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, Clock, ArrowRight, Zap, ShoppingBag } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { ProductCard } from '../common/ProductCard.tsx';

interface FlashDealsSectionProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({ products, onNavigate }) => {
  // Countdown Timer state: 18h 42m 19s
  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = products.filter(p => p.deal || p.discount > 0).slice(0, 4);

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#090a0f] via-[#0d0914] to-[#090a0f]">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Countdown */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-2">
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>LIMITED QUANTITY SPECIALS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              Flash Deals &amp; Offers
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Unrivaled price cuts on premier tier devices. Dispatched while promotional stock lasts.
            </p>
          </div>

          {/* Countdown Clock Widget */}
          <div className="flex items-center gap-3 bg-[#130f1d] border border-rose-500/30 px-4 py-2.5 rounded-2xl shadow-xl shadow-rose-950/20">
            <Clock className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Ends In:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-white text-sm">
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-rose-300">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-rose-400">:</span>
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-rose-300">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-rose-400">:</span>
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-rose-300">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Deals Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealProducts.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>

        {/* Bottom Banner CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => onNavigate('/deals')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs tracking-wider uppercase transition-all"
          >
            <span>Explore All Flash Deals</span>
            <ArrowRight className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>
    </section>
  );
};
