import React, { useState, useEffect } from 'react';
import { Boxes, Plus, Minus, Search, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminInventoryPageProps {
  onNavigate: (route: string) => void;
}

export const AdminInventoryPage: React.FC<AdminInventoryPageProps> = ({ onNavigate }) => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adjustTarget, setAdjustTarget] = useState<any | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(10);

  const { showToast } = useToast();

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const res = await api.getInventory();
      setInventory(res.inventory);
    } catch (e) {
      console.error('Failed to load inventory:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleQuickAdjust = async (item: any, adjustment: number) => {
    try {
      const res = await api.adjustStock(item.id, { adjustment });
      showToast(`Adjusted ${item.name} stock to ${res.stock} units!`, 'success');
      loadInventory();
    } catch (err: any) {
      showToast(err.message || 'Stock adjustment failed', 'error');
    }
  };

  const handleModalAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;
    try {
      const res = await api.adjustStock(adjustTarget.id, { adjustment: Number(adjustmentValue) });
      showToast(`Updated stock for ${adjustTarget.name} to ${res.stock} units!`, 'success');
      setAdjustTarget(null);
      loadInventory();
    } catch (err: any) {
      showToast(err.message || 'Stock adjustment failed', 'error');
    }
  };

  const filtered = inventory.filter(
    it =>
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      it.brand.toLowerCase().includes(search.toLowerCase()) ||
      it.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            Hardware Inventory &amp; Warehousing
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit available units, reserved customer carts, thresholds, and perform instant batch adjustments.
          </p>
        </div>

        <button
          onClick={loadInventory}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by device name, brand, or SKU..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <span className="text-xs text-slate-400">
          Tracked Devices: <strong className="text-white">{filtered.length}</strong>
        </span>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-3xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="p-4 pl-6">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4">Reserved</th>
              <th className="p-4">Available</th>
              <th className="p-4">Threshold</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Quick Stock Adjustment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">Loading stock records...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">No inventory records found.</td>
              </tr>
            ) : (
              filtered.map(it => (
                <tr key={it.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 p-1 flex items-center justify-center shrink-0">
                        <img src={it.image} alt={it.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{it.name}</h4>
                        <span className="text-[10px] text-cyan-400">{it.brand}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-300 font-semibold">{it.sku}</td>
                  <td className="p-4 font-mono font-bold text-white text-sm">{it.currentStock}</td>
                  <td className="p-4 text-slate-400 font-mono">{it.reserved}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">{it.available}</td>
                  <td className="p-4 text-slate-400 font-mono">{it.threshold}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        it.status === 'Out of Stock'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : it.status === 'Low Stock'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {it.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleQuickAdjust(it, -5)}
                        disabled={it.currentStock <= 0}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-white/10 text-xs font-bold"
                        title="Reduce by 5"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(it, 10)}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-cyan-950/40 text-slate-400 hover:text-cyan-300 border border-white/10 text-xs font-bold"
                        title="Add 10"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => {
                          setAdjustTarget(it);
                          setAdjustmentValue(20);
                        }}
                        className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold"
                      >
                        Custom
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Adjustment Modal */}
      {adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setAdjustTarget(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[#0d0f17] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-white">Adjust Stock: {adjustTarget.name}</h3>
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Stock:</span>
                <span className="text-white font-bold">{adjustTarget.currentStock} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Adjustment:</span>
                <span className="text-cyan-400 font-bold">
                  {adjustmentValue >= 0 ? `+${adjustmentValue}` : adjustmentValue}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10 font-bold">
                <span className="text-white">New Stock:</span>
                <span className="text-emerald-400">
                  {Math.max(0, adjustTarget.currentStock + Number(adjustmentValue))} units
                </span>
              </div>
            </div>

            <form onSubmit={handleModalAdjust} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Stock Delta (+/- Quantity)
                </label>
                <input
                  type="number"
                  value={adjustmentValue}
                  onChange={e => setAdjustmentValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs uppercase"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
