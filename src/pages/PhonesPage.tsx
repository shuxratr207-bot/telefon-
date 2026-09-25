import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Smartphone,
  Check,
} from 'lucide-react';
import { Product, Brand } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';

interface PhonesPageProps {
  onNavigate: (path: string) => void;
  initialBrand?: string;
  initialSearch?: string;
}

export const PhonesPage: React.FC<PhonesPageProps> = ({ onNavigate, initialBrand, initialSearch }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2500]);
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [prodRes, brandRes] = await Promise.all([
          api.getProducts(),
          api.getBrands(),
        ]);
        setProducts(prodRes.products);
        setBrands(brandRes.brands);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const ramOptions = ['8GB', '12GB', '16GB', '24GB'];
  const storageOptions = ['128GB', '256GB', '512GB', '1TB'];
  const categoryOptions = ['all', 'Flagship', 'Foldable', 'Gaming', 'Mid Range', 'Budget'];

  const toggleBrand = (brandName: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
    );
  };

  const toggleRam = (ram: string) => {
    setSelectedRam(prev =>
      prev.includes(ram) ? prev.filter(r => r !== ram) : [...prev, ram]
    );
  };

  const toggleStorage = (stg: string) => {
    setSelectedStorage(prev =>
      prev.includes(stg) ? prev.filter(s => s !== stg) : [...prev, stg]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedCategory('all');
    setPriceRange([0, 2500]);
    setSelectedRam([]);
    setSelectedStorage([]);
    setMinRating(0);
    setOnlyInStock(false);
    setSortBy('popular');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedBrands.length > 0 ||
    selectedCategory !== 'all' ||
    priceRange[0] > 0 ||
    priceRange[1] < 2500 ||
    selectedRam.length > 0 ||
    selectedStorage.length > 0 ||
    minRating > 0 ||
    onlyInStock;

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.processor.toLowerCase().includes(q) ||
          p.storage.some(s => s.toLowerCase().includes(q))
      );
    }

    // Brands
    if (selectedBrands.length > 0) {
      result = result.filter(p =>
        selectedBrands.some(b => b.toLowerCase() === p.brand.toLowerCase())
      );
    }

    // Category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Price
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // RAM
    if (selectedRam.length > 0) {
      result = result.filter(p =>
        p.ram.some(r => selectedRam.some(sr => r.toLowerCase().includes(sr.toLowerCase())))
      );
    }

    // Storage
    if (selectedStorage.length > 0) {
      result = result.filter(p =>
        p.storage.some(s => selectedStorage.some(ss => s.toLowerCase().includes(ss.toLowerCase())))
      );
    }

    // Rating
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // In Stock
    if (onlyInStock) {
      result = result.filter(p => p.stock > 0);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
        break;
      case 'popular':
      default:
        result.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return result;
  }, [
    products,
    searchQuery,
    selectedBrands,
    selectedCategory,
    priceRange,
    selectedRam,
    selectedStorage,
    minRating,
    onlyInStock,
    sortBy,
  ]);

  // Sidebar Filter Form Component
  const FilterContent = (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div>
        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2.5">
          Device Category
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {categoryOptions.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2.5">
          Brand
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {brands.map(brand => {
            const isChecked = selectedBrands.includes(brand.name);
            return (
              <label
                key={brand.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer text-sm text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-cyan-500 border-cyan-400 text-black'
                        : 'border-white/20 bg-black/40'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{brand.name}</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {products.filter(p => p.brand.toLowerCase() === brand.name.toLowerCase()).length}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
          <span className="uppercase tracking-wider">Price Range</span>
          <span className="text-cyan-400 font-mono">${priceRange[0]} — ${priceRange[1]}</span>
        </div>
        <input
          type="range"
          min="200"
          max="2500"
          step="50"
          value={priceRange[1]}
          onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-cyan-400 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
          <span>$200</span>
          <span>$1,000</span>
          <span>$2,500</span>
        </div>
      </div>

      {/* RAM Selection */}
      <div>
        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2.5">
          RAM Memory
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {ramOptions.map(ram => {
            const active = selectedRam.includes(ram);
            return (
              <button
                key={ram}
                onClick={() => toggleRam(ram)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  active
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/20'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                }`}
              >
                {ram}
              </button>
            );
          })}
        </div>
      </div>

      {/* Storage Selection */}
      <div>
        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2.5">
          Internal Storage
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {storageOptions.map(stg => {
            const active = selectedStorage.includes(stg);
            return (
              <button
                key={stg}
                onClick={() => toggleStorage(stg)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  active
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/20'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                }`}
              >
                {stg}
              </button>
            );
          })}
        </div>
      </div>

      {/* In-Stock Toggle */}
      <div className="pt-2 border-t border-white/5">
        <label className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer text-sm text-slate-300">
          <span>In Stock Only</span>
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={e => setOnlyInStock(e.target.checked)}
            className="w-4 h-4 rounded accent-cyan-400"
          />
        </label>
      </div>

      {/* Reset button */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="w-full py-2.5 px-4 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span>AUTHENTIC FLAGSHIP CATALOG</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-['Space_Grotesk']">
            Explore All Smartphones
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Compare flagship models across Apple, Samsung, Google, Xiaomi, and more. Filter by processor, display refresh rate, and cameras.
          </p>
        </div>

        {/* Top Control Bar: Search Input, Sorting, Mobile Filter Button */}
        <div className="bg-[#0d0f17] border border-white/10 rounded-2xl p-3 sm:p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search smartphones, brands or features..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
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

          {/* Right Controls: Count, Sort Dropdown & Mobile Trigger */}
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3">
            <span className="text-xs text-slate-400 whitespace-nowrap">
              Showing <strong className="text-white">{filteredProducts.length}</strong> devices
            </span>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="popular" className="bg-[#0d0f17]">Most Popular</option>
                <option value="newest" className="bg-[#0d0f17]">Newest</option>
                <option value="price-asc" className="bg-[#0d0f17]">Price: Low to High</option>
                <option value="price-desc" className="bg-[#0d0f17]">Price: High to Low</option>
                <option value="rating" className="bg-[#0d0f17]">Highest Rated</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-bold"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Main Layout: Desktop Sidebar + Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block col-span-1 bg-[#0d0f17]/80 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-xl sticky top-28">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
            {FilterContent}
          </aside>

          {/* Product Grid / Empty State / Skeletons */}
          <main className="col-span-1 md:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-96 rounded-2xl bg-white/5 border border-white/5 animate-pulse p-4 flex flex-col justify-between"
                  >
                    <div className="h-6 w-24 bg-white/10 rounded-full" />
                    <div className="h-44 w-full bg-white/10 rounded-xl my-4" />
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-white/10 rounded" />
                      <div className="h-3 w-1/2 bg-white/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center bg-[#0d0f17]/50 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-500">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No Smartphones Match Criteria</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-6">
                  Try adjusting your price range, clearing RAM filters or relaxing your brand selection.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28 }}
              className="relative w-full max-w-xs h-full bg-[#0d0f17] border-l border-white/10 p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                    Filters
                  </h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {FilterContent}
              </div>

              <div className="pt-6 border-t border-white/10 mt-6">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold text-xs uppercase"
                >
                  Apply Filters ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
