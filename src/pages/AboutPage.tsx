import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Truck, Lock, Award, Headphones, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const stats = [
    { value: '10K+', label: t('nav.vipCustomer'), desc: t('trust.originalDesc') },
    { value: '100%', label: t('trust.originalTitle'), desc: t('trust.warrantyDesc') },
    { value: '0%', label: t('trust.installmentTitle'), desc: t('trust.installmentDesc') },
    { value: '24/7', label: t('trust.supportTitle'), desc: t('trust.supportDesc') },
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('about.badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-['Space_Grotesk'] leading-tight">
            {t('about.title')}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Animated Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 sm:p-8 rounded-3xl bg-[#0d0f17] border border-white/10 text-center shadow-xl hover:border-cyan-500/30 transition-all"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Space_Grotesk'] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                {stat.value}
              </div>
              <h4 className="text-sm font-bold text-white mt-2">{stat.label}</h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Core Pillars */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Space_Grotesk']">
              {t('about.missionTitle')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{t('about.missionDesc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-3">
              <Award className="w-8 h-8 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">{t('trust.originalTitle')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('trust.originalDesc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-3">
              <Truck className="w-8 h-8 text-blue-400" />
              <h3 className="text-lg font-bold text-white">{t('trust.deliveryTitle')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('trust.deliveryDesc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-3">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">{t('trust.warrantyTitle')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('trust.warrantyDesc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-3">
              <Lock className="w-8 h-8 text-violet-400" />
              <h3 className="text-lg font-bold text-white">{t('trust.installmentTitle')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('trust.installmentDesc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-3 md:col-span-2">
              <Headphones className="w-8 h-8 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">{t('trust.supportTitle')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('trust.supportDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-10 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-indigo-950/40 border border-cyan-500/30 text-center space-y-4 shadow-2xl">
          <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
            {t('hero.title1')} {t('hero.title2')}
          </h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            {t('hero.subtitle')}
          </p>
          <button
            onClick={() => onNavigate('/phones')}
            className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/20"
          >
            {t('hero.exploreBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
