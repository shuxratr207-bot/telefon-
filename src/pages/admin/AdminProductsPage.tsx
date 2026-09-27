import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  X,
  Star,
  Save,
  AlertTriangle,
  Upload,
  Layers,
  Check,
} from 'lucide-react';
import { Product, ProductVariant, Brand, Category } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import {
  guessColorHex,
  getProductColors,
  getProductStorages,
  getProductRams,
  getProductModels,
} from '../../utils/variants.ts';

interface AdminProductsPageProps {
  onNavigate: (route: string) => void;
}

interface VariantDraftRow {
  id: string;
  color: string;
  colorHex: string;
  storage: string;
  ram: string;
  model: string;
  price: string;
  stock: string;
  image: string;
}

const emptyVariantDraft = (): VariantDraftRow => ({
  id: '',
  color: '',
  colorHex: '',
  storage: '',
  ram: '',
  model: '',
  price: '',
  stock: '',
  image: '',
});

const emptyFormState = {
  name: '',
  brand: '',
  category: '',
  description: '',
  price: '',
  oldPrice: '',
  discount: '',
  stock: '',
  sku: '',
  ram: '',
  storage: '',
  models: '',
  processor: '',
  display: '',
  refreshRate: '',
  camera: '',
  battery: '',
  charging: '',
  os: '',
  imageUrl: '',
  additionalImages: [] as string[],
  colorName: '',
  colorHex: '',
  featured: false,
  bestSeller: false,
  newArrival: false,
  deal: false,
};

const QUICK_COLORS = ['Qora', 'Oq', 'Ko‘k', 'Tabiiy titan', 'Binafsha', 'Zumrad yashil', 'Kumush', 'Oltin'];
const QUICK_STORAGES = ['128 GB', '256 GB', '512 GB', '1 TB'];
const QUICK_RAMS = ['8 GB', '12 GB', '16 GB', '24 GB'];
const QUICK_MODELS = ['Oddiy versiya', 'Pro', 'Pro Max', 'Ultra'];

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [variantError, setVariantError] = useState<string>('');

  // Form states — all editable fields start empty ("")
  const [formData, setFormData] = useState(emptyFormState);
  const [variantsList, setVariantsList] = useState<VariantDraftRow[]>([]);
  const [variantDraft, setVariantDraft] = useState<VariantDraftRow>(emptyVariantDraft());
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);

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
    setFormError('');
    setVariantError('');
    setFormData({ ...emptyFormState });
    setVariantsList([]);
    setVariantDraft(emptyVariantDraft());
    setEditingVariantIndex(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormError('');
    setVariantError('');
    setVariantDraft(emptyVariantDraft());
    setEditingVariantIndex(null);

    const existingVariants: VariantDraftRow[] = Array.isArray(p.variants)
      ? p.variants.map((v, idx) => ({
          id: v.id || `var-${idx + 1}`,
          color: v.color || '',
          colorHex: v.colorHex || guessColorHex(v.color || ''),
          storage: v.storage || '',
          ram: v.ram || '',
          model: v.model || '',
          price: v.price !== undefined && v.price !== null ? String(v.price) : '',
          stock: v.stock !== undefined && v.stock !== null ? String(v.stock) : '',
          image: v.image || '',
        }))
      : [];

    setVariantsList(existingVariants);

    setFormData({
      name: p.name || '',
      brand: p.brand || '',
      category: p.category || '',
      description: p.description || '',
      price: p.price !== undefined && p.price > 0 ? String(p.price) : '',
      oldPrice: p.oldPrice !== undefined && p.oldPrice > p.price ? String(p.oldPrice) : '',
      discount: p.discount !== undefined && p.discount > 0 ? String(p.discount) : '',
      stock: p.stock !== undefined ? String(p.stock) : '',
      sku: p.sku || '',
      ram: Array.isArray(p.ram) ? p.ram.join(', ') : '',
      storage: Array.isArray(p.storage) ? p.storage.join(', ') : '',
      models: Array.isArray(p.models) ? p.models.join(', ') : '',
      processor: p.processor || '',
      display: p.display || '',
      refreshRate: p.refreshRate || '',
      camera: p.camera || '',
      battery: p.battery || '',
      charging: p.charging || '',
      os: p.os || '',
      imageUrl: p.images?.[0] || '',
      additionalImages: p.images?.slice(1) || [],
      colorName: Array.isArray(p.colors) ? p.colors.map(c => c.name).join(', ') : '',
      colorHex: p.colors?.[0]?.hex || '',
      featured: Boolean(p.featured),
      bestSeller: Boolean(p.bestSeller),
      newArrival: Boolean(p.newArrival),
      deal: Boolean(p.deal),
    });
    setIsModalOpen(true);
  };

  const validateSingleVariant = (v: VariantDraftRow): string | null => {
    if (!v.color.trim()) return 'Rangni kiriting.';
    if (!v.storage.trim()) return 'Xotirani tanlang.';
    if (v.price.trim() === '' || isNaN(Number(v.price)) || Number(v.price) <= 0) {
      return 'Narxni kiriting.';
    }
    if (v.stock.trim() === '' || isNaN(Number(v.stock)) || Number(v.stock) < 0) {
      return 'Ombordagi sonini kiriting.';
    }
    return null;
  };

  const isVariantDraftTouched = (v: VariantDraftRow): boolean => {
    return Boolean(
      v.color.trim() ||
        v.storage.trim() ||
        v.ram.trim() ||
        v.model.trim() ||
        v.price.trim() ||
        v.stock.trim() ||
        v.image.trim()
    );
  };

  const handleSaveVariantDraft = () => {
    setVariantError('');
    const err = validateSingleVariant(variantDraft);
    if (err) {
      setVariantError(err);
      showToast(err, 'error');
      return;
    }

    const cleanRow: VariantDraftRow = {
      id: variantDraft.id || `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      color: variantDraft.color.trim(),
      colorHex: variantDraft.colorHex.trim() || guessColorHex(variantDraft.color.trim()),
      storage: variantDraft.storage.trim(),
      ram: variantDraft.ram.trim(),
      model: variantDraft.model.trim(),
      price: variantDraft.price.trim(),
      stock: variantDraft.stock.trim(),
      image: variantDraft.image.trim(),
    };

    if (editingVariantIndex !== null) {
      setVariantsList(prev => prev.map((item, idx) => (idx === editingVariantIndex ? cleanRow : item)));
      setEditingVariantIndex(null);
      showToast('Variant yangilandi', 'success');
    } else {
      setVariantsList(prev => [...prev, cleanRow]);
      showToast('Variant qo‘shildi', 'success');
    }

    setVariantDraft(emptyVariantDraft());
  };

  const handleEditVariantRow = (idx: number) => {
    const row = variantsList[idx];
    if (!row) return;
    setVariantError('');
    setEditingVariantIndex(idx);
    setVariantDraft({ ...row });
  };

  const handleDeleteVariantRow = (idx: number) => {
    setVariantsList(prev => prev.filter((_, i) => i !== idx));
    if (editingVariantIndex === idx) {
      setEditingVariantIndex(null);
      setVariantDraft(emptyVariantDraft());
    }
  };

  const handleInlineVariantChange = (
    idx: number,
    field: keyof VariantDraftRow,
    value: string
  ) => {
    setVariantsList(prev =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const updated = { ...row, [field]: value };
        if (field === 'color' && !row.colorHex) {
          updated.colorHex = guessColorHex(value);
        }
        return updated;
      })
    );
  };

  const handleVariantImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        setVariantDraft(prev => ({ ...prev, image: result }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (!result) return;
        setFormData(prev => {
          if (!prev.imageUrl && index === 0) {
            return { ...prev, imageUrl: result };
          }
          return { ...prev, additionalImages: [...prev.additionalImages, result] };
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveAdditionalImage = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== idx),
    }));
  };

  const handleDuplicate = async (p: Product) => {
    try {
      const duplicated = {
        ...p,
        id: `prod-${Date.now()}`,
        name: `${p.name} (${t('admin.btn.duplicate')})`,
        sku: `${p.sku}-CP`,
      };
      await api.createProduct(duplicated);
      showToast(`${p.name} — ${t('admin.btn.duplicate')}`, 'success');
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || t('admin.state.error'), 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await api.deleteProduct(deleteCandidate.id);
      showToast(`${deleteCandidate.name} — ${t('admin.btn.delete')}`, 'info');
      setDeleteCandidate(null);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || t('admin.state.error'), 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setVariantError('');

    // Explicit validation for required product fields
    if (!formData.name.trim()) {
      const msg = t('admin.products.errName');
      setFormError(msg);
      showToast(msg, 'error');
      return;
    }
    if (!formData.brand.trim()) {
      const msg = t('admin.products.errBrand');
      setFormError(msg);
      showToast(msg, 'error');
      return;
    }
    if (!formData.category.trim()) {
      const msg = t('admin.products.errCategory');
      setFormError(msg);
      showToast(msg, 'error');
      return;
    }

    // Check if the admin started typing a variant in the draft row without clicking "+ Variant qo‘shish"
    const combinedVariants = [...variantsList];
    if (isVariantDraftTouched(variantDraft)) {
      const draftErr = validateSingleVariant(variantDraft);
      if (draftErr) {
        setVariantError(draftErr);
        setFormError(draftErr);
        showToast(draftErr, 'error');
        return;
      }
      if (editingVariantIndex !== null) {
        combinedVariants[editingVariantIndex] = {
          ...variantDraft,
          color: variantDraft.color.trim(),
          colorHex: variantDraft.colorHex.trim() || guessColorHex(variantDraft.color.trim()),
          storage: variantDraft.storage.trim(),
          ram: variantDraft.ram.trim(),
          model: variantDraft.model.trim(),
        };
      } else {
        combinedVariants.push({
          ...variantDraft,
          id: variantDraft.id || `var-${Date.now()}`,
          color: variantDraft.color.trim(),
          colorHex: variantDraft.colorHex.trim() || guessColorHex(variantDraft.color.trim()),
          storage: variantDraft.storage.trim(),
          ram: variantDraft.ram.trim(),
          model: variantDraft.model.trim(),
        });
      }
    }

    // Validate every row in combinedVariants
    for (let i = 0; i < combinedVariants.length; i++) {
      const rowErr = validateSingleVariant(combinedVariants[i]);
      if (rowErr) {
        setVariantError(rowErr);
        setFormError(rowErr);
        showToast(rowErr, 'error');
        return;
      }
    }

    const cleanVariants: ProductVariant[] = combinedVariants.map((v, idx) => ({
      id: v.id || `var-${Date.now()}-${idx}`,
      color: v.color.trim(),
      colorHex: v.colorHex.trim() || guessColorHex(v.color.trim()),
      storage: v.storage.trim(),
      ram: v.ram.trim() || undefined,
      model: v.model.trim() || undefined,
      price: Number(v.price),
      stock: Number(v.stock),
      image: v.image.trim() || undefined,
    }));

    // Derive or validate base price and stock
    const minVariantPrice =
      cleanVariants.length > 0 ? Math.min(...cleanVariants.map(v => v.price)) : NaN;
    const sumVariantStock =
      cleanVariants.length > 0 ? cleanVariants.reduce((acc, v) => acc + v.stock, 0) : NaN;

    const parsedPrice =
      formData.price.trim() !== '' ? Number(formData.price) : minVariantPrice;
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      const msg = 'Narxni kiriting.';
      setFormError(msg);
      showToast(msg, 'error');
      return;
    }

    const parsedStock =
      cleanVariants.length > 0
        ? sumVariantStock
        : formData.stock.trim() !== ''
        ? Number(formData.stock)
        : NaN;
    if (isNaN(parsedStock) || parsedStock < 0) {
      const msg = 'Ombordagi sonini kiriting.';
      setFormError(msg);
      showToast(msg, 'error');
      return;
    }

    const variantImages = cleanVariants.map(v => v.image).filter(Boolean) as string[];
    const allImages = Array.from(
      new Set([
        ...(formData.imageUrl.trim() ? [formData.imageUrl.trim()] : []),
        ...formData.additionalImages.filter(Boolean),
        ...variantImages,
      ])
    );
    if (allImages.length === 0) {
      const msg = t('admin.products.errImage');
      setFormError(msg);
      showToast(msg, 'error');
      return;
    }

    const parsedOldPrice =
      formData.oldPrice.trim() !== '' && Number(formData.oldPrice) > parsedPrice
        ? Number(formData.oldPrice)
        : 0;
    const parsedDiscount =
      formData.discount.trim() !== '' && Number(formData.discount) > 0
        ? Number(formData.discount)
        : parsedOldPrice > parsedPrice
        ? Math.round(((parsedOldPrice - parsedPrice) / parsedOldPrice) * 100)
        : 0;

    // Build colors, storage, ram, models from both variants and manual comma-separated inputs
    const manualColors = formData.colorName
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(name => ({
        name,
        hex: formData.colorHex.trim() || guessColorHex(name),
        image: allImages[0],
      }));

    const colorMap = new Map<string, { name: string; hex: string; image?: string }>();
    cleanVariants.forEach(v => {
      const key = v.color.toLowerCase();
      if (!colorMap.has(key)) {
        colorMap.set(key, {
          name: v.color,
          hex: v.colorHex || guessColorHex(v.color),
          image: v.image || allImages[0],
        });
      }
    });
    manualColors.forEach(c => {
      const key = c.name.toLowerCase();
      if (!colorMap.has(key)) {
        colorMap.set(key, c);
      }
    });

    const mergedStorages = Array.from(
      new Set([
        ...cleanVariants.map(v => v.storage).filter(Boolean),
        ...formData.storage
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      ])
    );

    const mergedRams = Array.from(
      new Set([
        ...cleanVariants.map(v => v.ram).filter(Boolean) as string[],
        ...formData.ram
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      ])
    );

    const mergedModels = Array.from(
      new Set([
        ...cleanVariants.map(v => v.model).filter(Boolean) as string[],
        ...formData.models
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      ])
    );

    try {
      const payload: Partial<Product> = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        price: parsedPrice,
        oldPrice: parsedOldPrice,
        discount: parsedDiscount,
        stock: parsedStock,
        sku: formData.sku.trim() || `NOVA-${Date.now().toString().slice(-6)}`,
        ram: mergedRams,
        storage: mergedStorages,
        models: mergedModels,
        variants: cleanVariants,
        processor: formData.processor.trim(),
        display: formData.display.trim(),
        refreshRate: formData.refreshRate.trim(),
        camera: formData.camera.trim(),
        battery: formData.battery.trim(),
        charging: formData.charging.trim(),
        os: formData.os.trim(),
        images: allImages,
        colors: Array.from(colorMap.values()),
        featured: formData.featured,
        bestSeller: formData.bestSeller,
        newArrival: formData.newArrival,
        deal: formData.deal,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast(`${formData.name} — ${t('admin.btn.update')}`, 'success');
      } else {
        await api.createProduct(payload);
        showToast(`${formData.name} — ${t('admin.btn.save')}`, 'success');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || t('admin.state.error'));
      showToast(err.message || t('admin.state.error'), 'error');
    }
  };

  const filtered = products
    .filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase());
      const matchesBrand = filterBrand === 'all' || p.brand === filterBrand;
      return matchesSearch && matchesBrand;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'stock') return a.stock - b.stock;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {t('admin.products.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('admin.products.subtitle')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('admin.products.addNew')}</span>
        </button>
      </div>

      {/* Search, Filter and Sort Bar */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.products.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{t('admin.btn.filter')}:</span>
            <select
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all" className="bg-[#0d0f17]">{t('catalog.all')}</option>
              {brands.map(b => (
                <option key={b.id} value={b.name} className="bg-[#0d0f17]">{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{t('admin.btn.sort')}:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="newest" className="bg-[#0d0f17]">{t('catalog.sortNewest')}</option>
              <option value="price-asc" className="bg-[#0d0f17]">{t('catalog.sortPriceAsc')}</option>
              <option value="price-desc" className="bg-[#0d0f17]">{t('catalog.sortPriceDesc')}</option>
              <option value="stock" className="bg-[#0d0f17]">{t('admin.products.stock')}</option>
            </select>
          </div>

          <span className="text-xs text-slate-400">
            {t('admin.dashboard.totalProducts')}: <strong className="text-white tabular-nums">{filtered.length}</strong>
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-3xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="p-4 pl-6">{t('admin.products.name')}</th>
              <th className="p-4">{t('admin.products.brand')}</th>
              <th className="p-4">Variantlar</th>
              <th className="p-4">{t('admin.products.price')}</th>
              <th className="p-4">{t('admin.products.stock')}</th>
              <th className="p-4">{t('admin.reviews.rating')}</th>
              <th className="p-4">{t('admin.orders.status')}</th>
              <th className="p-4 pr-6 text-right">{t('admin.btn.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  {t('admin.state.loading')}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  {t('admin.state.noProducts')}
                </td>
              </tr>
            ) : (
              filtered.map(p => {
                const pColors = getProductColors(p);
                const pStorages = getProductStorages(p);
                const pRams = getProductRams(p);
                const varCount = Array.isArray(p.variants) ? p.variants.length : 0;

                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 p-1 flex items-center justify-center shrink-0">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{p.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t('admin.products.sku')}: {p.sku}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{p.brand}</div>
                      <span className="text-[10px] text-slate-400">{p.category}</span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 max-w-[220px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {varCount > 0 ? `${varCount} ta variant` : `${pColors.length} rang`}
                          </span>
                          {pStorages.length > 0 && (
                            <span className="text-[10px] text-slate-300 truncate">
                              {pStorages.join(' / ')}
                            </span>
                          )}
                        </div>
                        {pRams.length > 0 && (
                          <div className="text-[10px] text-indigo-300 truncate">
                            RAM: {pRams.join(' / ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col tabular-nums">
                        <span className="font-mono font-bold text-cyan-400 text-sm">
                          ${p.price.toLocaleString()}
                        </span>
                        {p.oldPrice > p.price && (
                          <span className="text-[10px] text-slate-500 line-through">
                            ${p.oldPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-semibold tabular-nums ${
                          p.stock === 0 ? 'text-rose-400 font-bold' : p.stock <= 10 ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        {p.stock === 0 ? 'Tugagan (0)' : `${p.stock} ${t('admin.products.units')}`}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-amber-400 font-semibold tabular-nums">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {p.rating}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {p.featured && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300">
                            {t('admin.products.featured')}
                          </span>
                        )}
                        {p.deal && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300">
                            {t('admin.products.deal')}
                          </span>
                        )}
                        {p.discount > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                            -{p.discount}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate(`/phones/${p.id}`)}
                          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                          title={t('admin.btn.view')}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="p-2 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-white/5"
                          title={t('admin.btn.duplicate')}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5"
                          title={t('admin.btn.edit')}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(p)}
                          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
                          title={t('admin.btn.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-4xl bg-[#0d0f17] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                {editingProduct
                  ? `${t('admin.products.editProduct')}: ${editingProduct.name}`
                  : t('admin.products.addNew')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} noValidate className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    {t('admin.products.name')} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    {t('admin.products.brand')} <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d0f17] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">{t('admin.products.selectBrand')}</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    {t('admin.products.category')} <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d0f17] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">{t('admin.products.selectCategory')}</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t('admin.products.sku')}</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    {t('admin.products.price')} ($ USD) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.price}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || Number(val) >= 0) {
                        setFormData({ ...formData, price: val });
                      }
                    }}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t('admin.products.oldPrice')} ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.oldPrice}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || Number(val) >= 0) {
                        setFormData({ ...formData, oldPrice: val });
                      }
                    }}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t('admin.products.discount')} (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.discount}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || (Number(val) >= 0 && Number(val) <= 99)) {
                        setFormData({ ...formData, discount: val });
                      }
                    }}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    {t('admin.products.stock')} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || Number(val) >= 0) {
                        setFormData({ ...formData, stock: val });
                      }
                    }}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Image URL & Upload */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block font-semibold text-slate-300">
                    {t('admin.products.images')} <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder={t('admin.products.imagePlaceholder')}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                    <label className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold cursor-pointer flex items-center justify-center gap-2 shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t('admin.products.uploadImage')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Preview uploaded / entered images */}
                  {(formData.imageUrl || formData.additionalImages.length > 0) && (
                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                      {formData.imageUrl && (
                        <div className="relative w-14 h-14 rounded-xl bg-black/50 border border-cyan-500/40 p-1">
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, imageUrl: '' })}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      {formData.additionalImages.map((img, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-xl bg-black/50 border border-white/15 p-1">
                          <img src={img} alt={`Preview ${i + 2}`} className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalImage(i)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">{t('admin.products.description')}</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* ================= VARIANT MANAGEMENT SECTION ================= */}
              <div className="p-5 rounded-2xl bg-black/40 border border-cyan-500/25 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        VARIANTS (Smartfon variantlari)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Rang, Xotira, RAM, Versiya bo‘yicha alohida narx, zaxira soni va rasm kiriting
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                    Jami: {variantsList.length} ta variant
                  </span>
                </div>

                {variantError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{variantError}</span>
                  </div>
                )}

                {/* Add / Edit Variant Builder */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
                      {editingVariantIndex !== null
                        ? `Variantni tahrirlash (#${editingVariantIndex + 1})`
                        : 'Yangi variant qo‘shish'}
                    </span>
                    {editingVariantIndex !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVariantIndex(null);
                          setVariantDraft(emptyVariantDraft());
                          setVariantError('');
                        }}
                        className="text-[11px] text-slate-400 hover:text-white underline"
                      >
                        Bekor qilish
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Color */}
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Rang (Color) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={variantDraft.color}
                        onChange={e =>
                          setVariantDraft({
                            ...variantDraft,
                            color: e.target.value,
                            colorHex: guessColorHex(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {QUICK_COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() =>
                              setVariantDraft({
                                ...variantDraft,
                                color: c,
                                colorHex: guessColorHex(c),
                              })
                            }
                            className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                              variantDraft.color === c
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Storage */}
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Xotira (Storage) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={variantDraft.storage}
                        onChange={e => setVariantDraft({ ...variantDraft, storage: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {QUICK_STORAGES.map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setVariantDraft({ ...variantDraft, storage: st })}
                            className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                              variantDraft.storage === st
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* RAM */}
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Tezkor xotira (RAM)
                      </label>
                      <input
                        type="text"
                        value={variantDraft.ram}
                        onChange={e => setVariantDraft({ ...variantDraft, ram: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {QUICK_RAMS.map(rm => (
                          <button
                            key={rm}
                            type="button"
                            onClick={() => setVariantDraft({ ...variantDraft, ram: rm })}
                            className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                              variantDraft.ram === rm
                                ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 font-bold'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {rm}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Version / Model */}
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Versiya (Model)
                      </label>
                      <input
                        type="text"
                        value={variantDraft.model}
                        onChange={e => setVariantDraft({ ...variantDraft, model: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {QUICK_MODELS.map(md => (
                          <button
                            key={md}
                            type="button"
                            onClick={() => setVariantDraft({ ...variantDraft, model: md })}
                            className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                              variantDraft.model === md
                                ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {md}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Variant Price */}
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Narx ($ USD) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={variantDraft.price}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === '' || Number(val) >= 0) {
                            setVariantDraft({ ...variantDraft, price: val });
                          }
                        }}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Variant Stock */}
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Ombordagi soni (Stock) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={variantDraft.stock}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === '' || Number(val) >= 0) {
                            setVariantDraft({ ...variantDraft, stock: val });
                          }
                        }}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Variant Image */}
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block font-semibold text-slate-300 mb-1">
                        Variant rasmi (Rangga mos rasm URL yoki yuklash)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="url"
                          value={variantDraft.image}
                          onChange={e => setVariantDraft({ ...variantDraft, image: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                        />
                        <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                          <Upload className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Rasm tanlash</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleVariantImageUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleSaveVariantDraft}
                          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-cyan-500/20"
                        >
                          {editingVariantIndex !== null ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Variantni saqlash</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Variant qo‘shish</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variants Table */}
                {variantsList.length > 0 && (
                  <div className="rounded-xl border border-white/10 overflow-x-auto bg-[#090b10]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-black/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                        <tr>
                          <th className="p-2.5 pl-3">Rang (Color)</th>
                          <th className="p-2.5">Xotira (Storage)</th>
                          <th className="p-2.5">RAM</th>
                          <th className="p-2.5">Versiya (Version)</th>
                          <th className="p-2.5">Narx ($)</th>
                          <th className="p-2.5">Ombor (Stock)</th>
                          <th className="p-2.5 text-right pr-3">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {variantsList.map((v, idx) => (
                          <tr
                            key={v.id || idx}
                            className={`hover:bg-white/[0.02] ${
                              editingVariantIndex === idx ? 'bg-cyan-500/10' : ''
                            }`}
                          >
                            <td className="p-2.5 pl-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                                  style={{ backgroundColor: v.colorHex || guessColorHex(v.color) }}
                                />
                                <input
                                  type="text"
                                  value={v.color}
                                  onChange={e => handleInlineVariantChange(idx, 'color', e.target.value)}
                                  className="w-24 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white font-semibold text-xs"
                                />
                              </div>
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={v.storage}
                                onChange={e => handleInlineVariantChange(idx, 'storage', e.target.value)}
                                className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-cyan-300 font-semibold text-xs"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={v.ram}
                                onChange={e => handleInlineVariantChange(idx, 'ram', e.target.value)}
                                className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-indigo-300 text-xs"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={v.model}
                                onChange={e => handleInlineVariantChange(idx, 'model', e.target.value)}
                                className="w-24 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-purple-300 text-xs"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={v.price}
                                onChange={e => handleInlineVariantChange(idx, 'price', e.target.value)}
                                className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-emerald-400 font-bold font-mono text-xs"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={v.stock}
                                onChange={e => handleInlineVariantChange(idx, 'stock', e.target.value)}
                                className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white font-bold font-mono text-xs"
                              />
                            </td>
                            <td className="p-2.5 pr-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditVariantRow(idx)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5"
                                  title="Variantni tahrirlash"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVariantRow(idx)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5"
                                  title="Variantni o‘chirish"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Technical Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t('admin.products.processor')}</label>
                  <input
                    type="text"
                    value={formData.processor}
                    onChange={e => setFormData({ ...formData, processor: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t('admin.products.display')}</label>
                  <input
                    type="text"
                    value={formData.display}
                    onChange={e => setFormData({ ...formData, display: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t('admin.products.camera')}</label>
                  <input
                    type="text"
                    value={formData.camera}
                    onChange={e => setFormData({ ...formData, camera: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t('admin.products.battery')}</label>
                  <input
                    type="text"
                    value={formData.battery}
                    onChange={e => setFormData({ ...formData, battery: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t('admin.products.ram')}</label>
                  <input
                    type="text"
                    value={formData.ram}
                    onChange={e => setFormData({ ...formData, ram: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t('admin.products.storage')}</label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={e => setFormData({ ...formData, storage: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t('admin.products.colors')}</label>
                  <input
                    type="text"
                    value={formData.colorName}
                    onChange={e => setFormData({ ...formData, colorName: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t('admin.products.os')}</label>
                  <input
                    type="text"
                    value={formData.os}
                    onChange={e => setFormData({ ...formData, os: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Checkbox Badges — all start unchecked */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>{t('admin.products.featured')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.bestSeller}
                    onChange={e => setFormData({ ...formData, bestSeller: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>{t('admin.products.bestSeller')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.newArrival}
                    onChange={e => setFormData({ ...formData, newArrival: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>{t('admin.products.newArrival')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.deal}
                    onChange={e => setFormData({ ...formData, deal: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>{t('admin.products.deal')}</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300"
                >
                  {t('admin.btn.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? t('admin.btn.update') : t('admin.btn.save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeleteCandidate(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[#0d0f17] border border-rose-500/30 rounded-3xl p-6 shadow-2xl z-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              {t('admin.products.deleteConfirmTitle')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('admin.products.deleteConfirmDesc')} <strong className="text-white">{deleteCandidate.name}</strong>
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300"
              >
                {t('admin.btn.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase"
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
