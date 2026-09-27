import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, X, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCompare } from '../context/CompareContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  getProductColors,
  getProductStorages,
  getProductRams,
  getProductModels,
  resolveProductVariant,
} from '../utils/variants.ts';

interface ComparePageProps {
  onNavigate: (path: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { compareProducts, removeFromCompare, clearCompare, addToCompare } = useCompare();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    async function loadAll() {
      try {
        const res = await api.getProducts();
        setAllProducts(res.products);
      } catch (e) {
        console.error('Failed to load products for comparison picker:', e);
      }
    }
    loadAll();
  }, []);

  const handleAddToCart = (product: Product) => {
    const resolved = resolveProductVariant(product, {});
    if (resolved.stock <= 0) {
      onNavigate(`/phones/${product.id}`);
      return;
    }
    addToCart(product, {
      color: resolved.color,
      storage: resolved.storage,
      ram: resolved.ram || undefined,
      model: resolved.model || undefined,
      price: resolved.price,
      stock: resolved.stock,
      image: resolved.image,
      quantity: 1,
    });
    showToast(`${product.name} (${resolved.color} • ${resolved.storage}) — ${t('product.addedToCart')}`, 'success');
  };

  const handleSelectProduct = (product: Product) => {
    const success = addToCompare(product);
    if (success) {
      showToast(`${product.name} — ${t('product.compare')}`, 'success');
      setIsPickerOpen(false);
    } else {
      showToast('Max 3', 'error');
    }
  };

  const compareFields = [
    { label: t('catalog.brand'), getter: (p: Product) => p.brand },
    {
      label: t('compare.price'),
      getter: (p: Product) => {
        if (Array.isArray(p.variants) && p.variants.length > 0) {
          const prices = p.variants.map((v) => Number(v.price)).filter((n) => n > 0);
          if (prices.length > 0) {
            const minP = Math.min(...prices);
            const maxP = Math.max(...prices);
            return minP === maxP
              ? `$${minP.toLocaleString()}`
              : `$${minP.toLocaleString()} – $${maxP.toLocaleString()}`;
          }
        }
        return `$${p.price.toLocaleString()}`;
      },
    },
    {
      label: 'Ranglar',
      getter: (p: Product) =>
        getProductColors(p)
          .map((c) => c.name)
          .join(', ') || 'Standart',
    },
    {
      label: t('detail.specStorage'),
      getter: (p: Product) => getProductStorages(p).join(' / ') || '—',
    },
    {
      label: t('detail.specRam'),
      getter: (p: Product) => getProductRams(p).join(' / ') || '—',
    },
    {
      label: 'Versiyalar',
      getter: (p: Product) => {
        const models = getProductModels(p);
        return models.length > 0 ? models.join(' / ') : 'Standart';
      },
    },
    { label: t('detail.specDisplay'), getter: (p: Product) => p.display },
    { label: t('detail.specRefresh'), getter: (p: Product) => p.refreshRate || '120Hz LTPO' },
    { label: t('detail.specProcessor'), getter: (p: Product) => p.processor },
    { label: t('detail.specMainCam'), getter: (p: Product) => p.camera },
    { label: t('detail.specBattery'), getter: (p: Product) => p.battery },
    { label: t('detail.specCharging'), getter: (p: Product) => p.charging || 'Fast charge' },
    { label: t('detail.specOs'), getter: (p: Product) => p.os || 'Android 16 / iOS 19' },
    { label: t('detail.specWeight'), getter: (p: Product) => p.weight || '215g' },
    { label: t('detail.specDimensions'), getter: (p: Product) => p.dimensions || '162 x 75 x 8.2 mm' },
    { label: t('trust.warrantyTitle'), getter: () => t('hero.stat3Val') },
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>{t('nav.compare')} (MAX 3)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              {t('compare.title')}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {t('compare.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {compareProducts.length < 3 && (
              <button
                onClick={() => setIsPickerOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t('compare.addDevice')} ({compareProducts.length}/3)</span>
              </button>
            )}
            {compareProducts.length > 0 && (
              <button
                onClick={clearCompare}
                className="p-2.5 rounded-xl border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                title={t('compare.clearAll')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {compareProducts.length === 0 ? (
          <div className="py-24 text-center bg-[#0d0f17] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-500">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{t('compare.emptyTitle')}</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              {t('compare.emptySub')}
            </p>
            <button
              onClick={() => setIsPickerOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs uppercase shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('compare.browsePhones')}</span>
            </button>
          </div>
        ) : (
          /* Comparison Table */
          <div className="bg-[#0d0f17] border border-white/10 rounded-3xl overflow-x-auto shadow-2xl">
            <table className="w-full min-w-[700px] border-collapse text-left">
              {/* Product Cards Row */}
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="p-6 w-1/4 align-top text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t('compare.parameter')}
                  </th>
                  {compareProducts.map(prod => (
                    <th key={prod.id} className="p-6 w-1/4 align-top">
                      <div className="relative space-y-3">
                        <button
                          onClick={() => removeFromCompare(prod.id)}
                          className="absolute -top-2 -right-2 p-1 text-slate-500 hover:text-rose-400 rounded-full hover:bg-white/5 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="h-40 flex items-center justify-center p-2 bg-slate-900 rounded-2xl border border-white/5">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-cyan-400">
                            {prod.brand}
                          </span>
                          <h4 className="text-base font-bold text-white truncate">{prod.name}</h4>
                          <p className="text-lg font-extrabold text-cyan-400 mt-1">
                            ${prod.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => onNavigate(`/phones/${prod.id}`)}
                            className="flex-1 py-2 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold text-center transition-all"
                          >
                            {t('product.viewDetails')}
                          </button>
                          <button
                            onClick={() => handleAddToCart(prod)}
                            className="py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center justify-center"
                            title={t('product.addToCart')}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}

                  {/* Placeholder if fewer than 3 */}
                  {[...Array(3 - compareProducts.length)].map((_, i) => (
                    <th key={i} className="p-6 w-1/4 align-middle text-center">
                      <div
                        onClick={() => setIsPickerOpen(true)}
                        className="h-64 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-4 hover:border-cyan-500/40 hover:bg-white/[0.02] cursor-pointer transition-all gap-2 text-slate-500 hover:text-cyan-400"
                      >
                        <Plus className="w-8 h-8" />
                        <span className="text-xs font-bold uppercase">{t('compare.addDevice')}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Specs Rows */}
              <tbody className="divide-y divide-white/5 text-sm">
                {compareFields.map((field, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6 font-semibold text-slate-400 bg-black/20 text-xs uppercase tracking-wider">
                      {field.label}
                    </td>
                    {compareProducts.map(prod => (
                      <td key={prod.id} className="p-4 text-slate-200">
                        {field.getter(prod)}
                      </td>
                    ))}
                    {[...Array(3 - compareProducts.length)].map((_, i) => (
                      <td key={i} className="p-4 text-slate-600 text-center">
                        —
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Smartphone Picker Modal */}
      <AnimatePresence>
        {isPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPickerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#0d0f17] border border-cyan-500/20 rounded-3xl shadow-2xl p-6 z-10 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white">{t('compare.addDevice')}</h3>
                  <p className="text-xs text-slate-400">{t('compare.subtitle')}</p>
                </div>
                <button
                  onClick={() => setIsPickerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto py-4 space-y-2 flex-1">
                {allProducts.map(prod => {
                  const alreadyIn = compareProducts.some(p => p.id === prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => !alreadyIn && handleSelectProduct(prod)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        alreadyIn
                          ? 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
                          : 'border-white/10 hover:border-cyan-500/40 hover:bg-white/5 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-lg p-1 border border-white/10 overflow-hidden flex items-center justify-center">
                          <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-cyan-400">
                            {prod.brand}
                          </span>
                          <h4 className="text-sm font-semibold text-white">{prod.name}</h4>
                          <span className="text-xs text-slate-400 font-mono">${prod.price}</span>
                        </div>
                      </div>

                      <div>
                        {alreadyIn ? (
                          <span className="text-xs text-slate-500 font-semibold">✓</span>
                        ) : (
                          <button className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400">
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
