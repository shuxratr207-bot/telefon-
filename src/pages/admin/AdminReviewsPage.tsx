import React, { useState, useEffect } from 'react';
import { Star, Check, EyeOff, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Review } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminReviewsPageProps {
  onNavigate: (route: string) => void;
}

export const AdminReviewsPage: React.FC<AdminReviewsPageProps> = ({ onNavigate }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReviews();
      setReviews(res.reviews);
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleApprove = async (rev: Review) => {
    try {
      await api.updateReview(rev.id, { status: 'approved' });
      setReviews(reviews.map(r => (r.id === rev.id ? { ...r, status: 'approved' } : r)));
      showToast('Review approved & published to product page!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  const handleHide = async (rev: Review) => {
    try {
      await api.updateReview(rev.id, { status: 'hidden' });
      setReviews(reviews.map(r => (r.id === rev.id ? { ...r, status: 'hidden' } : r)));
      showToast('Review hidden from product page', 'info');
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteReview(id);
      setReviews(reviews.filter(r => r.id !== id));
      showToast('Review deleted', 'info');
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
            Customer Feedback &amp; Reviews Moderation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Approve, suppress, or audit customer product evaluations for transparency.
          </p>
        </div>

        <span className="text-xs text-slate-400">
          Total Reviews: <strong className="text-white">{reviews.length}</strong>
        </span>
      </div>

      {/* Reviews Table */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-3xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="p-4 pl-6">Customer</th>
              <th className="p-4">Smartphone</th>
              <th className="p-4">Score</th>
              <th className="p-4">Feedback Comment</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">Loading reviews...</td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">No customer reviews recorded.</td>
              </tr>
            ) : (
              reviews.map(rev => (
                <tr key={rev.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6 font-bold text-white">
                    {rev.customerName}
                  </td>
                  <td className="p-4 text-cyan-300 font-semibold">
                    {rev.productName}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {rev.rating}.0
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 max-w-xs truncate">
                    &ldquo;{rev.review}&rdquo;
                  </td>
                  <td className="p-4 text-slate-400 font-mono">
                    {rev.date}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rev.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {rev.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(rev)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold"
                          title="Approve review"
                        >
                          Approve
                        </button>
                      )}
                      {rev.status === 'approved' && (
                        <button
                          onClick={() => handleHide(rev)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold"
                          title="Hide from store"
                        >
                          Hide
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
  );
};
