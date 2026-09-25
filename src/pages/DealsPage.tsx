import React, { useState, useEffect } from 'react';
import { Flame, Clock, Zap, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { Product, Deal } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';

interface DealsPageProps {
  onNavigate: (path: string) => void;
}

export const DealsPage: React.FC<DealsPageProps> = ({ onNavigate }) => {
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 24-hour countdown simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadDeals() {
      try {
        const [prodRes, dealRes] = await Promise.all([
          api.getProducts({ deal: 'true' }),
          api.getDeals(),
        ]);
        setDealProducts(prodRes.products);
        setDeals(dealRes.deals);
      } catch (e) {
        console.error('Failed to load deals:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDeals();
  }, []);

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Deal Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-rose-950/40 via-[#120e1c] to-indigo-950/40 border border-rose-500/30 p-8 sm:p-12 overflow-hidden shadow-2xl mb-12">
          <div className="max-w-xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
              <Flame className="w-3.5 h-3.5 fill-rose-400" />
              <span>FLASH SALE IN PROGRESS</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Space_Grotesk']">
              Exclusive Hardware Deals
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Save up to $200 instantly on selected titanium flagships, foldable wonders and gaming titans. Quantities are strictly capped per customer.
            </p>

            {/* Countdown Box */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-4 py-2.5 rounded-2xl">
                <Clock className="w-4 h-4 text-rose-400" />
                <span className="text-xs uppercase font-semibold text-slate-400">Offer Expires In:</span>
                <div className="flex items-center gap-1 font-mono font-bold text-white text-sm">
                  <span className="text-rose-400">{String(timeLeft.hours).padStart(2, '0')}h</span>
                  <span>:</span>
                  <span className="text-rose-400">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                  <span>:</span>
                  <span className="text-rose-400">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">
              Active Flash Price Cuts ({dealProducts.length})
            </h2>
            <p className="text-xs text-slate-400 mt-1">Dispatched in original factory sealed packaging</p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-400">Loading promotional stock...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dealProducts.map(product => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
