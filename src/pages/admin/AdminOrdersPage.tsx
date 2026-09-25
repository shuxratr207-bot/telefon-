import React, { useState, useEffect } from 'react';
import { Package, Clock, Eye, CheckCircle2, Search, Filter, RefreshCw, X } from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminOrdersPageProps {
  onNavigate: (route: string) => void;
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ onNavigate }) => {
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
      showToast(`Order #${updated.orderNumber} status changed to ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
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
            Order Fulfillment &amp; Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Process incoming smartphone shipments, update courier dispatch statuses, and audit customer invoices.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feed</span>
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
            placeholder="Search by order #, customer, email..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all" className="bg-[#0d0f17]">All Statuses</option>
            {statusOptions.map(st => (
              <option key={st} value={st} className="bg-[#0d0f17]">{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-3xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="p-4 pl-6">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Delivery</th>
              <th className="p-4">Status Update</th>
              <th className="p-4 pr-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">Loading orders...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">No orders found.</td>
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
                  <td className="p-4 text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-300">
                      {order.items.reduce((s, it) => s + it.quantity, 0)} units
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-cyan-400">
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
                          {st}
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
                      <span>Details</span>
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
                  Order Breakdown: #{selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-slate-400">
                  Ordered on {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Changer in Modal */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-300 block">Current Dispatch Status:</span>
                <span className="text-sm font-extrabold text-white">{selectedOrder.status}</span>
              </div>
              <select
                value={selectedOrder.status}
                onChange={e => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                className="bg-[#0d0f17] border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs font-bold text-cyan-400 focus:outline-none"
              >
                {statusOptions.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Customer &amp; Contact</span>
                <p className="text-white font-bold text-sm">{selectedOrder.customer.fullName}</p>
                <p className="text-slate-300">{selectedOrder.customer.email}</p>
                <p className="text-slate-300">{selectedOrder.customer.phone}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Shipping Destination</span>
                <p className="text-white">{selectedOrder.customer.address}</p>
                <p className="text-slate-300">{selectedOrder.customer.city}, {selectedOrder.customer.region}</p>
                <p className="text-cyan-400 font-semibold mt-1 capitalize">Method: {selectedOrder.deliveryMethod} Delivery</p>
              </div>
            </div>

            {/* Product Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Ordered Smartphones ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-white/5 bg-black/40 rounded-2xl p-4 border border-white/5">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={it.image} alt={it.name} className="w-12 h-12 object-contain" />
                      <div>
                        <h5 className="text-sm font-bold text-white">{it.name}</h5>
                        <p className="text-xs text-slate-400">
                          {it.color} • {it.storage} • Quantity: {it.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">
                        ${(it.price * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal:</span>
                <span>${selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Promotional Discount:</span>
                  <span>-${selectedOrder.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Delivery Charge:</span>
                <span>{selectedOrder.deliveryFee === 0 ? 'FREE' : `$${selectedOrder.deliveryFee}`}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-base font-extrabold text-white">
                <span>Total Received:</span>
                <span className="text-cyan-400">${selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
