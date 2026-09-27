import React from 'react';
import { ShieldCheck, Truck, Lock, Award, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';

export const TrustSection: React.FC = () => {
  const { t } = useLanguage();

  const trustItems = [
    {
      icon: Award,
      title: t('trust.originalTitle'),
      desc: t('trust.originalDesc'),
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      icon: Truck,
      title: t('trust.deliveryTitle'),
      desc: t('trust.deliveryDesc'),
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      icon: Lock,
      title: t('trust.installmentTitle'),
      desc: t('trust.installmentDesc'),
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: ShieldCheck,
      title: t('trust.warrantyTitle'),
      desc: t('trust.warrantyDesc'),
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      icon: Clock,
      title: t('trust.supportTitle'),
      desc: t('trust.supportDesc'),
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <section className="py-12 border-y border-white/5 bg-[#07080c]/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center sm:items-start text-center sm:text-left p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${item.bg} border flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
