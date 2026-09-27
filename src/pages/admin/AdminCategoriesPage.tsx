import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Grid, X } from 'lucide-react';
import { Category, Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AdminCategoriesPageProps {
  onNavigate: (route: string) => void;
}

export const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, prodRes] = await Promise.all([api.getCategories(), api.getProducts()]);
      setCategories(catRes.categories);
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

  const openModal = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({
        name: cat.name,
        description: cat.description || '',
      });
    } else {
      setEditingCat(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast(t('admin.categories.name'), 'error');
      return;
    }
    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (editingCat) {
        await api.updateCategory(editingCat.id, { ...formData, slug });
        showToast(t('admin.btn.update'), 'success');
      } else {
        await api.createCategory({ ...formData, slug });
        showToast(t('admin.btn.save'), 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      showToast(t('admin.state.error'), 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.deleteCategory(deleteConfirm.id);
      showToast(t('admin.btn.delete'), 'info');
      setDeleteConfirm(null);
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
            {t('admin.categories.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('admin.categories.subtitle')} ({categories.length})
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> {t('admin.categories.add')}
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
      ) : categories.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-[#0d0f17] rounded-2xl border border-white/10">
          {t('admin.state.noData')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const count =
              cat.productCount ??
              products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;
            return (
              <div
                key={cat.id}
                className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 flex flex-col justify-between gap-4 hover:border-white/20 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Grid className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {t('admin.status.active')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{cat.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{cat.description}</p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    {t('admin.categories.productCount')}: <span className="text-cyan-400">{count}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openModal(cat)}
                      title={t('admin.categories.edit')}
                      className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat)}
                      title={t('admin.categories.delete')}
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#0d0f17] border border-white/10 p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">{t('admin.categories.delete')}</h3>
            <p className="text-sm text-slate-400">
              <strong className="text-white">{deleteConfirm.name}</strong>
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
              >
                {t('admin.btn.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                {t('admin.btn.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#0d0f17] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingCat ? t('admin.categories.edit') : t('admin.categories.add')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg bg-white/5 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('admin.categories.name')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('admin.brands.description')}
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
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
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold"
                >
                  {editingCat ? t('admin.btn.update') : t('admin.btn.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
