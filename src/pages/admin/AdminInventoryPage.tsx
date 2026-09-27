import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AdminInventoryPageProps {
  onNavigate: (route: string) => void;
}

export const AdminInventoryPage: React.FC<AdminInventoryPageProps> = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProducts();
      setProducts(res.products);
    } catch {
      setError(t('admin.state.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStock = async (product: Product, newStock: number) => {
    const validStock = Math.max(0, newStock);
    try {
      await api.adjustStock(product.id, { newStock: validStock });
      showToast(`${product.name}: ${validStock} ${t('admin.products.units')}`, 'success');
      loadData();
    } catch {
      showToast(t('admin.state.error'), 'error');
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase());
    if (filter === 'low') return matchSearch && p.stock > 0 && p.stock <= 10;
    if (filter === 'out') return matchSearch && p.stock === 0;
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {t('admin.inventory.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t('admin.inventory.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'low', 'out'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-cyan-500 text-black'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {f === 'all'
                ? `${t('catalog.all')} (${products.length})`
                : f === 'low'
                ? `${t('admin.inventory.lowStock')} (${products.filter((p) => p.stock > 0 && p.stock <= 10).length})`
                : `${t('admin.inventory.outOfStock')} (${products.filter((p) => p.stock === 0).length})`}
            </button>
          ))}
        </div>
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

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.products.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0f17] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      <div className="rounded-3xl bg-[#0d0f17] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-black/40">
                <th className="py-3.5 px-5">{t('admin.inventory.product')}</th>
                <th className="py-3.5 px-4">{t('admin.inventory.sku')}</th>
                <th className="py-3.5 px-4">{t('admin.inventory.currentStock')}</th>
                <th className="py-3.5 px-4">{t('admin.inventory.reserved')}</th>
                <th className="py-3.5 px-4">{t('admin.inventory.available')}</th>
                <th className="py-3.5 px-4">{t('admin.inventory.threshold')}</th>
                <th className="py-3.5 px-4">{t('admin.inventory.status')}</th>
                <th className="py-3.5 px-5 text-right">{t('admin.btn.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    {t('admin.state.loading')}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    {t('admin.state.noProducts')}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const reserved = 0;
                  const available = Math.max(0, p.stock - reserved);
                  const threshold = 10;
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0]}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-contain bg-white/5 p-1"
                          />
                          <div>
                            <div className="font-bold text-white">{p.name}</div>
                            <div className="text-xs text-slate-500">{p.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                        {p.sku || `NV-${p.id}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{p.stock}</td>
                      <td className="py-3.5 px-4 text-slate-400">{reserved}</td>
                      <td className="py-3.5 px-4 font-bold text-cyan-400">{available}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">≤ {threshold}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            p.stock === 0
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : p.stock <= threshold
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {p.stock === 0
                            ? t('admin.inventory.outOfStock')
                            : p.stock <= threshold
                            ? t('admin.inventory.lowStock')
                            : t('admin.inventory.inStock')}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => updateStock(p, p.stock - 1)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => updateStock(p, p.stock + 5)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/20 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> 5
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
