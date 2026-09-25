import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Brand } from '../../types/index.ts';

interface ShopByBrandSectionProps {
  brands: Brand[];
  onNavigate: (path: string) => void;
}

export const ShopByBrandSection: React.FC<ShopByBrandSectionProps> = ({ brands, onNavigate }) => {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3 h-3" />
              <span>OFFICIAL FLAGSHIP PARTNERS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              Shop by Brand
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-lg">
              Explore authentic smartphones engineered by the world&apos;s leading hardware innovators.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/brands')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View All Brands</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {brands.map((brand, idx) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => onNavigate(`/phones?brand=${brand.name}`)}
              className="group relative rounded-2xl bg-[#0d0f17]/80 border border-white/10 hover:border-cyan-500/40 p-5 cursor-pointer backdrop-blur-xl transition-all shadow-lg overflow-hidden flex flex-col justify-between"
            >
              {/* Glow background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                  {brand.productCount || 0} Models
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {brand.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {brand.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-cyan-400 relative z-10 transition-colors">
                <span>Explore catalog</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
