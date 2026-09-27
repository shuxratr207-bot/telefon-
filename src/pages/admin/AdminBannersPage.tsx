import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import { Banner } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AdminBannersPageProps {
  onNavigate: (route: string) => void;
}

export const AdminBannersPage: React.FC<AdminBannersPageProps> = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    buttonText: '',
    buttonLink: '/phones',
    startDate: '',
    endDate: '',
    status: 'active' as 'active' | 'inactive',
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBanners();
      setBanners(res.banners);
    } catch {
      setError(t('admin.state.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image,
        buttonText: banner.buttonText,
        buttonLink: banner.buttonLink,
        startDate: banner.startDate?.slice(0, 10) || '',
        endDate: banner.endDate?.slice(0, 10) || '',
        status: banner.status,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        buttonText: '',
        buttonLink: '/phones',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image.trim()) {
      showToast(t('admin.banners.headline'), 'error');
      return;
    }
    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, formData);
        showToast(t('admin.btn.update'), 'success');
      } else {
        await api.createBanner(formData);
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
      await api.deleteBanner(id);
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
            {t('admin.banners.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t('admin.banners.subtitle')}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> {t('admin.banners.add')}
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
      ) : banners.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-[#0d0f17] rounded-2xl border border-white/10">
          {t('admin.state.noData')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="rounded-3xl bg-[#0d0f17] border border-white/10 overflow-hidden flex flex-col justify-between group shadow-xl"
            >
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover opacity-65 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f17] via-[#0d0f17]/40 to-transparent p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        banner.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {banner.status === 'active' ? t('admin.status.active') : t('admin.status.inactive')}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">{banner.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-1">{banner.subtitle}</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-t border-white/5">
                <div className="text-xs text-slate-400">
                  {t('admin.banners.buttonText')}: <span className="text-white font-bold">{banner.buttonText}</span> →{' '}
                  <span className="text-cyan-400">{banner.buttonLink}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openModal(banner)}
                    title={t('admin.btn.edit')}
                    className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    title={t('admin.btn.delete')}
                    className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
                {editingBanner ? t('admin.btn.edit') : t('admin.banners.add')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg bg-white/5 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('admin.banners.headline')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('admin.banners.subtext')}
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('admin.banners.image')} (URL) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('admin.banners.buttonText')}
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('admin.banners.buttonLink')}
                  </label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('admin.banners.startDate')}
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
                    {t('admin.banners.endDate')}
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
                  {t('admin.banners.status')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1322] border border-white/10 text-white text-sm"
                >
                  <option value="active">{t('admin.status.active')}</option>
                  <option value="inactive">{t('admin.status.inactive')}</option>
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
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold"
                >
                  {editingBanner ? t('admin.btn.update') : t('admin.btn.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
