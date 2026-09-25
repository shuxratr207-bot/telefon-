import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  X,
  Check,
  Star,
  Zap,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { Product, Brand, Category } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminProductsPageProps {
  onNavigate: (route: string) => void;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Apple',
    category: 'Flagship',
    description: '',
    price: 999,
    oldPrice: 1099,
    stock: 25,
    sku: '',
    ram: '12GB',
    storage: '256GB, 512GB',
    processor: 'Next-Gen Octa-Core AI',
    display: '6.7" LTPO OLED 120Hz',
    camera: '50MP Triple Array OIS',
    battery: '5,000 mAh Fast Charge',
    charging: '65W Fast Wired, 25W Wireless',
    os: 'Android 16 / iOS 19',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80',
    colorName: 'Space Black',
    colorHex: '#1e1e24',
    featured: false,
    bestSeller: false,
    newArrival: true,
    deal: false,
  });

  const { showToast } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const [prodRes, brandRes, catRes] = await Promise.all([
        api.getProducts(),
        api.getBrands(),
        api.getCategories(),
      ]);
      setProducts(prodRes.products);
      setBrands(brandRes.brands);
      setCategories(catRes.categories);
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: brands[0]?.name || 'Apple',
      category: 'Flagship',
      description: '',
      price: 999,
      oldPrice: 1099,
      stock: 25,
      sku: `NOVA-${Math.floor(1000 + Math.random() * 9000)}`,
      ram: '12GB, 16GB',
      storage: '256GB, 512GB, 1TB',
      processor: 'Snapdragon 8 Gen 5 / A19 Pro',
      display: '6.8" Dynamic AMOLED 2X 120Hz',
      camera: '50MP Primary OIS + 50MP Periscope + 50MP Ultrawide',
      battery: '5,200 mAh Silicon-Carbon',
      charging: '80W Fast Wired, 30W Wireless',
      os: 'Android 16',
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=900&auto=format&fit=crop&q=80',
      colorName: 'Cosmic Titanium',
      colorHex: '#4A4E69',
      featured: false,
      bestSeller: false,
      newArrival: true,
      deal: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description,
      price: p.price,
      oldPrice: p.oldPrice,
      stock: p.stock,
      sku: p.sku,
      ram: p.ram.join(', '),
      storage: p.storage.join(', '),
      processor: p.processor,
      display: p.display,
      camera: p.camera,
      battery: p.battery,
      charging: p.charging || '',
      os: p.os || '',
      imageUrl: p.images[0] || '',
      colorName: p.colors[0]?.name || 'Default',
      colorHex: p.colors[0]?.hex || '#18181b',
      featured: p.featured,
      bestSeller: p.bestSeller,
      newArrival: p.newArrival,
      deal: p.deal,
    });
    setIsModalOpen(true);
  };

  const handleDuplicate = async (p: Product) => {
    try {
      const duplicated = {
        ...p,
        id: `prod-${Date.now()}`,
        name: `${p.name} (Copy)`,
        sku: `${p.sku}-CP`,
      };
      await api.createProduct(duplicated);
      showToast(`Duplicated ${p.name}!`, 'success');
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Duplication failed', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await api.deleteProduct(deleteCandidate.id);
      showToast(`Deleted ${deleteCandidate.name} from catalog`, 'info');
      setDeleteCandidate(null);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Product> = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        description: formData.description,
        price: Number(formData.price),
        oldPrice: Number(formData.oldPrice),
        discount: formData.oldPrice > formData.price ? Math.round(((formData.oldPrice - formData.price) / formData.oldPrice) * 100) : 0,
        stock: Number(formData.stock),
        sku: formData.sku,
        ram: formData.ram.split(',').map(s => s.trim()),
        storage: formData.storage.split(',').map(s => s.trim()),
        processor: formData.processor,
        display: formData.display,
        camera: formData.camera,
        battery: formData.battery,
        charging: formData.charging,
        os: formData.os,
        images: [formData.imageUrl],
        colors: [{ name: formData.colorName, hex: formData.colorHex, image: formData.imageUrl }],
        featured: formData.featured,
        bestSeller: formData.bestSeller,
        newArrival: formData.newArrival,
        deal: formData.deal,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast(`Updated ${formData.name} successfully!`, 'success');
      } else {
        await api.createProduct(payload);
        showToast(`Created new product: ${formData.name}!`, 'success');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  const filtered = products.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            Smartphone Catalog Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, update specs, adjust pricing, and broadcast flagship hardware directly to live store.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>ADD NEW PRODUCT</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search catalog by name, brand, or SKU..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <span className="text-xs text-slate-400">
          Total Products: <strong className="text-white">{filtered.length}</strong>
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-3xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="p-4 pl-6">Device</th>
              <th className="p-4">Brand</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Badges</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">Loading catalog...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">No products found matching &ldquo;{search}&rdquo;</td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 p-1 flex items-center justify-center shrink-0">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{p.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-200">{p.brand}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-slate-300 border border-white/10">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      ${p.price.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-semibold ${
                        p.stock === 0 ? 'text-rose-400 font-bold' : p.stock <= 10 ? 'text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {p.rating}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {p.featured && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300">
                          Featured
                        </span>
                      )}
                      {p.deal && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300">
                          Deal
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => window.open(`/phones/${p.id}`, '_blank')}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                        title="View on store"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="p-2 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-white/5"
                        title="Duplicate product"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5"
                        title="Edit product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(p)}
                        className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
                        title="Delete product"
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-3xl bg-[#0d0f17] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Smartphone'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Galaxy S26 Ultra"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Brand *</label>
                  <select
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d0f17] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d0f17] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Price ($ USD) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Old MSRP Price ($ USD)</label>
                  <input
                    type="number"
                    value={formData.oldPrice}
                    onChange={e => setFormData({ ...formData, oldPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Image URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Specs */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Processor</label>
                  <input
                    type="text"
                    value={formData.processor}
                    onChange={e => setFormData({ ...formData, processor: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Display</label>
                  <input
                    type="text"
                    value={formData.display}
                    onChange={e => setFormData({ ...formData, display: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Camera Array</label>
                  <input
                    type="text"
                    value={formData.camera}
                    onChange={e => setFormData({ ...formData, camera: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Battery</label>
                  <input
                    type="text"
                    value={formData.battery}
                    onChange={e => setFormData({ ...formData, battery: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">RAM (comma separated)</label>
                  <input
                    type="text"
                    value={formData.ram}
                    onChange={e => setFormData({ ...formData, ram: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Storage (comma separated)</label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={e => setFormData({ ...formData, storage: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Checkbox Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.bestSeller}
                    onChange={e => setFormData({ ...formData, bestSeller: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>Best Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.newArrival}
                    onChange={e => setFormData({ ...formData, newArrival: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.deal}
                    onChange={e => setFormData({ ...formData, deal: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>Flash Deal</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Required by brief) */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeleteCandidate(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[#0d0f17] border border-rose-500/30 rounded-3xl p-6 shadow-2xl z-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              Are you sure you want to delete this product?
            </h3>
            <p className="text-xs text-slate-400">
              This will permanently remove <strong className="text-white">{deleteCandidate.name}</strong> from the database and customer storefront.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
