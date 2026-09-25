import React, { useState, useEffect } from 'react';
import { Grid, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { Category } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminCategoriesPageProps {
  onNavigate: (route: string) => void;
}

export const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { showToast } = useToast();

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCategories();
      setCategories(res.categories);
    } catch (e) {
      console.error('Failed to load categories:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, { name, description });
        showToast(`Updated category: ${name}`, 'success');
      } else {
        await api.createCategory({ name, description });
        showToast(`Created category: ${name}`, 'success');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteCategory(id);
      showToast('Category deleted', 'info');
      loadCategories();
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
            Device Classification &amp; Categories
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize smartphones by market tier: Flagship, Foldable, Gaming, Mid Range, and Budget.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-xl flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest">
                  #{cat.slug}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-slate-400 border border-white/5">
                  {cat.productCount || 0} Models
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{cat.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {cat.description || 'Hardware tier configuration.'}
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(cat)}
                className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5"
                title="Edit category"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
                title="Delete category"
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
                {editingCategory ? `Edit: ${editingCategory.name}` : 'New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Foldable Flagships"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Summary of devices grouped in this category..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
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
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold uppercase"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
