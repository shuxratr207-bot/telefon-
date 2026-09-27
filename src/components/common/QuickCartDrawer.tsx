import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface QuickCartDrawerProps {
  onNavigate: (path: string) => void;
}

export const QuickCartDrawer: React.FC<QuickCartDrawerProps> = ({ onNavigate }) => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal, discount, deliveryFee, total, itemCount } = useCart();
  const { t } = useLanguage();

  const handleCheckout = () => {
    setIsCartOpen(false);
    onNavigate('/checkout');
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    onNavigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-[#0d0f17] border-l border-white/10 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-lg text-white font-['Space_Grotesk']">
                    {t('cart.title')} ({itemCount})
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 divide-y divide-white/5 space-y-4">
                {items.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-500">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="text-base font-semibold text-white mb-1">{t('cart.emptyTitle')}</p>
                    <p className="text-xs text-slate-400 max-w-xs mb-6">
                      {t('cart.emptySub')}
                    </p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        onNavigate('/phones');
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all uppercase"
                    >
                      {t('hero.exploreBtn')}
                    </button>
                  </div>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                      {/* Product thumbnail */}
                      <div className="w-20 h-20 bg-slate-900 border border-white/10 rounded-xl overflow-hidden p-2 shrink-0 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
                            <div>
                              Rang: <span className="text-slate-200 font-semibold">{item.color}</span> • Xotira:{' '}
                              <span className="text-slate-200 font-semibold">{item.storage}</span>
                            </div>
                            {(item.ram || item.model) && (
                              <div>
                                {item.ram && (
                                  <span>
                                    RAM: <span className="text-slate-200 font-semibold">{item.ram}</span>
                                  </span>
                                )}
                                {item.ram && item.model && ' • '}
                                {item.model && (
                                  <span>
                                    Versiya: <span className="text-cyan-400 font-semibold">{item.model}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-white/10 rounded-lg bg-black/30 overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-semibold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-white">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer with Calculation */}
              {items.length > 0 && (
                <div className="p-5 border-t border-white/10 bg-black/40 space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>{t('cart.subtotal')}</span>
                      <span className="text-white">${subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>{t('cart.discount')} (5%)</span>
                        <span>-${discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>{t('cart.shipping')}</span>
                      <span>{deliveryFee === 0 ? <span className="text-cyan-400 font-semibold">{t('cart.free')}</span> : `$${deliveryFee}`}</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between text-base font-bold text-white">
                      <span>{t('cart.total')}</span>
                      <span className="text-cyan-400">${total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-cyan-950/20 border border-cyan-500/20 p-2 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{t('detail.deliveryInfo')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleViewCart}
                      className="py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all text-center uppercase"
                    >
                      {t('cart.viewCart')}
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 uppercase"
                    >
                      {t('cart.checkoutBtn')} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
