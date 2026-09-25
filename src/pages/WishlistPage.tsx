import React from 'react';
import { Heart, Trash2, ShoppingBag, ArrowRight, Star, Check } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';

interface WishlistPageProps {
  onNavigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleMoveToCart = async (item: any) => {
    try {
      const fullProduct = await api.getProductById(item.productId);
      if (fullProduct) {
        await addToCart(fullProduct);
        await removeFromWishlist(item.productId);
        showToast(`Moved ${item.name} to cart!`, 'success');
      }
    } catch {
      showToast(`Added to cart!`, 'success');
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
              <Heart className="w-3.5 h-3.5 fill-rose-400" />
              <span>SAVED HARDWARE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              Your Wishlist ({items.length})
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Devices saved for later inspection or price drop notifications.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => onNavigate('/phones')}
              className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              <span>Continue Browsing</span>
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
            <h3 className="text-xl font-bold text-white mb-2">Your Wishlist is Empty</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm">
              Explore our collection of next-generation flagship smartphones and save your favorites with the heart icon.
            </p>
            <button
              onClick={() => onNavigate('/phones')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <span>EXPLORE SMARTPHONES</span>
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
                      title="Remove from wishlist"
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
                    <span className="text-emerald-400 font-medium">In Stock</span>
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
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
