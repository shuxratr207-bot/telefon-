import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Brand } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AdminBrandsPageProps {
  onNavigate: (route: string) => void;
}

export const AdminBrandsPage: React.FC<AdminBrandsPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Brand | null>(null);

  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const { showToast } = useToast();

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBrands();
      setBrands(res.brands);
    } catch (e) {
      console.error('Failed to load brands:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openAddModal = () => {
    setEditingBrand(null);
    setName('');
    setLogo('');
    setDescription('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setLogo(b.logo);
    setDescription(b.description);
    setStatus(b.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await api.updateBrand(editingBrand.id, { name, logo, description, status });
        showToast(`${name} — ${t('admin.btn.update')}`, 'success');
      } else {
        await api.createBrand({ name, logo, description, status });
        showToast(`${name} — ${t('admin.btn.save')}`, 'success');
      }
      setIsModalOpen(false);
      loadBrands();
    } catch (err: any) {
      showToast(err.message || t('admin.state.error'), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await api.deleteBrand(deleteCandidate.id);
      showToast(`${deleteCandidate.name} — ${t('admin.btn.delete')}`, 'info');
      setDeleteCandidate(null);
      loadBrands();
    } catch (err: any) {
      showToast(err.message || t('admin.state.error'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {t('admin.brands.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('admin.brands.subtitle')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('admin.brands.add')}</span>
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs">{t('admin.state.loading')}</div>
      ) : brands.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs">{t('admin.state.noData')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map(b => (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-xl flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 p-2 overflow-hidden flex items-center justify-center">
                    <img src={b.logo} alt={b.name} className="w-full h-full object-cover" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {t(`admin.status.${b.status}`, b.status)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{b.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {b.description}
                </p>
                <span className="text-[11px] font-semibold text-cyan-400 mt-2 block tabular-nums">
                  {t('admin.categories.productCount')}: {b.productCount || 0}
                </span>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(b)}
                  className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5"
                  title={t('admin.brands.edit')}
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteCandidate(b)}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
                  title={t('admin.brands.delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[#0d0f17] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingBrand ? `${t('admin.brands.edit')}: ${editingBrand.name}` : t('admin.brands.add')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {t('admin.brands.name')} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {t('admin.brands.logo')} (URL) *
                </label>
                <input
                  type="url"
                  required
                  value={logo}
                  onChange={e => setLogo(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {t('admin.brands.description')}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {t('admin.brands.status')}
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0d0f17] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="active">{t('admin.status.active')}</option>
                  <option value="inactive">{t('admin.status.inactive')}</option>
                </select>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300"
                >
                  {t('admin.btn.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold uppercase"
                >
                  {t('admin.btn.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeleteCandidate(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[#0d0f17] border border-rose-500/30 rounded-3xl p-6 shadow-2xl z-10 text-center space-y-4">
            <h3 className="text-base font-bold text-white">
              {t('admin.brands.delete')}: {deleteCandidate.name}?
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300"
              >
                {t('admin.btn.cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase"
              >
                {t('admin.btn.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
