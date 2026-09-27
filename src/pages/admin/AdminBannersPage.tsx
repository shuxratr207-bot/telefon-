import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  X,
  Upload,
  Image as ImageIcon,
  Calendar,
  Link as LinkIcon,
  AlertTriangle,
  Check,
  Loader2,
} from 'lucide-react';
import { Banner } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminBannersPageProps {
  onNavigate: (route: string) => void;
}

interface BannerFormState {
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

interface BannerFieldErrors {
  title?: string;
  image?: string;
  buttonText?: string;
}

export const AdminBannersPage: React.FC<AdminBannersPageProps> = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<BannerFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation Modal state
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<BannerFormState>({
    title: '',
    subtitle: '',
    image: '',
    buttonText: '',
    buttonLink: '/phones',
    startDate: '',
    endDate: '',
    status: 'active',
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBanners();
      setBanners(res.banners);
    } catch {
      setError('Ma’lumotni yuklab bo‘lmadi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Prevent layout shift and body scroll when any modal is open
  useEffect(() => {
    const anyModalOpen = isModalOpen || Boolean(deleteTarget);
    if (!anyModalOpen) return;

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalOverflowX = document.body.style.overflowX;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    document.body.style.overflowX = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overflowX = originalOverflowX;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isModalOpen, deleteTarget]);

  const openModal = (banner?: Banner) => {
    setFieldErrors({});
    setFormError(null);
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        image: banner.image || '',
        buttonText: banner.buttonText || '',
        buttonLink: banner.buttonLink || '/phones',
        startDate: banner.startDate ? banner.startDate.slice(0, 10) : '',
        endDate: banner.endDate ? banner.endDate.slice(0, 10) : '',
        status: banner.status === 'inactive' ? 'inactive' : 'active',
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        buttonText: 'Xarid qilish',
        buttonLink: '/phones',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingBanner(null);
    setFieldErrors({});
    setFormError(null);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (!dataUrl) return;

      // Resize large images on client canvas so huge uploads stay fast & compact
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setFormData(prev => ({ ...prev, image: compressed }));
            setFieldErrors(prev => ({ ...prev, image: undefined }));
            return;
          }
        }

        setFormData(prev => ({ ...prev, image: dataUrl }));
        setFieldErrors(prev => ({ ...prev, image: undefined }));
      };
      img.onerror = () => {
        setFormData(prev => ({ ...prev, image: dataUrl }));
        setFieldErrors(prev => ({ ...prev, image: undefined }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const validateForm = (): boolean => {
    const errors: BannerFieldErrors = {};
    if (!formData.title.trim()) {
      errors.title = 'Sarlavhani kiriting.';
    }
    if (!formData.image.trim()) {
      errors.image = 'Rasm yuklang.';
    }
    if (!formData.buttonText.trim()) {
      errors.buttonText = 'Tugma matnini kiriting.';
    }

    setFieldErrors(errors);

    const firstError = errors.title || errors.image || errors.buttonText;
    if (firstError) {
      setFormError(firstError);
      showToast(firstError, 'error');
      return false;
    }

    setFormError(null);
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        image: formData.image.trim(),
        buttonText: formData.buttonText.trim(),
        buttonLink: formData.buttonLink.trim() || '/phones',
      };

      if (editingBanner) {
        await api.updateBanner(editingBanner.id, payload);
      } else {
        await api.createBanner(payload);
      }

      showToast('Banner muvaffaqiyatli saqlandi.', 'success');
      setIsModalOpen(false);
      setEditingBanner(null);
      await loadData();
    } catch {
      setFormError('Xatolik yuz berdi. Qayta urinib ko‘ring.');
      showToast('Xatolik yuz berdi.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await api.deleteBanner(deleteTarget.id);
      showToast('Banner muvaffaqiyatli o‘chirildi.', 'info');
      setDeleteTarget(null);
      await loadData();
    } catch {
      showToast('Xatolik yuz berdi.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            Bannerlar
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Bosh sahifa reklama bannerlari va aksiyalarini boshqarish
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Banner qo‘shish</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-rose-400 text-sm">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-bold text-xs cursor-pointer"
          >
            Qayta urinish
          </button>
        </div>
      )}

      {/* Loading / Empty / Banner Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-[#0d0f17] rounded-2xl border border-white/10 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Yuklanmoqda...</span>
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center bg-[#0d0f17] rounded-2xl border border-white/10 space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <p className="text-slate-300 text-sm font-semibold">Hozircha bannerlar mavjud emas.</p>
          <button
            type="button"
            onClick={() => openModal()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Banner qo‘shish</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {banners.map(banner => (
            <div
              key={banner.id}
              className="rounded-2xl bg-[#0d0f17] border border-white/10 overflow-hidden flex flex-col justify-between group shadow-xl"
            >
              <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-900">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f17] via-[#0d0f17]/45 to-transparent p-5 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        banner.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-500/20 text-slate-300 border border-white/10'
                      }`}
                    >
                      {banner.status === 'active' ? 'Faol' : 'Nofaol'}
                    </span>
                    {banner.startDate && banner.endDate && (
                      <span className="text-[11px] text-slate-300/90 tabular-nums">
                        {banner.startDate.slice(0, 10)} — {banner.endDate.slice(0, 10)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-extrabold text-white line-clamp-1">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{banner.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="px-4 py-3 flex items-center justify-between gap-3 border-t border-white/5 bg-white/[0.01]">
                <div className="text-xs text-slate-400 truncate min-w-0">
                  Tugma matni:{' '}
                  <span className="text-white font-semibold">{banner.buttonText || 'Xarid qilish'}</span>{' '}
                  <span className="text-slate-600">→</span>{' '}
                  <span className="text-cyan-400">{banner.buttonLink || '/phones'}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openModal(banner)}
                    title="Banner tahrirlash"
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tahrirlash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(banner)}
                    title="O‘chirish"
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">O‘chirish</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT BANNER COMPACT MODAL WITH STICKY FOOTER */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-x-hidden"
          onClick={closeModal}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ maxHeight: '90vh' }}
            className="w-full max-w-lg max-h-[90vh] rounded-2xl bg-[#0d0f17] border border-white/15 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* 1. Modal Header (Fixed at top of modal) */}
            <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0d0f17]">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  {editingBanner ? 'Banner tahrirlash' : 'Banner qo‘shish'}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Barcha asosiy maydonlarni to‘ldiring va saqlang
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Yopish"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Wrapper */}
            <form onSubmit={handleSave} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* 2. Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3.5 sm:px-5 sm:py-4 space-y-3.5">
                {formError && (
                  <div className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Sarlavha */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sarlavha <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => {
                      setFormData({ ...formData, title: e.target.value });
                      if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: undefined });
                      if (formError) setFormError(null);
                    }}
                    placeholder="Masalan: YANGI FLAGMANLAR KOLLEKSIYASI"
                    className={`w-full px-3 py-2 rounded-xl bg-white/[0.04] border text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition-colors ${
                      fieldErrors.title
                        ? 'border-rose-500/70 focus:border-rose-400'
                        : 'border-white/10 focus:border-cyan-500/60'
                    }`}
                  />
                  {fieldErrors.title && (
                    <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.title}</p>
                  )}
                </div>

                {/* Qo‘shimcha matn */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Qo‘shimcha matn
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Qisqacha tavsif yoki aksiya shartlari..."
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 focus:border-cyan-500/60 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Rasm (Compact Upload + URL + Fixed Max-Height Preview) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Rasm <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Fayl yuklash</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={e => {
                        setFormData({ ...formData, image: e.target.value });
                        if (fieldErrors.image) setFieldErrors({ ...fieldErrors, image: undefined });
                        if (formError) setFormError(null);
                      }}
                      placeholder="Rasm URL manzili yoki fayl yuklang..."
                      className={`flex-1 min-w-0 px-3 py-2 rounded-xl bg-white/[0.04] border text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition-colors ${
                        fieldErrors.image
                          ? 'border-rose-500/70 focus:border-rose-400'
                          : 'border-white/10 focus:border-cyan-500/60'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Tanlash</span>
                    </button>
                  </div>

                  {fieldErrors.image && (
                    <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.image}</p>
                  )}

                  {/* Image Preview with strict max-height: 220px and object-fit: cover */}
                  {formData.image.trim() ? (
                    <div
                      style={{ maxHeight: '180px' }}
                      className="mt-2 relative w-full h-36 max-h-[180px] rounded-xl overflow-hidden border border-white/10 bg-slate-900"
                    >
                      <img
                        src={formData.image}
                        alt="Banner ko‘rinishi"
                        style={{ maxHeight: '180px', objectFit: 'cover' }}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        title="Rasmni olib tashlash"
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 w-full py-3 px-4 rounded-xl border border-dashed border-white/15 hover:border-cyan-500/40 bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-400">
                        Rasm tanlanmagan — yuklash uchun bosing yoki yuqoriga URL kiriting
                      </span>
                    </div>
                  )}
                </div>

                {/* Tugma matni & Tugma havolasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tugma matni <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={e => {
                        setFormData({ ...formData, buttonText: e.target.value });
                        if (fieldErrors.buttonText) {
                          setFieldErrors({ ...fieldErrors, buttonText: undefined });
                        }
                        if (formError) setFormError(null);
                      }}
                      placeholder="Masalan: Xarid qilish"
                      className={`w-full px-3 py-2 rounded-xl bg-white/[0.04] border text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition-colors ${
                        fieldErrors.buttonText
                          ? 'border-rose-500/70 focus:border-rose-400'
                          : 'border-white/10 focus:border-cyan-500/60'
                      }`}
                    />
                    {fieldErrors.buttonText && (
                      <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.buttonText}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tugma havolasi
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={formData.buttonLink}
                        onChange={e => setFormData({ ...formData, buttonLink: e.target.value })}
                        placeholder="/phones"
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 focus:border-cyan-500/60 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Boshlanish sanasi & Tugash sanasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Boshlanish sanasi
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 focus:border-cyan-500/60 text-white text-xs sm:text-sm focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tugash sanasi
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 focus:border-cyan-500/60 text-white text-xs sm:text-sm focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Holati */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Holati
                  </label>
                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'active' | 'inactive',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#111522] border border-white/10 focus:border-cyan-500/60 text-white text-xs sm:text-sm focus:outline-none transition-colors"
                  >
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                  </select>
                </div>
              </div>

              {/* 3. Sticky Footer (Always visible at bottom of modal) */}
              <div className="sticky bottom-0 z-10 px-4 py-3 sm:px-5 sm:py-3.5 border-t border-white/10 bg-[#0d0f17]/95 backdrop-blur-md flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Saqlash</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPACT DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-x-hidden"
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-[#0d0f17] border border-rose-500/30 p-5 shadow-2xl text-center space-y-4"
          >
            <div className="w-11 h-11 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Bu bannerni o‘chirishga ishonchingiz komilmi?
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">
                {deleteTarget.title}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Yuklanmoqda...</span>
                  </>
                ) : (
                  <span>O‘chirish</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
