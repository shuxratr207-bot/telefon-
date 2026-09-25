import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Layers, Star, Zap, Cpu, Check } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useCompare } from '../../context/CompareContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

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

  const isFavorite = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  // Current image based on active color or fallback to first
  const currentColor = product.colors?.[activeColorIndex];
  const displayImage = currentColor?.image || product.images[0];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    await addToCart(product, {
      color: currentColor?.name,
      storage: product.storage[0],
    });
    showToast(`Added ${product.name} to cart!`, 'success');
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
    showToast(
      isFavorite ? `Removed ${product.name} from wishlist` : `Added ${product.name} to wishlist`,
      'info'
    );
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
      showToast(`Removed from compare list`, 'info');
    } else {
      const added = addToCompare(product);
      if (added) {
        showToast(`Added ${product.name} to compare (max 3)`, 'success');
      } else {
        showToast(`Comparison list full (maximum 3 phones). Remove one first!`, 'error');
      }
    }
  };

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
          {product.deal && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-rose-400 text-rose-400" />
              Deal
            </span>
          )}
          {product.bestSeller && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Best Seller
            </span>
          )}
          {product.newArrival && !product.deal && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              New
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
            title="Compare smartphone"
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
            title="Add to wishlist"
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
      <div className="p-4 pt-0 space-y-3">
        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            {product.colors.map((color, idx) => (
              <button
                key={color.name}
                onClick={() => setActiveColorIndex(idx)}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  activeColorIndex === idx
                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0d0f17] scale-110'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            <span className="text-[10px] text-slate-400 ml-1 truncate">
              {currentColor?.name}
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

        {/* Mini Spec Badges */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 truncate">
            <Cpu className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{product.processor.split('(')[0].trim()}</span>
          </span>
          <span>•</span>
          <span className="shrink-0">{product.storage[0]}</span>
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
            {product.rating}
          </div>
          <span className="text-slate-500">({product.reviews} reviews)</span>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-white">
                ${product.price.toLocaleString()}
              </span>
              {product.oldPrice > product.price && (
                <span className="text-xs text-slate-500 line-through">
                  ${product.oldPrice.toLocaleString()}
                </span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] text-rose-400 font-semibold block">
                Only {product.stock} left in stock
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-xl font-bold transition-all flex items-center justify-center shrink-0 ${
              product.stock === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isAdding
                ? 'bg-emerald-500 text-black'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white shadow-lg shadow-cyan-500/25'
            }`}
            title="Add to Cart"
          >
            {isAdding ? <Check className="w-4 h-4 stroke-[3]" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
