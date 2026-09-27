import React, { useState, useEffect } from 'react';
import { Eye, Search, RefreshCw, X } from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AdminOrdersPageProps {
  onNavigate: (route: string) => void;
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { showToast } = useToast();

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOrders();
      setOrders(res.orders);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => (o.id === orderId || o.orderNumber === orderId ? updated : o)));
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
        setSelectedOrder(updated);
      }
      showToast(`#${updated.orderNumber} — ${t(`admin.status.${newStatus}`, newStatus)}`, 'success');
    } catch (err: any) {
      showToast(err.message || t('admin.state.error'), 'error');
    }
  };

  const statusOptions: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {t('admin.orders.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('admin.orders.subtitle')}
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('admin.btn.update')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.orders.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">{t('admin.orders.status')}:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all" className="bg-[#0d0f17]">{t('admin.orders.allStatuses')}</option>
            {statusOptions.map(st => (
              <option key={st} value={st} className="bg-[#0d0f17]">
                {t(`admin.status.${st}`, st)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-3xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="p-4 pl-6">{t('admin.orders.orderNumber')}</th>
              <th className="p-4">{t('admin.orders.customer')}</th>
              <th className="p-4">{t('admin.orders.date')}</th>
              <th className="p-4">{t('admin.orders.items')}</th>
              <th className="p-4">{t('admin.orders.total')}</th>
              <th className="p-4">{t('admin.orders.payment')}</th>
              <th className="p-4">{t('admin.orders.delivery')}</th>
              <th className="p-4">{t('admin.orders.status')}</th>
              <th className="p-4 pr-6 text-right">{t('admin.orders.details')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  {t('admin.state.loading')}
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  {t('admin.state.noOrders')}
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6 font-mono font-bold text-white">
                    #{order.orderNumber}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-white">{order.customer.fullName}</p>
                    <p className="text-[10px] text-slate-500">{order.customer.email}</p>
                  </td>
                  <td className="p-4 text-slate-400 tabular-nums">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-300 tabular-nums">
                      {order.items.reduce((s, it) => s + it.quantity, 0)} {t('admin.products.units')}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-cyan-400 tabular-nums">
                    ${order.total.toLocaleString()}
                  </td>
                  <td className="p-4 uppercase text-slate-400 font-semibold text-[10px]">
                    {order.paymentMethod}
                  </td>
                  <td className="p-4 capitalize text-slate-300">
                    {order.deliveryMethod}
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="bg-black/50 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {statusOptions.map(st => (
                        <option key={st} value={st} className="bg-[#0d0f17] text-white">
                          {t(`admin.status.${st}`, st)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t('admin.orders.details')}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-[#0d0f17] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  {t('admin.orders.orderNumber')}: #{selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-slate-400">
                  {t('admin.orders.date')}: {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Changer in Modal */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-300 block">{t('admin.orders.status')}:</span>
                <span className="text-sm font-extrabold text-white">
                  {t(`admin.status.${selectedOrder.status}`, selectedOrder.status)}
                </span>
              </div>
              <select
                value={selectedOrder.status}
                onChange={e => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                className="bg-[#0d0f17] border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs font-bold text-cyan-400 focus:outline-none"
              >
                {statusOptions.map(st => (
                  <option key={st} value={st}>{t(`admin.status.${st}`, st)}</option>
                ))}
              </select>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                  {t('admin.orders.customer')}
                </span>
                <p className="text-white font-bold text-sm">{selectedOrder.customer.fullName}</p>
                <p className="text-slate-300">{selectedOrder.customer.email}</p>
                <p className="text-slate-300">{selectedOrder.customer.phone}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                  {t('admin.orders.delivery')}
                </span>
                <p className="text-white">{selectedOrder.customer.address}</p>
                <p className="text-slate-300">{selectedOrder.customer.city}, {selectedOrder.customer.region}</p>
                <p className="text-cyan-400 font-semibold mt-1 capitalize">{selectedOrder.deliveryMethod}</p>
              </div>
            </div>

            {/* Product Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('admin.orders.items')} ({selectedOrder.items.length})
              </h4>
              <div className="bg-black/40 rounded-2xl border border-white/10 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-slate-400 uppercase text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-3 pl-4">Mahsulot</th>
                      <th className="p-3">Rang</th>
                      <th className="p-3">Xotira</th>
                      <th className="p-3">Tezkor xotira</th>
                      <th className="p-3">Versiya</th>
                      <th className="p-3">Narx</th>
                      <th className="p-3">Miqdor</th>
                      <th className="p-3 pr-4 text-right">Jami</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedOrder.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            <img src={it.image} alt={it.productName || it.name} className="w-10 h-10 object-contain rounded-lg bg-slate-900 p-1 shrink-0" />
                            <span className="font-bold text-white">{it.productName || it.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-200 font-medium">{it.color || '—'}</td>
                        <td className="p-3 text-slate-200 font-medium">{it.storage || '—'}</td>
                        <td className="p-3 text-slate-200 font-medium">{it.ram || '—'}</td>
                        <td className="p-3 text-cyan-300 font-semibold">{it.model || '—'}</td>
                        <td className="p-3 font-mono text-slate-300 tabular-nums">${it.price.toLocaleString()}</td>
                        <td className="p-3 font-bold text-white tabular-nums">{it.quantity} dona</td>
                        <td className="p-3 pr-4 text-right font-mono font-bold text-cyan-400 tabular-nums">
                          ${(it.price * it.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>{t('cart.subtotal')}:</span>
                <span className="tabular-nums">${selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>{t('admin.products.discount')}:</span>
                  <span className="tabular-nums">-${selectedOrder.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>{t('admin.orders.delivery')}:</span>
                <span className="tabular-nums">
                  {selectedOrder.deliveryFee === 0 ? t('cart.free') : `$${selectedOrder.deliveryFee}`}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-base font-extrabold text-white">
                <span>{t('admin.orders.total')}:</span>
                <span className="text-cyan-400 tabular-nums">${selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
