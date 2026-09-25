import React, { useState, useEffect } from 'react';
import { Package, Clock, ShieldCheck, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface OrdersPageProps {
  onNavigate: (path: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
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
              <span>DISPATCH &amp; TRACKING</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              Customer Orders ({orders.length})
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Track status, estimated deliveries, and verify manufacturer warranty receipts.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">Loading order records...</div>
        ) : orders.length === 0 ? (
          <div className="py-24 text-center bg-[#0d0f17] border border-white/10 rounded-3xl p-8 max-w-md mx-auto">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-500" />
            <h3 className="text-lg font-bold text-white mb-1">No Orders Found</h3>
            <p className="text-xs text-slate-400 mb-6">You haven&apos;t placed any smartphone orders yet.</p>
            <button
              onClick={() => onNavigate('/phones')}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs"
            >
              Browse Catalog
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
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Recipient: <strong className="text-slate-200">{order.customer.fullName}</strong> ({order.customer.city}, {order.customer.region})
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
                        ? 'Apple Pay'
                        : order.paymentMethod === 'cod'
                        ? 'Cash on Delivery'
                        : 'Credit Card'}
                    </span>
                    <span className="text-lg font-extrabold text-cyan-400">
                      ${order.total.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
                  >
                    <span>View Details</span>
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
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Status: <strong className="text-cyan-400">{selectedOrder.status}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Purchased Hardware
                </h4>
                <div className="divide-y divide-white/5 bg-black/30 rounded-2xl p-4 border border-white/5">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={it.image} alt={it.name} className="w-12 h-12 object-contain" />
                        <div>
                          <p className="text-sm font-bold text-white">{it.name}</p>
                          <p className="text-xs text-slate-400">
                            {it.color} • {it.storage} • Quantity: {it.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white">
                        ${(it.price * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery address & Customer info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="font-bold text-slate-400 block mb-1">Shipping Destination</span>
                  <p className="text-white font-semibold">{selectedOrder.customer.fullName}</p>
                  <p className="text-slate-300">{selectedOrder.customer.address}</p>
                  <p className="text-slate-300">{selectedOrder.customer.city}, {selectedOrder.customer.region}</p>
                  <p className="text-slate-400">{selectedOrder.customer.phone}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="font-bold text-slate-400 block mb-1">Payment &amp; Fees</span>
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount:</span>
                      <span>-${selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>Delivery:</span>
                    <span>{selectedOrder.deliveryFee === 0 ? 'FREE' : `$${selectedOrder.deliveryFee}`}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white text-sm">
                    <span>Total Paid:</span>
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
