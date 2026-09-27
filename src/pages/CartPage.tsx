import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface CartPageProps {
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    deliveryFee,
    total,
    itemCount,
  } = useCart();

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('nav.cart')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              {t('cart.title')} ({itemCount})
            </h1>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('cart.clearCart')}</span>
            </button>
          )}
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="py-24 text-center bg-[#0d0f17] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('cart.emptyTitle')}</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm">
              {t('cart.emptySub')}
            </p>
            <button
              onClick={() => onNavigate('/phones')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
            >
              <span>{t('hero.exploreBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items Column */}
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 rounded-2xl bg-[#0d0f17] border border-white/10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 shadow-xl"
                  >
                    {/* Image */}
                    <div
                      onClick={() => onNavigate(`/phones/${item.productId}`)}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-900 border border-white/5 p-2 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 text-center sm:text-left">
                      <span className="text-[10px] uppercase font-bold text-cyan-400">
                        {item.brand}
                      </span>
                      <h3
                        onClick={() => onNavigate(`/phones/${item.productId}`)}
                        className="text-base sm:text-lg font-bold text-white hover:text-cyan-300 cursor-pointer transition-colors"
                      >
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-300 mt-2">
                        <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10">
                          Rang: <strong className="text-white">{item.color}</strong>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10">
                          Xotira: <strong className="text-white">{item.storage}</strong>
                        </span>
                        {item.ram && (
                          <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10">
                            RAM: <strong className="text-white">{item.ram}</strong>
                          </span>
                        )}
                        {item.model && (
                          <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10">
                            Versiya: <strong className="text-cyan-400">{item.model}</strong>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 mt-2">
                        <span>
                          Narx: <strong className="text-cyan-400 font-mono">${item.price.toLocaleString()}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{t('trust.warrantyTitle')}</span>
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex flex-col items-center sm:items-end justify-between self-stretch gap-4">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors self-end"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-white/15 rounded-xl bg-black/40 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-extrabold text-white">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Bottom Continue Action */}
              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={() => onNavigate('/phones')}
                  className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>{t('cart.continueShopping')}</span>
                </button>
              </div>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-4">
              <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-2xl space-y-5 sticky top-28">
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] pb-3 border-b border-white/10">
                  {t('cart.orderSummary')}
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>{t('cart.subtotal')}</span>
                    <span className="font-semibold text-white">${subtotal.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>{t('cart.discount')} (5%)</span>
                      <span>-${discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>{t('cart.shipping')}</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-cyan-400 font-bold">{t('cart.free')}</span>
                      ) : (
                        `$${deliveryFee}`
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex justify-between text-lg font-extrabold text-white">
                    <span>{t('cart.total')}</span>
                    <span className="text-cyan-400">${total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center gap-2 text-xs text-slate-300">
                  <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{t('detail.deliveryInfo')}</span>
                </div>

                <button
                  onClick={() => onNavigate('/checkout')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('cart.checkoutBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
