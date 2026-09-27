import React, { useState } from 'react';
import { Heart, Trash2, ShoppingBag, ArrowRight, Star, X, Check } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Product } from '../types/index.ts';
import {
  getProductColors,
  getProductStorages,
  getProductRams,
  getProductModels,
  resolveProductVariant,
  normalizeOption,
} from '../utils/variants.ts';

interface WishlistPageProps {
  onNavigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Variant Picker Modal State when moving from Wishlist to Cart
  const [pickerProduct, setPickerProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedRam, setSelectedRam] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const handleMoveToCart = async (item: any) => {
    try {
      const fullProduct = await api.getProductById(item.productId);
      if (fullProduct) {
        const colors = getProductColors(fullProduct);
        const storages = getProductStorages(fullProduct);
        const rams = getProductRams(fullProduct);
        const models = getProductModels(fullProduct);

        const hasSelectableVariants =
          colors.length > 0 || storages.length > 0 || rams.length > 0 || models.length > 0;

        if (hasSelectableVariants) {
          setSelectedColor(colors[0]?.name || '');
          setSelectedStorage(storages[0] || '');
          setSelectedRam(rams[0] || '');
          setSelectedModel(models[0] || '');
          setPickerProduct(fullProduct);
          return;
        }

        await addToCart(fullProduct);
        await removeFromWishlist(item.productId);
        showToast(`${item.name} — ${t('product.addedToCart')}`, 'success');
      }
    } catch {
      showToast(t('admin.state.error'), 'error');
    }
  };

  const handleConfirmVariantToCart = async () => {
    if (!pickerProduct) return;
    const resolved = resolveProductVariant(pickerProduct, {
      color: selectedColor,
      storage: selectedStorage,
      ram: selectedRam,
      model: selectedModel,
    });
    if (resolved.stock <= 0) {
      showToast('Tanlangan variant tugagan!', 'error');
      return;
    }
    await addToCart(pickerProduct, {
      color: selectedColor,
      storage: selectedStorage,
      ram: selectedRam || undefined,
      model: selectedModel || undefined,
      price: resolved.price,
      stock: resolved.stock,
      image: resolved.image,
      quantity: 1,
    });
    await removeFromWishlist(pickerProduct.id);
    const summary = [selectedColor, selectedStorage, selectedRam, selectedModel]
      .filter(Boolean)
      .join(' • ');
    showToast(`${pickerProduct.name} (${summary}) — ${t('product.addedToCart')}`, 'success');
    setPickerProduct(null);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
              <Heart className="w-3.5 h-3.5 fill-rose-400" />
              <span>{t('nav.wishlist')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              {t('wishlist.title')} ({items.length})
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {t('wishlist.subtitle')}
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => onNavigate('/phones')}
              className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              <span>{t('cart.continueShopping')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="py-24 text-center bg-[#0d0f17] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('wishlist.emptyTitle')}</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm">
              {t('wishlist.emptySub')}
            </p>
            <button
              onClick={() => onNavigate('/phones')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <span>{t('hero.exploreBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-[#0d0f17] border border-white/10 hover:border-cyan-500/40 p-5 shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold text-cyan-400">
                      {item.brand}
                    </span>
                    <button
                      onClick={() => removeFromWishlist(item.productId)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div
                    onClick={() => onNavigate(`/phones/${item.productId}`)}
                    className="h-48 rounded-xl bg-slate-900 border border-white/5 p-4 flex items-center justify-center mb-4 cursor-pointer overflow-hidden"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h3
                    onClick={() => onNavigate(`/phones/${item.productId}`)}
                    className="font-bold text-base text-white hover:text-cyan-300 cursor-pointer truncate transition-colors"
                  >
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-amber-400 mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-semibold text-white">{item.rating}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-medium">{t('product.inStock')}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-lg font-extrabold text-white">
                      ${item.price.toLocaleString()}
                    </span>
                    {item.oldPrice && item.oldPrice > item.price && (
                      <span className="text-xs text-slate-500 line-through ml-2">
                        ${item.oldPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t('product.addToCart')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variant Selection Modal when moving from Wishlist to Cart */}
      {pickerProduct && (() => {
        const colors = getProductColors(pickerProduct);
        const storages = getProductStorages(pickerProduct);
        const rams = getProductRams(pickerProduct);
        const models = getProductModels(pickerProduct);
        const resolved = resolveProductVariant(pickerProduct, {
          color: selectedColor,
          storage: selectedStorage,
          ram: selectedRam,
          model: selectedModel,
        });
        const isOutOfStock = resolved.stock <= 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setPickerProduct(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <div className="relative w-full max-w-lg bg-[#0d0f17] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Variantni tanlang
                  </span>
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                    {pickerProduct.name}
                  </h3>
                </div>
                <button
                  onClick={() => setPickerProduct(null)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selected Variant Preview */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <div className="w-20 h-20 rounded-xl bg-slate-900 border border-white/5 p-2 flex items-center justify-center shrink-0">
                  <img
                    src={resolved.image}
                    alt={pickerProduct.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-extrabold text-cyan-400 tabular-nums">
                    ${resolved.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5 truncate">
                    {[selectedColor, selectedStorage, selectedRam && `${selectedRam} RAM`, selectedModel]
                      .filter(Boolean)
                      .join(' • ')}
                  </div>
                  <div className="mt-1">
                    {isOutOfStock ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Tugagan
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Omborda: {resolved.stock} dona
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Color Selector */}
              {colors.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Rang: <span className="text-white">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => {
                      const active = normalizeOption(selectedColor) === normalizeOption(c.name);
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                            active
                              ? 'bg-cyan-500/15 border-cyan-400 text-white'
                              : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Storage Selector */}
              {storages.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Xotira: <span className="text-cyan-400">{selectedStorage}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {storages.map((st) => {
                      const active = normalizeOption(selectedStorage) === normalizeOption(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setSelectedStorage(st)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            active
                              ? 'bg-cyan-500/15 border-cyan-400 text-white'
                              : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* RAM Selector */}
              {rams.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Tezkor xotira (RAM): <span className="text-indigo-400">{selectedRam}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {rams.map((rm) => {
                      const active = normalizeOption(selectedRam) === normalizeOption(rm);
                      return (
                        <button
                          key={rm}
                          type="button"
                          onClick={() => setSelectedRam(rm)}
                          className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all ${
                            active
                              ? 'bg-indigo-500/20 border-indigo-400 text-white'
                              : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          {rm}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Model / Version Selector */}
              {models.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Versiya: <span className="text-purple-400">{selectedModel}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {models.map((md) => {
                      const active = normalizeOption(selectedModel) === normalizeOption(md);
                      return (
                        <button
                          key={md}
                          type="button"
                          onClick={() => setSelectedModel(md)}
                          className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all ${
                            active
                              ? 'bg-purple-500/20 border-purple-400 text-white'
                              : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          {md}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const id = pickerProduct.id;
                    setPickerProduct(null);
                    onNavigate(`/phones/${id}`);
                  }}
                  className="px-4 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-all"
                >
                  Batafsil sahifa
                </button>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleConfirmVariantToCart}
                  className={`flex-1 py-3 px-5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isOutOfStock
                      ? 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white shadow-lg shadow-cyan-500/25'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Tugagan' : t('product.addToCart')}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
