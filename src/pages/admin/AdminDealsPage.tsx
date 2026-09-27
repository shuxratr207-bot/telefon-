import React, { useState, useEffect } from 'react';
import { Flame, Plus, Trash2, Edit, X } from 'lucide-react';
import { Deal, Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AdminDealsPageProps {
  onNavigate: (route: string) => void;
}

export const AdminDealsPage: React.FC<AdminDealsPageProps> = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    discount: '',
    startDate: '',
    endDate: '',
    stockLimit: '',
    status: 'active' as 'active' | 'ended' | 'scheduled',
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dealRes, prodRes] = await Promise.all([api.getDeals(), api.getProducts()]);
      setDeals(dealRes.deals);
      setProducts(prodRes.products);
    } catch {
      setError(t('admin.state.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (deal?: Deal) => {
    if (deal) {
      setEditingDeal(deal);
      setFormData({
        productId: String(deal.productId),
        discount: String(deal.discount),
        startDate: deal.startDate.slice(0, 10),
        endDate: deal.endDate.slice(0, 10),
        stockLimit: String(deal.stockLimit),
        status: deal.status,
      });
    } else {
      setEditingDeal(null);
      setFormData({
        productId: '',
        discount: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        stockLimit: '',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => String(p.id) === String(formData.productId));
    if (!product) {
      showToast(t('admin.deals.product'), 'error');
      return;
    }
    const pct = Number(formData.discount);
    if (!pct || pct <= 0 || pct >= 95) {
      showToast(t('admin.deals.discountPercent'), 'error');
      return;
    }
    const limit = Number(formData.stockLimit) || 10;
    const oldPrice = product.oldPrice && product.oldPrice > product.price ? product.oldPrice : product.price;
    const dealPrice = Math.round(oldPrice * (1 - pct / 100));

    try {
      if (editingDeal) {
        await api.updateDeal(editingDeal.id, {
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          brand: product.brand,
          originalPrice: oldPrice,
          dealPrice,
          discount: pct,
          startDate: formData.startDate,
          endDate: formData.endDate,
          stockLimit: limit,
          status: formData.status,
        });
        showToast(t('admin.btn.update'), 'success');
      } else {
        await api.createDeal({
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          brand: product.brand,
          originalPrice: oldPrice,
          dealPrice,
          discount: pct,
          startDate: formData.startDate,
          endDate: formData.endDate,
          stockLimit: limit,
          soldCount: 0,
          status: formData.status,
        });
        showToast(t('admin.btn.save'), 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      showToast(t('admin.state.error'), 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDeal(id);
      showToast(t('admin.btn.delete'), 'info');
      loadData();
    } catch {
      showToast(t('admin.state.error'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {t('admin.deals.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t('admin.deals.subtitle')}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-rose-500/25"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> {t('admin.deals.add')}
        </button>
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

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-[#0d0f17] rounded-2xl border border-white/10">
          {t('admin.state.loading')}
        </div>
      ) : deals.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-[#0d0f17] rounded-2xl border border-white/10">
          {t('admin.state.noData')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="p-5 rounded-3xl bg-[#0d0f17] border border-white/10 flex items-center gap-4 justify-between shadow-xl"
            >
              <div className="flex items-center gap-4">
                <img
                  src={deal.productImage}
                  alt={deal.productName}
                  className="w-16 h-16 rounded-xl object-contain bg-white/5 p-1 border border-white/10"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/20 text-[10px] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> -{deal.discount}%
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        deal.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-500/10 text-slate-400'
                      }`}
                    >
                      {deal.status === 'active' ? t('admin.deals.active') : t('admin.deals.expired')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{deal.productName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-extrabold text-emerald-400">
                      ${deal.dealPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 line-through">
                      ${deal.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {t('admin.deals.limitAmount')}: {deal.stockLimit} • {deal.startDate.slice(0, 10)} —{' '}
                    {deal.endDate.slice(0, 10)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openModal(deal)}
                  title={t('admin.btn.edit')}
                  className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(deal.id)}
                  title={t('admin.btn.delete')}
                  className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#0d0f17] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingDeal ? t('admin.btn.edit') : t('admin.deals.add')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg bg-white/5 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('admin.deals.product')} *
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1322] border border-white/10 text-white text-sm"
                >
                  <option value="">{t('admin.deals.product')}...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('admin.deals.discountPercent')} (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder=""
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('admin.deals.limitAmount')} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.stockLimit}
                    onChange={(e) => setFormData({ ...formData, stockLimit: e.target.value })}
                    placeholder=""
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('admin.deals.startDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('admin.deals.endDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('admin.orders.status')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1322] border border-white/10 text-white text-sm"
                >
                  <option value="active">{t('admin.deals.active')}</option>
                  <option value="ended">{t('admin.deals.expired')}</option>
                </select>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold"
                >
                  {t('admin.btn.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  {editingDeal ? t('admin.btn.update') : t('admin.btn.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
