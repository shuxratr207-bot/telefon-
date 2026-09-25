import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Truck, Lock, Award, Headphones, Sparkles, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const stats = [
    { value: '10K+', label: 'Global Customers', desc: 'Trusting NOVA for flagship devices' },
    { value: '500+', label: 'Products & Accessories', desc: '100% verified authentic hardware' },
    { value: '98%', label: 'Satisfaction Rate', desc: 'Direct concierge hardware support' },
    { value: '24/7', label: 'Engineering Support', desc: 'Uninterrupted technical advisors' },
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE NOVA MOBILE CHARTER</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-['Space_Grotesk'] leading-tight">
            Pioneering the Next Generation of Mobile Tech.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Founded with a singular pursuit: to connect hardware enthusiasts with the bleeding edge of smartphone innovation, computational silicon, and aerospace titanium craftsmanship.
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
              <p className="text-xs text-slate-400 mt-1">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Core Pillars */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Space_Grotesk']">
              Our Five Guarantees
            </h2>
            <p className="text-xs text-slate-400 mt-1">Why premier customers choose NOVA MOBILE</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-3">
              <Award className="w-8 h-8 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Original Products</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every smartphone ships factory sealed with serial verification directly from Apple, Samsung, Google, Xiaomi, and partner headquarters.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-3">
              <Truck className="w-8 h-8 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Fast Priority Delivery</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Insured express air logistics dispatched within 24 hours. Enjoy free tracked shipping on all orders over $500.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-3">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Official Warranty</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                24 months of full manufacturer coverage supported by direct repair facilitation and instant diagnostics.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-3">
              <Lock className="w-8 h-8 text-violet-400" />
              <h3 className="text-lg font-bold text-white">Secure Checkout</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                State-of-the-art encrypted processing keeping your details confidential and protected.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-3 md:col-span-2">
              <Headphones className="w-8 h-8 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">24/7 Dedicated Customer Concierge</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our support team is staffed by actual hardware enthusiasts who know camera optics, custom silicon, and firmware updates inside and out.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-10 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-indigo-950/40 border border-cyan-500/30 text-center space-y-4 shadow-2xl">
          <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
            Experience the Future of Mobile Today
          </h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Explore our curated catalog of authentic 2026 flagships and find your next daily driver.
          </p>
          <button
            onClick={() => onNavigate('/phones')}
            className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/20"
          >
            DISCOVER THE CATALOG
          </button>
        </div>
      </div>
    </div>
  );
};
