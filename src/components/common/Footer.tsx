import React, { useState } from 'react';
import { Send, CheckCircle2, Shield, Truck, RotateCcw, Headphones, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext.tsx';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Subscribed to NOVA VIP announcements!', 'success');
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
              <h5 className="text-sm font-bold text-white">Official Warranty</h5>
              <p className="text-xs text-slate-500">2-Year manufacturer guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">Express Delivery</h5>
              <p className="text-xs text-slate-500">Free delivery on orders over $500</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">Easy Returns</h5>
              <p className="text-xs text-slate-500">14-Day hassle-free return window</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">24/7 Concierge</h5>
              <p className="text-xs text-slate-500">Direct engineering technical support</p>
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
              NOVA MOBILE is the world premiere smartphone marketplace specializing in next-generation flagship hardware, computational AI, and aerospace craftsmanship.
            </p>
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Connect With Us</p>
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
            <h4 className="text-xs uppercase tracking-widest font-bold text-white">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('/phones')} className="hover:text-cyan-400 transition-colors">
                  All Smartphones
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/deals')} className="hover:text-cyan-400 transition-colors">
                  Flash Deals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/brands')} className="hover:text-cyan-400 transition-colors">
                  Shop by Brand
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/phones?sort=newest')} className="hover:text-cyan-400 transition-colors">
                  New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/compare')} className="hover:text-cyan-400 transition-colors">
                  Compare Specs
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-white">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-cyan-400 transition-colors">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-cyan-400 transition-colors">
                  Delivery Information
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-cyan-400 transition-colors">
                  Official Warranty
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-cyan-400 transition-colors">
                  Returns & Replacements
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-cyan-400 transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-white">Stay Ahead</h4>
            <p className="text-xs text-slate-400">
              GET THE LATEST TECHNOLOGY. Subscribe for early access to flagship launches, insider discounts and keynote recaps.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email..."
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
                  <CheckCircle2 className="w-3 h-3" /> VIP notifications enabled.
                </span>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NOVA MOBILE Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('/about')} className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => onNavigate('/about')} className="hover:text-slate-300 transition-colors">
              Terms of Service
            </button>
            <button onClick={() => onNavigate('/admin/login')} className="text-slate-600 hover:text-indigo-400 transition-colors">
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
