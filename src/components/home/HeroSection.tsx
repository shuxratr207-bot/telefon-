import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Zap, Shield, Eye, Flame, Cpu, Battery, Layers } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (path: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Ambient Glows & Tech Grid */}
      <div className="absolute inset-0 bg-[#090a0f] pointer-events-none">
        {/* Subtle radial tech gradient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/15 to-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
        {/* Subtle dot matrix overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            {/* Top Pill / Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-inner"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>THE 2026 FLAGSHIP SHOWCASE IS LIVE</span>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-['Space_Grotesk'] leading-[1.08]">
                THE FUTURE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  IN YOUR HANDS.
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed"
            >
              Discover powerful smartphones, intelligent technology and next-generation design in one premium marketplace.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <button
                onClick={() => onNavigate('/phones')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-sm tracking-wider uppercase shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-3 group"
              >
                <span>SHOP SMARTPHONES</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('/deals')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-100 font-semibold text-sm tracking-wider uppercase backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span>EXPLORE DEALS</span>
              </button>
            </motion.div>

            {/* Metric Highlights Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 max-w-md mx-auto lg:mx-0"
            >
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-white">20+</p>
                <p className="text-xs text-slate-400">Flagships in Stock</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-cyan-400">100%</p>
                <p className="text-xs text-slate-400">Official Warranty</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-indigo-400">24h</p>
                <p className="text-xs text-slate-400">Fast Dispatch</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Device Visual & Floating Feature Badges */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Ambient Back Glow */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Flagship Device Stage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="relative z-10 w-full max-w-[340px] sm:max-w-[400px]"
            >
              {/* Floating Hero Phone Visual */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  rotateZ: [0, 0.5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative rounded-[40px] p-3 bg-gradient-to-b from-white/20 via-white/5 to-transparent border border-white/20 shadow-2xl backdrop-blur-2xl"
              >
                <div className="rounded-[32px] overflow-hidden bg-[#000] border border-white/10 relative">
                  <img
                    src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80"
                    alt="iPhone 17 Pro Max Cosmic Titanium"
                    className="w-full h-auto object-cover object-center max-h-[480px] drop-shadow-2xl"
                  />

                  {/* Glass overlay with flagship card info */}
                  <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400">
                        Apple Flagship
                      </span>
                      <h4 className="text-sm font-bold text-white">iPhone 17 Pro Max</h4>
                      <p className="text-xs text-slate-300">Grade 5 Aerospace Titanium</p>
                    </div>
                    <button
                      onClick={() => onNavigate('/phones/prod-iphone-17-promax')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Floating Tech Badges (Required by brief) */}
              {/* 1. AI POWER */}
              <motion.div
                animate={{ y: [0, -8, 0], x: [0, -4, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-6 sm:-left-10 px-3.5 py-2 rounded-xl bg-[#0d0f17]/90 border border-cyan-500/30 backdrop-blur-md shadow-xl flex items-center gap-2 text-xs font-bold text-cyan-300 z-20"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>AI POWER</span>
              </motion.div>

              {/* 2. PRO CAMERA */}
              <motion.div
                animate={{ y: [0, 8, 0], x: [0, 4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-28 -right-4 sm:-right-8 px-3.5 py-2 rounded-xl bg-[#0d0f17]/90 border border-indigo-500/30 backdrop-blur-md shadow-xl flex items-center gap-2 text-xs font-bold text-indigo-300 z-20"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>PRO CAMERA</span>
              </motion.div>

              {/* 3. 120Hz DISPLAY */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-28 -left-4 sm:-left-8 px-3.5 py-2 rounded-xl bg-[#0d0f17]/90 border border-blue-500/30 backdrop-blur-md shadow-xl flex items-center gap-2 text-xs font-bold text-blue-300 z-20"
              >
                <Layers className="w-4 h-4 text-blue-400" />
                <span>120Hz DISPLAY</span>
              </motion.div>

              {/* 4. ALL-DAY BATTERY */}
              <motion.div
                animate={{ y: [0, 7, 0], x: [0, -3, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-4 -right-4 sm:-right-6 px-3.5 py-2 rounded-xl bg-[#0d0f17]/90 border border-emerald-500/30 backdrop-blur-md shadow-xl flex items-center gap-2 text-xs font-bold text-emerald-300 z-20"
              >
                <Battery className="w-4 h-4 text-emerald-400" />
                <span>ALL-DAY BATTERY</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
