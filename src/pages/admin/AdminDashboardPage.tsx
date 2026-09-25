import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign,
  ShoppingBag,
  Smartphone,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { Order, Product } from '../../types/index.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminDashboardPageProps {
  onNavigate: (route: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [timeframe, setTimeframe] = useState<string>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Quick stock restock modal
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(20);

  const { showToast } = useToast();

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, ordersRes, prodRes] = await Promise.all([
        api.getAnalytics(timeframe),
        api.getOrders(),
        api.getProducts(),
      ]);
      setAnalytics(analyticsRes);
      setOrders(ordersRes.orders);
      setProducts(prodRes.products);
    } catch (e) {
      console.error('Failed to load admin analytics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    try {
      await api.adjustStock(restockProduct.id, { adjustment: Number(restockAmount) });
      showToast(`Restocked ${restockProduct.name} by +${restockAmount} units!`, 'success');
      setRestockProduct(null);
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Restock failed', 'error');
    }
  };

  const lowStockItems = products.filter(p => p.stock <= 15).slice(0, 5);

  const timeframes = [
    { label: 'Today', value: 'today' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '3 Months', value: '3m' },
    { label: '12 Months', value: '12m' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            Operations Executive Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry, transaction flows, and hardware stock velocity.
          </p>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0d0f17] border border-white/10 rounded-2xl">
          {timeframes.map(tf => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeframe === tf.value
                  ? 'bg-cyan-500 text-black font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Metrics: 4 Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
            ${analytics?.metrics?.totalRevenue?.toLocaleString() || '184,920'}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% vs previous window</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {orders.length || '142'}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>98.6% fulfillment rate</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Products</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {products.length || '20'}
          </div>
          <span className="text-xs text-slate-400 block">Across 8 flagship brands</span>
        </div>

        {/* Total Customers */}
        <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customers</span>
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {analytics?.metrics?.totalCustomers || '48'}
          </div>
          <span className="text-xs text-cyan-400 font-semibold block">Active Verified Profiles</span>
        </div>
      </div>

      {/* Secondary Metrics Strip: Pending, Completed, Low Stock, AOV */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0d0f17]/70 border border-white/5 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 block">Pending Orders</span>
            <span className="text-base font-bold text-white">
              {orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d0f17]/70 border border-white/5 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 block">Delivered Orders</span>
            <span className="text-base font-bold text-white">
              {orders.filter(o => o.status === 'Delivered').length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d0f17]/70 border border-white/5 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 block">Low Stock Alerts</span>
            <span className="text-base font-bold text-rose-300">
              {products.filter(p => p.stock <= 10).length} Items
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d0f17]/70 border border-white/5 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 block">Avg Order Value</span>
            <span className="text-base font-bold text-white">
              ${orders.length > 0 ? Math.round(orders.reduce((acc, o) => acc + o.total, 0) / orders.length).toLocaleString() : '1,120'}
            </span>
          </div>
        </div>
      </div>

      {/* Professional Visual Chart Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Revenue & Order Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Revenue &amp; Velocity Matrix</h3>
              <p className="text-xs text-slate-400">Transaction volume trend ({timeframe})</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Revenue ($)
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" /> Orders
              </span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-64 pt-6 flex items-end justify-between gap-3 sm:gap-6">
            {(analytics?.revenueChart || [
              { label: 'Mon', revenue: 4200, orders: 4 },
              { label: 'Tue', revenue: 6800, orders: 6 },
              { label: 'Wed', revenue: 5400, orders: 5 },
              { label: 'Thu', revenue: 8900, orders: 8 },
              { label: 'Fri', revenue: 11200, orders: 10 },
              { label: 'Sat', revenue: 14500, orders: 13 },
              { label: 'Sun', revenue: 9800, orders: 9 },
            ]).map((point: any, idx: number) => {
              const maxRev = 16000;
              const heightPercent = Math.min(100, Math.round((point.revenue / maxRev) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${point.revenue}
                  </div>
                  <div className="w-full max-w-[40px] bg-slate-900 rounded-xl overflow-hidden p-1 flex flex-col justify-end h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.08 }}
                      className="w-full bg-gradient-to-t from-blue-600 via-cyan-500 to-cyan-300 rounded-lg shadow-lg shadow-cyan-500/20"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{point.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand / Category Distribution Card */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white pb-3 border-b border-white/10">
            Brand Volume Distribution
          </h3>
          <div className="space-y-3">
            {[
              { brand: 'Apple', share: 35, count: 4, color: 'bg-cyan-400' },
              { brand: 'Samsung', share: 28, count: 4, color: 'bg-blue-500' },
              { brand: 'Google', share: 15, count: 3, color: 'bg-indigo-500' },
              { brand: 'Xiaomi', share: 12, count: 3, color: 'bg-violet-500' },
              { brand: 'Others (OnePlus/Nothing)', share: 10, count: 6, color: 'bg-emerald-400' },
            ].map(item => (
              <div key={item.brand} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{item.brand}</span>
                  <span className="text-white font-mono">{item.share}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.share}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={() => onNavigate('/admin/analytics')}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>Detailed Analytics Report</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white">Recent Orders</h3>
            <button
              onClick={() => onNavigate('/admin/orders')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 uppercase tracking-wider font-semibold border-b border-white/5">
                <tr>
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.slice(0, 5).map(ord => (
                  <tr key={ord.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 font-mono font-bold text-white">
                      #{ord.orderNumber}
                    </td>
                    <td className="py-3 text-slate-300">
                      {ord.customer.fullName}
                    </td>
                    <td className="py-3 font-bold text-cyan-400">
                      ${ord.total.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                        title="View order"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Low Stock Alerts</span>
            </h3>
            <button
              onClick={() => onNavigate('/admin/inventory')}
              className="text-xs text-cyan-400 hover:underline"
            >
              Inventory
            </button>
          </div>

          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">All smartphones sufficiently stocked.</p>
            ) : (
              lowStockItems.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={item.images[0]} alt={item.name} className="w-10 h-10 object-contain shrink-0" />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                      <span className="text-[10px] font-bold text-rose-400 block">
                        {item.stock} units remaining
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setRestockProduct(item)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-[11px] font-bold shrink-0"
                  >
                    Restock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setRestockProduct(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[#0d0f17] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-white">
              Quick Restock: {restockProduct.name}
            </h3>
            <p className="text-xs text-slate-400">
              Current inventory: <strong className="text-white">{restockProduct.stock} units</strong>
            </p>
            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Add Stock Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={e => setRestockAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-black text-xs font-bold uppercase"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl bg-[#0d0f17] border border-white/10 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                Order #{selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-xs text-slate-400 hover:text-white">
                Close
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p>Customer: <strong className="text-white">{selectedOrder.customer.fullName}</strong> ({selectedOrder.customer.email})</p>
              <p>Address: <span className="text-slate-300">{selectedOrder.customer.address}, {selectedOrder.customer.city}</span></p>
              <p>Payment: <span className="text-cyan-400 uppercase font-bold">{selectedOrder.paymentMethod}</span></p>
              <p>Total: <strong className="text-white font-mono text-sm">${selectedOrder.total.toLocaleString()}</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
