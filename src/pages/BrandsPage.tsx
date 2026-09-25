import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Smartphone } from 'lucide-react';
import { Brand, Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';

interface BrandsPageProps {
  onNavigate: (path: string) => void;
}

export const BrandsPage: React.FC<BrandsPageProps> = ({ onNavigate }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('Apple');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [brandRes, prodRes] = await Promise.all([api.getBrands(), api.getProducts()]);
        setBrands(brandRes.brands);
        setProducts(prodRes.products);
        if (brandRes.brands.length > 0) {
          setSelectedBrand(brandRes.brands[0].name);
        }
      } catch (e) {
        console.error('Failed to load brands:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const activeBrandData = brands.find(b => b.name === selectedBrand) || brands[0];
  const brandProducts = products.filter(
    p => p.brand.toLowerCase() === selectedBrand.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GLOBAL HARDWARE LEADERS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Space_Grotesk']">
            Flagship Brand Hub
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Explore authentic flagship smartphones categorized by their visionary creators.
          </p>
        </div>

        {/* Brand Selector Badges Strip */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-12">
          {brands.map(brand => {
            const isSelected = brand.name === selectedBrand;
            return (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand.name)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/25 font-bold scale-105'
                    : 'bg-[#0d0f17] border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                }`}
              >
                <span>{brand.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {products.filter(p => p.brand.toLowerCase() === brand.name.toLowerCase()).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Brand Feature Spotlight */}
        {activeBrandData && (
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0d0f17] via-[#101322] to-[#0d0f17] border border-cyan-500/20 shadow-2xl mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-white/10 p-3 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={activeBrandData.logo}
                  alt={activeBrandData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-cyan-400">
                  Featured Ecosystem
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {activeBrandData.name} Smartphones
                </h2>
                <p className="text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
                  {activeBrandData.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate(`/phones?brand=${activeBrandData.name}`)}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold text-xs uppercase tracking-wider shrink-0 transition-all flex items-center gap-2"
            >
              <span>View In Catalog</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        )}

        {/* Brand Devices Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
            Available {selectedBrand} Models ({brandProducts.length})
          </h3>
          <span className="text-xs text-slate-400">100% Guaranteed Authentic</span>
        </div>

        {brandProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            No devices currently in stock for {selectedBrand}. Check back shortly!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brandProducts.map(product => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
