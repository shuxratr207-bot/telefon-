import React, { useState, useEffect } from 'react';
import { Flame, Plus, Edit, Trash2, X, Calendar, Clock } from 'lucide-react';
import { Deal, Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminDealsPageProps {
  onNavigate: (route: string) => void;
}

export const AdminDealsPage: React.FC<AdminDealsPageProps> = ({ onNavigate }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [discountAmount, setDiscountAmount] = useState(100);
  const [stockLimit, setStockLimit] = useState(30);

  const { showToast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dealRes, prodRes] = await Promise.all([api.getDeals(), api.getProducts()]);
      setDeals(dealRes.deals);
      setProducts(prodRes.products);
      if (prodRes.products.length > 0) {
        setSelectedProductId(prodRes.products[0].id);
      }
    } catch (e) {
      console.error('Failed to load deals:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingDeal(null);
    setDiscountAmount(100);
    setStockLimit(30);
    if (products.length > 0) setSelectedProductId(products[0].id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDeal) {
        await api.updateDeal(editingDeal.id, {
          discount: Number(discountAmount),
          stockLimit: Number(stockLimit),
        });
        showToast('Deal updated successfully!', 'success');
      } else {
        await api.createDeal({
          productId: selectedProductId,
          discount: Number(discountAmount),
          stockLimit: Number(stockLimit),
        });
        showToast('Created new flash deal! Broadcasted to storefront.', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Deal operation failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDeal(id);
      showToast('Deal removed', 'info');
      loadData();
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
            Flash Deals &amp; Promotional Campaigns
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure time-limited discount programs that broadcast dynamically to the customer Flash Deals showcase.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-rose-500/25"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Launch Deal</span>
        </button>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map(deal => (
          <div
            key={deal.id}
            className="p-6 rounded-3xl bg-[#0d0f17] border border-rose-500/30 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 fill-rose-400" />
                ACTIVE SALE
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">
                -${deal.discount} OFF
              </span>
            </div>

            <div className="flex items-center gap-4">
              <img src={deal.productImage} alt={deal.productName} className="w-16 h-16 object-contain" />
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400">{deal.brand}</span>
                <h4 className="text-sm font-bold text-white line-clamp-1">{deal.productName}</h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-extrabold text-white">
                    ${deal.dealPrice?.toLocaleString() || deal.originalPrice - deal.discount}
                  </span>
                  <span className="text-xs text-slate-500 line-through">
                    ${deal.originalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Sold: <strong className="text-white">{deal.soldCount}</strong> / {deal.stockLimit}</span>
              <button
                onClick={() => handleDelete(deal.id)}
                className="text-slate-500 hover:text-rose-400 p-1"
                title="End deal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[#0d0f17] border border-rose-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingDeal ? 'Edit Flash Deal' : 'Launch New Flash Deal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Smartphone *</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d0f17] border border-white/10 rounded-xl text-white focus:outline-none focus:border-rose-400"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.brand} - {p.name} (${p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Discount Amount ($ USD) *</label>
                <input
                  type="number"
                  required
                  min="10"
                  value={discountAmount}
                  onChange={e => setDiscountAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Capped Deal Stock Limit</label>
                <input
                  type="number"
                  required
                  min="5"
                  value={stockLimit}
                  onChange={e => setStockLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-rose-400"
                />
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
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold uppercase"
                >
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
