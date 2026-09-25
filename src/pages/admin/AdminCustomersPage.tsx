import React, { useState, useEffect } from 'react';
import { Users, Search, ShoppingBag, DollarSign, Mail, Phone, Calendar, ArrowRight, X } from 'lucide-react';
import { User, Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminCustomersPageProps {
  onNavigate: (route: string) => void;
}

export const AdminCustomersPage: React.FC<AdminCustomersPageProps> = ({ onNavigate }) => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  const { showToast } = useToast();

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
            Customer Directory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit registered clientele profiles, cumulative lifetime spend, and past order activity.
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
            placeholder="Search customers by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <span className="text-xs text-slate-400">
          Total Customers: <strong className="text-white">{filtered.length}</strong>
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-3xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="p-4 pl-6">Customer</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Location</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Total Spent</th>
              <th className="p-4">Registered</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">Loading customer profiles...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">No customers found.</td>
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
                        <span className="text-[10px] text-slate-500">ID: {cust.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">
                    <p>{cust.email}</p>
                    <p className="text-[10px] text-slate-500">{cust.phone || '—'}</p>
                  </td>
                  <td className="p-4 text-slate-300">
                    {cust.city ? `${cust.city}, ${cust.region || ''}` : 'United States'}
                  </td>
                  <td className="p-4 font-bold text-slate-200">
                    {cust.ordersCount || 0} Orders
                  </td>
                  <td className="p-4 font-mono font-bold text-cyan-400">
                    ${(cust.totalSpent || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(cust.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center gap-1.5 ml-auto"
                    >
                      <span>Profile History</span>
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
                <span className="text-[10px] uppercase font-bold text-slate-400">Lifetime Spend</span>
                <p className="text-xl font-extrabold text-cyan-400 font-mono">
                  ${(selectedCustomer.totalSpent || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Completed Orders</span>
                <p className="text-xl font-extrabold text-white">
                  {customerOrders.length}
                </p>
              </div>
            </div>

            {/* Past Orders */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Order History ({customerOrders.length})
              </h4>
              {customerOrders.length === 0 ? (
                <p className="text-xs text-slate-500 p-4 text-center bg-black/20 rounded-xl">
                  No orders recorded for this customer profile yet.
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
                        <span className="text-slate-400">{new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} items</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-cyan-400 block">${ord.total.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{ord.status}</span>
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
