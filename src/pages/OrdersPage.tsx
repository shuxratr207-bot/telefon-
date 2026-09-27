import React, { useState, useEffect } from 'react';
import { Package, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface OrdersPageProps {
  onNavigate: (path: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOrders(user?.email);
      setOrders(res.orders);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Processing':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Shipped':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Cancelled':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-6 border-b border-white/10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <Package className="w-3.5 h-3.5" />
              <span>{t('nav.orders')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              {t('orders.title')} ({orders.length})
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {t('orders.subtitle')}
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('admin.btn.update')}</span>
          </button>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">{t('admin.state.loading')}</div>
        ) : orders.length === 0 ? (
          <div className="py-24 text-center bg-[#0d0f17] border border-white/10 rounded-3xl p-8 max-w-md mx-auto">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-500" />
            <h3 className="text-lg font-bold text-white mb-1">{t('orders.emptyTitle')}</h3>
            <p className="text-xs text-slate-400 mb-6">{t('orders.emptySub')}</p>
            <button
              onClick={() => onNavigate('/phones')}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs"
            >
              {t('hero.exploreBtn')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="p-6 rounded-2xl bg-[#0d0f17] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-cyan-500/30 transition-all"
              >
                {/* Left: Number, Date, Status */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base text-white">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {t(`admin.status.${order.status}`, order.status)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {t('admin.orders.customer')}: <strong className="text-slate-200">{order.customer.fullName}</strong> ({order.customer.city}, {order.customer.region})
                  </p>
                </div>

                {/* Center: Device Avatars */}
                <div className="flex items-center gap-2">
                  {order.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="w-14 h-14 bg-slate-900 border border-white/10 rounded-xl p-1.5 flex items-center justify-center shrink-0"
                      title={`${it.name} (${it.color})`}
                    >
                      <img src={it.image} alt={it.name} className="w-full h-full object-contain" />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-xs text-slate-400 font-bold">+{order.items.length - 3}</span>
                  )}
                </div>

                {/* Right: Total, Payment Method & Details button */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 block uppercase tracking-wider">
                      {order.paymentMethod === 'apple_pay'
                        ? 'Payme / Click'
                        : order.paymentMethod === 'cod'
                        ? 'Naqd pul'
                        : 'Bank kartasi'}
                    </span>
                    <span className="text-lg font-extrabold text-cyan-400">
                      ${order.total.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
                  >
                    <span>{t('admin.orders.details')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <div className="relative w-full max-w-2xl bg-[#0d0f17] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[85vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                    {t('admin.orders.orderNumber')} #{selectedOrder.orderNumber}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {t('admin.orders.status')}: <strong className="text-cyan-400">{t(`admin.status.${selectedOrder.status}`, selectedOrder.status)}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 hover:text-white"
                >
                  {t('admin.btn.close')}
                </button>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  {t('admin.orders.items')}
                </h4>
                <div className="divide-y divide-white/5 bg-black/30 rounded-2xl p-4 border border-white/5">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={it.image} alt={it.productName || it.name} className="w-12 h-12 object-contain" />
                        <div>
                          <p className="text-sm font-bold text-white">{it.productName || it.name}</p>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300 mt-1">
                            {it.color && (
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                Rang: <strong className="text-white">{it.color}</strong>
                              </span>
                            )}
                            {it.storage && (
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                Xotira: <strong className="text-white">{it.storage}</strong>
                              </span>
                            )}
                            {it.ram && (
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                Tezkor xotira: <strong className="text-white">{it.ram}</strong>
                              </span>
                            )}
                            {it.model && (
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                Versiya: <strong className="text-cyan-400">{it.model}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right tabular-nums">
                        <div className="text-xs text-slate-400">
                          ${it.price.toLocaleString()} × {it.quantity} {t('admin.products.units')}
                        </div>
                        <span className="text-sm font-bold text-cyan-400">
                          ${(it.price * it.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery address & Customer info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="font-bold text-slate-400 block mb-1">{t('admin.orders.delivery')}</span>
                  <p className="text-white font-semibold">{selectedOrder.customer.fullName}</p>
                  <p className="text-slate-300">{selectedOrder.customer.address}</p>
                  <p className="text-slate-300">{selectedOrder.customer.city}, {selectedOrder.customer.region}</p>
                  <p className="text-slate-400">{selectedOrder.customer.phone}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="font-bold text-slate-400 block mb-1">{t('admin.orders.payment')}</span>
                  <div className="flex justify-between text-slate-300">
                    <span>{t('cart.subtotal')}:</span>
                    <span>${selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>{t('cart.discount')}:</span>
                      <span>-${selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>{t('cart.shipping')}:</span>
                    <span>{selectedOrder.deliveryFee === 0 ? t('cart.free') : `$${selectedOrder.deliveryFee}`}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white text-sm">
                    <span>{t('cart.total')}:</span>
                    <span className="text-cyan-400">${selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
