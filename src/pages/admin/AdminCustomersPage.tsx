import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, X } from 'lucide-react';
import { User, Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AdminCustomersPageProps {
  onNavigate: (route: string) => void;
}

export const AdminCustomersPage: React.FC<AdminCustomersPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [custRes, ordRes] = await Promise.all([api.getCustomers(), api.getOrders()]);
        setCustomers(custRes.customers);
        setOrders(ordRes.orders);
      } catch (e) {
        console.error('Failed to load customers:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = customers.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const customerOrders = selectedCustomer
    ? orders.filter(
        o => o.userId === selectedCustomer.id || o.customer.email.toLowerCase() === selectedCustomer.email.toLowerCase()
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {t('admin.customers.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('admin.customers.subtitle')}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.customers.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <span className="text-xs text-slate-400">
          {t('admin.dashboard.totalCustomers')}: <strong className="text-white tabular-nums">{filtered.length}</strong>
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-3xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="p-4 pl-6">{t('admin.customers.name')}</th>
              <th className="p-4">{t('admin.customers.email')}</th>
              <th className="p-4">{t('admin.customers.phone')}</th>
              <th className="p-4">{t('admin.customers.orders')}</th>
              <th className="p-4">{t('admin.customers.totalSpent')}</th>
              <th className="p-4">{t('admin.customers.registeredDate')}</th>
              <th className="p-4">{t('admin.customers.status')}</th>
              <th className="p-4 pr-6 text-right">{t('admin.orders.details')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  {t('admin.state.loading')}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  {t('admin.state.noCustomers')}
                </td>
              </tr>
            ) : (
              filtered.map(cust => (
                <tr key={cust.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{cust.name}</h4>
                        <span className="text-[10px] text-slate-500">{cust.city || ''}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{cust.email}</td>
                  <td className="p-4 text-slate-300">{cust.phone || '—'}</td>
                  <td className="p-4 font-bold text-slate-200 tabular-nums">
                    {cust.ordersCount || 0}
                  </td>
                  <td className="p-4 font-mono font-bold text-cyan-400 tabular-nums">
                    ${(cust.totalSpent || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-slate-400 tabular-nums">
                    {new Date(cust.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cust.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {t(`admin.status.${cust.status}`, cust.status)}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center gap-1.5 ml-auto"
                    >
                      <span>{t('admin.orders.details')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Profile & Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedCustomer(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-[#0d0f17] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-lg text-cyan-400">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {t('admin.customers.totalSpent')}
                </span>
                <p className="text-xl font-extrabold text-cyan-400 font-mono tabular-nums">
                  ${(selectedCustomer.totalSpent || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {t('admin.customers.orders')}
                </span>
                <p className="text-xl font-extrabold text-white tabular-nums">
                  {customerOrders.length}
                </p>
              </div>
            </div>

            {/* Past Orders */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('admin.customers.orders')} ({customerOrders.length})
              </h4>
              {customerOrders.length === 0 ? (
                <p className="text-xs text-slate-500 p-4 text-center bg-black/20 rounded-xl">
                  {t('admin.state.noOrders')}
                </p>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map(ord => (
                    <div
                      key={ord.id}
                      className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-white block">#{ord.orderNumber}</span>
                        <span className="text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} {t('admin.products.units')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-cyan-400 block tabular-nums">
                          ${ord.total.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {t(`admin.status.${ord.status}`, ord.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
