import React, { useState, useEffect, useMemo } from 'react';
import {
  SlidersHorizontal,
  Search,
  X,
  RotateCcw,
  Star,
  AlertCircle,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface PhonesPageProps {
  initialBrand?: string;
  initialSearch?: string;
  initialSort?: string;
  onNavigate: (path: string) => void;
}

export const PhonesPage: React.FC<PhonesPageProps> = ({
  initialBrand = '',
  initialSearch = '',
  initialSort = 'popular',
  onNavigate,
}) => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(3);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    initialBrand ? [initialBrand] : []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [selectedRam, setSelectedRam] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedOs, setSelectedOs] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>(initialSort || 'popular');

  const fetchCatalog = () => {
    setLoading(true);
    setError(false);
    api
      .getProducts()
      .then((res) => {
        setProducts(res.products);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (initialBrand) setSelectedBrands([initialBrand]);
  }, [initialBrand]);

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  const brandsList = ['Apple', 'Samsung', 'Xiaomi', 'Google', 'OnePlus', 'Nothing', 'Honor', 'Huawei'];
  const categoriesList = [
    { value: 'Flagship', label: 'Flagman' },
    { value: 'Foldable', label: 'Bukiluvchan' },
    { value: 'Gaming', label: 'O‘yin uchun' },
    { value: 'Mid Range', label: 'O‘rta sinf' },
    { value: 'Budget', label: 'Hamyonbop' },
  ];
  const ramList = ['8 GB', '12 GB', '16 GB', '24 GB'];
  const storageList = ['128 GB', '256 GB', '512 GB', '1 TB'];
  const colorList = ['Qora', 'Oq', 'Ko‘k', 'Tabiiy titan', 'Binafsha', 'Zumrad yashil', 'Kumush', 'Oltin'];
  const osList = ['iOS', 'Android'];

  const normAttr = (val?: string) => (val || '').toLowerCase().replace(/\s+/g, '').replace(/ram$/i, '').trim();

  const toggleArrayFilter = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedCategories([]);
    setMaxPrice(2500);
    setSelectedRam('');
    setSelectedStorage('');
    setSelectedColor('');
    setSelectedOs('');
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('popular');
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const qNorm = normAttr(q);
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchSpec =
            (p.processor || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.storage || []).some((s) => normAttr(s).includes(qNorm)) ||
            (p.ram || []).some((r) => normAttr(r).includes(qNorm)) ||
            (p.colors || []).some((c) => c.name.toLowerCase().includes(q)) ||
            (p.variants || []).some(
              (v) =>
                (v.color && v.color.toLowerCase().includes(q)) ||
                (v.storage && normAttr(v.storage).includes(qNorm)) ||
                (v.ram && normAttr(v.ram).includes(qNorm))
            );
          if (!matchName && !matchBrand && !matchSpec) return false;
        }
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
        if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
        if (p.price > maxPrice) return false;
        if (selectedRam) {
          const targetRam = normAttr(selectedRam);
          const hasRam =
            (p.ram || []).some((r) => normAttr(r) === targetRam || normAttr(r).includes(targetRam)) ||
            (p.variants || []).some((v) => v.ram && normAttr(v.ram) === targetRam);
          if (!hasRam) return false;
        }
        if (selectedStorage) {
          const targetStorage = normAttr(selectedStorage);
          const hasStorage =
            (p.storage || []).some((s) => normAttr(s) === targetStorage) ||
            (p.variants || []).some((v) => v.storage && normAttr(v.storage) === targetStorage);
          if (!hasStorage) return false;
        }
        if (selectedColor) {
          const targetColor = normAttr(selectedColor);
          const hasColor =
            (p.colors || []).some((c) => normAttr(c.name).includes(targetColor)) ||
            (p.variants || []).some((v) => v.color && normAttr(v.color).includes(targetColor));
          if (!hasColor) return false;
        }
        if (selectedOs && !(p.os || '').toLowerCase().includes(selectedOs.toLowerCase()))
          return false;
        if (minRating > 0 && p.rating < minRating) return false;
        if (inStockOnly && p.stock <= 0) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          case 'newest':
            return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
          default:
            return b.reviews - a.reviews;
        }
      });
  }, [
    products,
    searchQuery,
    selectedBrands,
    selectedCategories,
    maxPrice,
    selectedRam,
    selectedStorage,
    selectedColor,
    selectedOs,
    minRating,
    inStockOnly,
    sortBy,
  ]);

  const FilterPanelContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 font-['Space_Grotesk'] font-bold text-white">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span>{t('catalog.filters')}</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t('catalog.clearAll')}</span>
        </button>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {t('catalog.brand')}
        </h4>
        <div className="space-y-2">
          {brandsList.map((brand) => (
            <label
              key={brand}
              className="flex items-center justify-between cursor-pointer group text-sm"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() =>
                    toggleArrayFilter(selectedBrands, brand, setSelectedBrands)
                  }
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-cyan-500"
                />
                <span className="text-slate-300 group-hover:text-white transition-colors">
                  {brand}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                ({products.filter((p) => p.brand === brand).length})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('catalog.priceRange')}
          </h4>
          <span className="text-xs font-bold text-cyan-400">${maxPrice.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={200}
          max={2500}
          step={50}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
          <span>$200</span>
          <span>$2,500</span>
        </div>
      </div>

      {/* Category */}
      <div className="pt-4 border-t border-white/10">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {t('admin.products.category')}
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {categoriesList.map((cat) => (
            <button
              key={cat.value}
              onClick={() =>
                toggleArrayFilter(selectedCategories, cat.value, setSelectedCategories)
              }
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCategories.includes(cat.value)
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/25'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* RAM */}
      <div className="pt-4 border-t border-white/10">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {t('catalog.ram')}
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {ramList.map((ram) => (
            <button
              key={ram}
              onClick={() => setSelectedRam(selectedRam === ram ? '' : ram)}
              className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedRam === ram
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {ram}
            </button>
          ))}
        </div>
      </div>

      {/* Storage */}
      <div className="pt-4 border-t border-white/10">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {t('catalog.storage')}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {storageList.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStorage(selectedStorage === st ? '' : st)}
              className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedStorage === st
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                  : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Color (Rang) */}
      <div className="pt-4 border-t border-white/10">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Rang
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {colorList.map((col) => (
            <button
              key={col}
              onClick={() => setSelectedColor(selectedColor === col ? '' : col)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedColor === col
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* Operating System */}
      <div className="pt-4 border-t border-white/10">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {t('catalog.os')}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {osList.map((os) => (
            <button
              key={os}
              onClick={() => setSelectedOs(selectedOs === os ? '' : os)}
              className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedOs === os
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {os}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="pt-4 border-t border-white/10">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {t('catalog.rating')}
        </h4>
        <div className="flex gap-2">
          {[4.5, 4.7, 4.9].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(minRating === r ? 0 : r)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                minRating === r
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-white/[0.02] border-white/10 text-slate-400'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{r}+</span>
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="pt-4 border-t border-white/10">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-slate-300">{t('catalog.inStockOnly')}</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-cyan-500"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Page Header */}
        <div className="mb-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#0D1326] to-[#130F26] border border-white/10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-2">
              {t('catalog.badge')}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-['Space_Grotesk'] font-extrabold text-white tracking-tight mb-2">
              {t('catalog.title')}
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">{t('catalog.subtitle')}</p>
          </div>
        </div>

        {/* Top Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#0d0f17] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-semibold text-white"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>{t('catalog.filters')}</span>
            </button>

            <span className="text-xs sm:text-sm text-slate-400">
              {t('catalog.showing')}{' '}
              <strong className="text-white">{filteredProducts.length}</strong>{' '}
              {t('catalog.devices')}
            </span>

            {/* Desktop Column Density Toggle */}
            <div className="hidden xl:flex items-center gap-1 p-1 rounded-xl bg-[#0d0f17] border border-white/10">
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 rounded-lg transition-colors ${
                  gridCols === 3 ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
                title="3 Columns"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 rounded-lg transition-colors ${
                  gridCols === 4 ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
                title="4 Columns"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">
                {t('catalog.sortBy')}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#0d0f17] border border-white/10 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="popular">{t('catalog.sortPopular')}</option>
                <option value="newest">{t('catalog.sortNewest')}</option>
                <option value="price-asc">{t('catalog.sortPriceAsc')}</option>
                <option value="price-desc">{t('catalog.sortPriceDesc')}</option>
                <option value="rating">{t('catalog.sortRating')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
            <div className="p-6 rounded-3xl bg-[#0d0f17]/90 border border-white/10 sticky top-24">
              <FilterPanelContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[430px] rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse p-5 flex flex-col justify-between"
                  >
                    <div className="aspect-[4/3] rounded-xl bg-white/5" />
                    <div className="space-y-3">
                      <div className="h-4 w-24 bg-white/5 rounded" />
                      <div className="h-6 w-48 bg-white/5 rounded" />
                      <div className="h-10 w-full bg-white/5 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-12 rounded-3xl bg-[#0d0f17]/80 border border-rose-500/20 text-center max-w-md mx-auto my-8">
                <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                <p className="text-white font-semibold mb-4">{t('product.errorLoading')}</p>
                <button
                  onClick={fetchCatalog}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold"
                >
                  {t('product.retry')}
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 sm:p-16 rounded-3xl bg-[#0d0f17]/60 border border-white/10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-cyan-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white mb-2">
                  {t('catalog.noResults')}
                </h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                  {t('catalog.noResultsSub')}
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold transition-colors"
                >
                  {t('catalog.resetFilters')}
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                  gridCols === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'
                } gap-6`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative z-10 w-80 max-w-[85vw] bg-[#0B0F19] h-full overflow-y-auto p-6 border-l border-white/10 ml-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="font-['Space_Grotesk'] font-bold text-lg text-white">
                {t('catalog.filters')}
              </span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanelContent />
            <div className="mt-8 pt-4 border-t border-white/10">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold text-sm"
              >
                {t('admin.btn.confirm')} ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
