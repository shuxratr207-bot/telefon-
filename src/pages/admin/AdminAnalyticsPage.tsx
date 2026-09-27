import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Award } from 'lucide-react';
import { Product, Order, User } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AdminAnalyticsPageProps {
  onNavigate: (route: string) => void;
}

export const AdminAnalyticsPage: React.FC<AdminAnalyticsPageProps> = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, oRes, uRes] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
        api.getUsers(),
      ]);
      setProducts(pRes.products);
      setOrders(oRes.orders);
      setUsers(uRes.users);
    } catch {
      setError(t('admin.state.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validOrders = orders.filter((o) => o.status !== 'Cancelled');
  const totalRev = validOrders.reduce((acc, o) => acc + o.total, 0);
  const avgOrder = validOrders.length ? Math.round(totalRev / validOrders.length) : 0;
  const totalSoldUnits = validOrders.reduce(
    (acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

  // Brand breakdown
  const brandStats = ['Apple', 'Samsung', 'Xiaomi', 'Google', 'OnePlus', 'Honor'].map((brand) => {
    const count = products.filter((p) => p.brand.toLowerCase() === brand.toLowerCase()).length;
    return { brand, count, pct: products.length ? Math.round((count / products.length) * 100) : 0 };
  });

  // Category breakdown
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const categoryStats = categories.map((cat) => {
    const count = products.filter((p) => p.category === cat).length;
    return { cat, count, pct: products.length ? Math.round((count / products.length) * 100) : 0 };
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm bg-[#0d0f17] rounded-2xl border border-white/10">
        {t('admin.state.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
          {t('admin.analytics.title')}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{t('admin.analytics.subtitle')}</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-rose-400 text-sm">
          <span>{error}</span>
          <button
            onClick={loadData}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-bold text-xs"
          >
            {t('admin.state.tryAgain')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: t('admin.analytics.revenue'),
            value: `$${totalRev.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-emerald-400',
          },
          {
            label: t('admin.analytics.avgOrderValue'),
            value: `$${avgOrder.toLocaleString()}`,
            icon: ShoppingBag,
            color: 'text-cyan-400',
          },
          {
            label: t('admin.analytics.orders'),
            value: orders.length,
            icon: TrendingUp,
            color: 'text-purple-400',
          },
          {
            label: t('admin.analytics.productsSold'),
            value: totalSoldUnits,
            icon: Award,
            color: 'text-amber-400',
          },
          {
            label: t('admin.analytics.customers'),
            value: users.filter((u) => u.role === 'customer').length,
            icon: Users,
            color: 'text-blue-400',
          },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="p-5 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{kpi.label}</span>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-extrabold text-white">{kpi.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Brands */}
        <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-xl">
          <h3 className="text-base font-bold text-white mb-5">{t('admin.analytics.topBrands')}</h3>
          <div className="space-y-4">
            {brandStats.map((b) => (
              <div key={b.brand} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{b.brand}</span>
                  <span className="text-slate-400">
                    {b.count} ({b.pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: `${Math.max(b.pct, 6)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-xl">
          <h3 className="text-base font-bold text-white mb-5">{t('admin.analytics.topProducts')}</h3>
          {products.length === 0 ? (
            <div className="text-sm text-slate-500 py-8 text-center">{t('admin.analytics.noData')}</div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold text-xs flex items-center justify-center">
                      #{i + 1}
                    </span>
                    <img
                      src={p.images?.[0]}
                      alt={p.name}
                      className="w-9 h-9 rounded-lg object-contain bg-white/5 p-1"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-500">{p.brand}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-emerald-400">
                      ${p.price.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">★ {p.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Sales Breakdown */}
      <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-xl">
        <h3 className="text-base font-bold text-white mb-5">{t('admin.analytics.categorySales')}</h3>
        {categoryStats.length === 0 ? (
          <div className="text-sm text-slate-500 py-6 text-center">{t('admin.analytics.noData')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categoryStats.map((c) => (
              <div key={c.cat} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{c.cat}</span>
                  <span className="text-xs font-bold text-cyan-400">{c.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                    style={{ width: `${Math.max(c.pct, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
