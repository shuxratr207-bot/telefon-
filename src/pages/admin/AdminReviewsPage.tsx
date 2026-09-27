import React, { useState, useEffect } from 'react';
import { Star, Check, EyeOff, Trash2 } from 'lucide-react';
import { Review } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AdminReviewsPageProps {
  onNavigate: (route: string) => void;
}

export const AdminReviewsPage: React.FC<AdminReviewsPageProps> = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getReviews();
      setReviews(res.reviews);
    } catch {
      setError(t('admin.state.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id: string, status: Review['status']) => {
    try {
      await api.updateReview(id, { status });
      showToast(t('admin.btn.update'), 'success');
      loadData();
    } catch {
      showToast(t('admin.state.error'), 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteReview(id);
      showToast(t('admin.btn.delete'), 'info');
      loadData();
    } catch {
      showToast(t('admin.state.error'), 'error');
    }
  };

  const translateReviewStatus = (status?: string) => {
    if (status === 'hidden') return t('admin.status.hidden');
    if (status === 'pending') return t('admin.status.pending');
    return t('admin.status.approved');
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
          {t('admin.reviews.title')}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {t('admin.reviews.subtitle')} ({reviews.length})
        </p>
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

      <div className="rounded-3xl bg-[#0d0f17] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-black/40">
                <th className="py-3.5 px-5">{t('admin.reviews.customer')}</th>
                <th className="py-3.5 px-4">{t('admin.reviews.product')}</th>
                <th className="py-3.5 px-4">{t('admin.reviews.rating')}</th>
                <th className="py-3.5 px-4">{t('admin.reviews.review')}</th>
                <th className="py-3.5 px-4">{t('admin.reviews.date')}</th>
                <th className="py-3.5 px-4">{t('admin.reviews.status')}</th>
                <th className="py-3.5 px-5 text-right">{t('admin.btn.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    {t('admin.state.loading')}
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    {t('admin.state.noReviews')}
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5 font-bold text-white">{rev.customerName}</td>
                    <td className="py-4 px-4 text-xs text-cyan-400 font-semibold">
                      {rev.productName || `#${rev.productId}`}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating}.0
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-md">
                      <p className="text-xs text-slate-300 line-clamp-2">{rev.review}</p>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400">{rev.date}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rev.status === 'hidden'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {translateReviewStatus(rev.status)}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateStatus(rev.id, 'approved')}
                          title={t('admin.reviews.approve')}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateStatus(rev.id, 'hidden')}
                          title={t('admin.reviews.hide')}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rev.id)}
                          title={t('admin.reviews.delete')}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
