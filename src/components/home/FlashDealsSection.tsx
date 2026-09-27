import React, { useState, useEffect } from 'react';
import { Flame, ArrowRight, Timer } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { ProductCard } from '../common/ProductCard.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface FlashDealsSectionProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({ products, onNavigate }) => {
  const { t } = useLanguage();
  const dealProducts = products
    .filter((p) => p.deal || (p.discount && p.discount > 0))
    .slice(0, 4);

  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (dealProducts.length === 0) return null;

  return (
    <section className="py-14 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-rose-950/10 via-purple-950/10 to-transparent pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="p-6 sm:p-8 lg:p-12 rounded-[2.5rem] bg-gradient-to-br from-[#0F172A] via-[#0B1120] to-[#130D26] border border-rose-500/20 shadow-2xl shadow-rose-500/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 lg:mb-10 pb-6 lg:pb-8 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Flame className="w-3.5 h-3.5 fill-rose-400" />
                <span>{t('home.flashBadge')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-['Space_Grotesk'] font-extrabold text-white tracking-tight">
                {t('home.flashTitle')}
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-1">{t('home.flashSub')}</p>
            </div>

            {/* Countdown Timer */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
                <Timer className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-center gap-2">
                {[
                  { label: t('home.hours'), value: String(timeLeft.hours).padStart(2, '0') },
                  { label: t('home.mins'), value: String(timeLeft.minutes).padStart(2, '0') },
                  { label: t('home.secs'), value: String(timeLeft.seconds).padStart(2, '0') },
                ].map((unit, i) => (
                  <React.Fragment key={i}>
                    <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center">
                      <span className="text-lg sm:text-xl font-['Space_Grotesk'] font-extrabold text-white">
                        {unit.value}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider">
                        {unit.label}
                      </span>
                    </div>
                    {i < 2 && <span className="text-rose-400 font-bold text-lg">:</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Horizontal Slider + Desktop Multi-Column Grid */}
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-4 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0 no-scrollbar">
            {dealProducts.map((product) => (
              <div
                key={product.id}
                className="w-[78vw] max-w-[300px] sm:w-auto sm:max-w-none shrink-0 snap-start"
              >
                <ProductCard product={product} onNavigate={onNavigate} />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('/deals')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-all"
            >
              <span>{t('hero.dealsBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
