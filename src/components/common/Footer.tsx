import React, { useState } from 'react';
import { Send, CheckCircle2, Shield, Truck, RotateCcw, Headphones } from 'lucide-react';
import { useToast } from '../../context/ToastContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      return;
    }
    setSubscribed(true);
    showToast(t('home.newsletterSuccess'), 'success');
    setEmail('');
  };

  return (
    <footer className="bg-[#050608] border-t border-white/10 text-slate-400 pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges / Guarantees Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">{t('trust.warrantyTitle')}</h5>
              <p className="text-xs text-slate-500">100% Original</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">{t('trust.deliveryTitle')}</h5>
              <p className="text-xs text-slate-500">24h Express</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">{t('trust.installmentTitle')}</h5>
              <p className="text-xs text-slate-500">0% — 12 mos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">{t('trust.supportTitle')}</h5>
              <p className="text-xs text-slate-500">24/7</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px]">
                <div className="w-full h-full bg-[#090a0f] rounded-[11px] flex items-center justify-center font-extrabold text-cyan-400 text-lg">
                  N
                </div>
              </div>
              <span className="font-extrabold tracking-wider text-xl font-['Space_Grotesk'] text-white">
                NOVA<span className="text-cyan-400">.</span>MOBILE
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {t('footer.desc')}
            </p>
            <p className="text-xs text-slate-500">{t('footer.address')}</p>
            <p className="text-xs text-slate-500">{t('footer.hours')}</p>
            <div className="pt-2">
              <div className="flex gap-2">
                {['Instagram', 'Telegram', 'YouTube', 'TikTok'].map(platform => (
                  <span
                    key={platform}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-white">{t('footer.shop')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('/phones')} className="hover:text-cyan-400 transition-colors">
                  {t('nav.phones')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/deals')} className="hover:text-cyan-400 transition-colors">
                  {t('nav.deals')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/brands')} className="hover:text-cyan-400 transition-colors">
                  {t('nav.brands')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/phones?sort=newest')} className="hover:text-cyan-400 transition-colors">
                  {t('home.newArrivalsTitle')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/compare')} className="hover:text-cyan-400 transition-colors">
                  {t('nav.compare')}
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-white">{t('footer.support')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-cyan-400 transition-colors">
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/orders')} className="hover:text-cyan-400 transition-colors">
                  {t('nav.orders')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/wishlist')} className="hover:text-cyan-400 transition-colors">
                  {t('nav.wishlist')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/signin')} className="hover:text-cyan-400 transition-colors">
                  {t('nav.signin')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/signup')} className="hover:text-cyan-400 transition-colors">
                  {t('nav.signup')}
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-white">{t('home.newsletterBadge')}</h4>
            <p className="text-xs text-slate-400">
              {t('home.newsletterSub')}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('home.newsletterPlaceholder')}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg flex items-center justify-center hover:brightness-110 transition-all"
                  aria-label="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> {t('home.newsletterSuccess')}
                </span>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NOVA MOBILE. {t('footer.rights')}</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('/signin')} className="hover:text-slate-300 transition-colors">
              {t('nav.signin')}
            </button>
            <button onClick={() => onNavigate('/signup')} className="hover:text-slate-300 transition-colors">
              {t('nav.signup')}
            </button>
            <button onClick={() => onNavigate('/admin/login')} className="text-slate-500 hover:text-indigo-400 transition-colors font-semibold">
              {t('nav.adminPanel')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
