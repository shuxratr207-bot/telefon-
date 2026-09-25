import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { Banner } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminBannersPageProps {
  onNavigate: (route: string) => void;
}

export const AdminBannersPage: React.FC<AdminBannersPageProps> = ({ onNavigate }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [buttonText, setButtonText] = useState('EXPLORE NOW');
  const [buttonLink, setButtonLink] = useState('/phones');
  const [badge, setBadge] = useState('NEW GENERATION 2026');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const { showToast } = useToast();

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBanners();
      setBanners(res.banners);
    } catch (e) {
      console.error('Failed to load banners:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImage('https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1600&auto=format&fit=crop&q=80');
    setButtonText('EXPLORE NOW');
    setButtonLink('/phones');
    setBadge('2026 FLAGSHIP');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setImage(b.image);
    setButtonText(b.buttonText);
    setButtonLink(b.buttonLink);
    setBadge(b.badge || '');
    setStatus(b.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, {
          title,
          subtitle,
          image,
          buttonText,
          buttonLink,
          badge,
          status,
        });
        showToast('Banner updated successfully!', 'success');
      } else {
        await api.createBanner({
          title,
          subtitle,
          image,
          buttonText,
          buttonLink,
          badge,
          status,
        });
        showToast('New homepage banner published!', 'success');
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBanner(id);
      showToast('Banner deleted', 'info');
      loadBanners();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            Homepage Hero Banners
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure marquee promotional hero headers and seasonal campaign slides.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(banner => (
          <div
            key={banner.id}
            className="rounded-3xl bg-[#0d0f17] border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between"
          >
            <div className="relative h-48 bg-slate-900 overflow-hidden">
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f17] via-black/40 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                {banner.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {banner.badge}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    banner.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {banner.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">{banner.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{banner.subtitle}</p>
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Action: <strong className="text-cyan-400">{banner.buttonText}</strong></span>
                <span className="font-mono">Route: {banner.buttonLink}</span>
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-black/30 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(banner)}
                className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5"
                title="Edit banner"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
                title="Delete banner"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[#0d0f17] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Title Headline *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subtitle Description</label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={e => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={buttonLink}
                    onChange={e => setButtonLink(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0d0f17] border border-white/10 rounded-xl text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold uppercase"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
