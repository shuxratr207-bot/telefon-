import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Camera,
  Cpu,
  BatteryCharging,
  Flame,
} from 'lucide-react';
import { Product } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface HeroSectionProps {
  featuredProduct?: Product;
  onNavigate: (path: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ featuredProduct, onNavigate }) => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-6 pb-16 lg:pt-14 lg:pb-28 border-b border-white/5">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Content Column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold tracking-wide uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-[5rem] font-['Space_Grotesk'] font-extrabold tracking-tight text-white leading-[1.03] mb-6">
              {t('hero.title1')}{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {t('hero.title2')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300/90 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed font-normal">
              {t('hero.subtitle')}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <button
                onClick={() => onNavigate('/phones')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-base shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-3 group cursor-pointer"
              >
                <span>{t('hero.exploreBtn')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('/deals')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold text-base border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span>{t('hero.dealsBtn')}</span>
              </button>
            </div>

            {/* Trust Stats Bar */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
              <div>
                <div className="text-2xl sm:text-3xl font-['Space_Grotesk'] font-extrabold text-white">
                  100%
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{t('hero.stat1Label')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-['Space_Grotesk'] font-extrabold text-cyan-400">
                  24h
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{t('hero.stat2Label')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-['Space_Grotesk'] font-extrabold text-indigo-400">
                  {t('hero.stat3Val')}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{t('hero.stat3Label')}</div>
              </div>
            </div>
          </motion.div>

          {/* Right Flagship Showcase Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/25 via-blue-500/20 to-indigo-600/25 rounded-[2.5rem] blur-2xl opacity-75" />

              <div className="relative rounded-[2.25rem] bg-gradient-to-b from-[#11192E] to-[#0A0F1E] border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                    Flagship Ti
                  </span>
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t('product.inStock')}
                  </span>
                </div>

                {/* Product Image */}
                <div
                  onClick={() =>
                    onNavigate(featuredProduct ? `/phones/${featuredProduct.id}` : '/phones')
                  }
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 cursor-pointer group bg-slate-950"
                >
                  <img
                    src={
                      featuredProduct?.images?.[0] ||
                      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85'
                    }
                    alt={featuredProduct?.name || 'iPhone 16 Pro Max'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent opacity-60" />
                </div>

                {/* Floating Spec Chips */}
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        {t('hero.chipAi')}
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {featuredProduct?.processor || t('hero.chipAiSub')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        {t('hero.chipCamera')}
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {featuredProduct?.camera || t('hero.chipCameraSub')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        {t('hero.chipDisplay')}
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {featuredProduct?.display || t('hero.chipDisplaySub')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                      <BatteryCharging className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        {t('hero.chipBattery')}
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {featuredProduct?.battery || t('hero.chipBatterySub')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title & Buy Row */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">
                      {featuredProduct?.brand || 'Apple'} • {t('hero.StartingAt')}
                    </div>
                    <div className="text-lg sm:text-xl font-['Space_Grotesk'] font-bold text-white">
                      {featuredProduct?.name || 'iPhone 16 Pro Max'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-['Space_Grotesk'] font-extrabold text-cyan-400">
                      ${(featuredProduct?.price || 1199).toLocaleString()}
                    </div>
                    <button
                      onClick={() =>
                        onNavigate(featuredProduct ? `/phones/${featuredProduct.id}` : '/phones')
                      }
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                    >
                      {t('hero.viewDevice')} →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
