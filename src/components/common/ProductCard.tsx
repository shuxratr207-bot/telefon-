import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Layers, Star, Zap, Check } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useCompare } from '../../context/CompareContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import {
  getProductColors,
  getProductStorages,
  getProductRams,
  getProductModels,
  resolveProductVariant,
} from '../../utils/variants.ts';

interface ProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const isFavorite = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const colors = getProductColors(product);
  const storages = getProductStorages(product);
  const rams = getProductRams(product);
  const models = getProductModels(product);

  const currentColor = colors[activeColorIndex] || colors[0];
  const resolved = resolveProductVariant(product, {
    color: currentColor?.name,
    storage: storages[0],
    ram: rams[0],
    model: models[0],
  });
  const displayImage = currentColor?.image || resolved.image || product.images[0];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (resolved.stock <= 0) {
      onNavigate(`/phones/${product.id}`);
      return;
    }
    setIsAdding(true);
    await addToCart(product, {
      color: resolved.color,
      storage: resolved.storage,
      ram: resolved.ram || undefined,
      model: resolved.model || undefined,
      price: resolved.price,
      stock: resolved.stock,
      image: displayImage,
      quantity: 1,
    });
    showToast(
      `${product.name} (${[resolved.color, resolved.storage].filter(Boolean).join(' • ')}) — ${t('product.addedToCart')}`,
      'success'
    );
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
    showToast(`${product.name} — ${t('product.wishlist')}`, 'info');
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
      showToast(`${product.name} — ${t('product.compare')}`, 'info');
    } else {
      const added = addToCompare(product);
      if (added) {
        showToast(`${product.name} — ${t('product.compare')} (max 3)`, 'success');
      } else {
        showToast(`Max 3 smartphones`, 'error');
      }
    }
  };

  const storageSummary = storages.slice(0, 3).join(' / ');
  const ramSummary = rams.length > 0 ? `${rams.slice(0, 2).join(' / ')} RAM` : '';

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onNavigate(`/phones/${product.id}`)}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-2xl bg-[#0d0f17]/90 border border-white/10 hover:border-cyan-500/40 shadow-xl hover:shadow-cyan-500/10 backdrop-blur-xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all"
    >
      {/* Top badges & actions */}
      <div className="p-4 pb-0 flex items-center justify-between z-10">
        <div className="flex flex-wrap gap-1.5">
          {product.discount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-rose-400 text-rose-400" />
              -{product.discount}%
            </span>
          )}
          {product.deal && !product.discount && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-rose-400 text-rose-400" />
              {t('product.hotDeal')}
            </span>
          )}
          {product.bestSeller && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {t('product.bestSeller')}
            </span>
          )}
          {product.newArrival && !product.deal && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {t('product.new')}
            </span>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCompareToggle}
            className={`p-2 rounded-xl transition-all ${
              isCompared
                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={t('product.compare')}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-xl transition-all ${
              isFavorite
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-400 hover:bg-white/10'
            }`}
            title={t('product.wishlist')}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Product Image Area */}
      <div className="relative h-56 sm:h-64 px-4 py-3 flex items-center justify-center overflow-hidden">
        {/* Glow backdrop on hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <motion.img
          key={displayImage}
          src={displayImage}
          alt={product.name}
          initial={{ opacity: 0.8, scale: 0.95 }}
          animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.4 }}
          className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
          loading="lazy"
        />
      </div>

      {/* Details & Specs Area */}
      <div className="p-4 pt-0 space-y-2.5">
        {/* Color Swatches & Count */}
        {colors.length > 0 && (
          <div className="flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-1.5">
              {colors.map((color, idx) => (
                <button
                  key={color.name}
                  onClick={() => setActiveColorIndex(idx)}
                  className={`w-3.5 h-3.5 rounded-full transition-all border border-white/20 ${
                    activeColorIndex === idx
                      ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0d0f17] scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              <span className="text-[10px] text-slate-300 font-medium ml-1 truncate">
                {currentColor?.name}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold shrink-0">
              {colors.length} xil rang
            </span>
          </div>
        )}

        {/* Title and Brand */}
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-cyan-400">
            {product.brand}
          </span>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Compact Variant Summary (Storage / RAM) */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {storageSummary && (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300 font-medium">
              {storageSummary}
            </span>
          )}
          {ramSummary && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
              {ramSummary}
            </span>
          )}
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
            {product.rating}
          </div>
          <span className="text-slate-500">({product.reviews} {t('product.reviews')})</span>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-white tabular-nums">
                ${resolved.price.toLocaleString()}
              </span>
              {resolved.oldPrice && resolved.oldPrice > resolved.price && (
                <span className="text-xs text-slate-500 line-through tabular-nums">
                  ${resolved.oldPrice.toLocaleString()}
                </span>
              )}
            </div>
            {resolved.stock === 0 ? (
              <span className="text-[10px] text-rose-400 font-bold block">
                Tugagan
              </span>
            ) : resolved.stock <= 5 ? (
              <span className="text-[10px] text-amber-400 font-semibold block">
                {resolved.stock} dona qoldi
              </span>
            ) : null}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 && resolved.stock === 0}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              resolved.stock === 0
                ? 'bg-white/5 border border-white/10 text-cyan-400 hover:bg-white/10'
                : isAdding
                ? 'bg-emerald-500 text-black'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white shadow-lg shadow-cyan-500/25'
            }`}
            title={t('product.addToCart')}
          >
            {isAdding ? <Check className="w-4 h-4 stroke-[3]" /> : <ShoppingBag className="w-4 h-4" />}
            <span>{resolved.stock === 0 ? 'Tanlash' : t('product.addToCart')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
