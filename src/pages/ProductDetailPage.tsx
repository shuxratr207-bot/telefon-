import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  ShoppingCart,
  Heart,
  Scale,
  ShieldCheck,
  Truck,
  Check,
  ChevronRight,
  Cpu,
  Camera,
  Battery,
  Maximize2,
  Award,
  Plus,
  Minus,
} from 'lucide-react';
import { Product, Review } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCompare } from '../context/CompareContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { saveRecentlyViewed } from '../components/home/RecentlyViewedSection.tsx';
import {
  getProductColors,
  getProductStorages,
  getProductRams,
  getProductModels,
  resolveProductVariant,
  normalizeOption,
} from '../utils/variants.ts';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [customImageOverride, setCustomImageOverride] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedRam, setSelectedRam] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'camera' | 'battery' | 'reviews'>('overview');

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    customerName: '',
    rating: 5,
    review: '',
  });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      api.getProductById(productId),
      api.getProducts(),
      api.getReviews(productId),
    ])
      .then(([prod, allProdsRes, revsRes]) => {
        if (!isMounted) return;
        setProduct(prod);
        if (prod) {
          const availColors = getProductColors(prod);
          const availStorages = getProductStorages(prod);
          const availRams = getProductRams(prod);
          const availModels = getProductModels(prod);

          setSelectedImage(0);
          setCustomImageOverride(null);
          setSelectedColor(availColors[0]?.name || 'Qora');
          setSelectedStorage(
            availStorages.find(s => normalizeOption(s) === '256gb') || availStorages[0] || '256 GB'
          );
          setSelectedRam(availRams[0] || '');
          setSelectedModel(
            availModels.find(m => m.toLowerCase().includes('pro max') || m.toLowerCase().includes('ultra')) ||
              availModels[0] ||
              ''
          );
          setQuantity(1);
          saveRecentlyViewed(prod.id);

          const related = allProdsRes.products
            .filter(
              (p) =>
                p.id !== prod.id && (p.brand === prod.brand || p.category === prod.category)
            )
            .slice(0, 4);
          setRelatedProducts(related);
        }
        setReviews(revsRes.reviews);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Keyboard-friendly gallery navigation on desktop
  useEffect(() => {
    if (!product || !product.images?.length) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowRight') {
        setCustomImageOverride(null);
        setSelectedImage((prev) => (prev + 1) % product.images.length);
      } else if (e.key === 'ArrowLeft') {
        setCustomImageOverride(null);
        setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product]);

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-[480px] rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
          <div className="space-y-6">
            <div className="h-8 w-40 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-12 w-3/4 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-24 w-full bg-white/5 rounded-2xl animate-pulse" />
            <div className="h-48 w-full bg-white/5 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-['Space_Grotesk'] font-bold text-white mb-4">
          {t('detail.notFound')}
        </h2>
        <button
          onClick={() => onNavigate('/phones')}
          className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-bold"
        >
          {t('detail.backToCatalog')}
        </button>
      </div>
    );
  }

  const availableColors = getProductColors(product);
  const availableStorages = getProductStorages(product);
  const availableRams = getProductRams(product);
  const availableModels = getProductModels(product);

  const resolvedVariant = resolveProductVariant(product, {
    color: selectedColor,
    storage: selectedStorage,
    ram: selectedRam,
    model: selectedModel,
  });

  const finalPrice = resolvedVariant.price;
  const finalOldPrice = resolvedVariant.oldPrice;
  const variantStock = resolvedVariant.stock;
  const isOutOfStock = variantStock <= 0;

  const hasDiscount = Boolean(
    finalOldPrice && finalOldPrice > finalPrice
  );
  const discountPercent = hasDiscount && finalOldPrice
    ? Math.round(((finalOldPrice - finalPrice) / finalOldPrice) * 100)
    : product.discount || 0;
  const monthlyInstallment = Math.round(finalPrice / 12);

  // Determine main image to display: color/variant image unless user clicked a specific thumbnail
  const activeDisplayImage =
    customImageOverride || resolvedVariant.image || product.images[selectedImage] || product.images[0];

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    const nextResolved = resolveProductVariant(product, {
      color: colorName,
      storage: selectedStorage,
      ram: selectedRam,
      model: selectedModel,
    });
    if (nextResolved.image) {
      setCustomImageOverride(nextResolved.image);
      const matchingThumbIdx = product.images.findIndex(img => img === nextResolved.image);
      if (matchingThumbIdx !== -1) {
        setSelectedImage(matchingThumbIdx);
      }
    }
    if (nextResolved.stock > 0 && quantity > nextResolved.stock) {
      setQuantity(nextResolved.stock);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    await addToCart(product, {
      color: selectedColor,
      storage: selectedStorage,
      ram: selectedRam || undefined,
      model: selectedModel || undefined,
      price: finalPrice,
      stock: variantStock,
      image: activeDisplayImage,
      quantity: Math.min(variantStock, quantity),
    });
    const configLabel = [selectedColor, selectedStorage, selectedRam, selectedModel]
      .filter(Boolean)
      .join(' • ');
    showToast(
      `${quantity}x ${product.name} (${configLabel}) — ${t('product.addedToCart')}`,
      'success'
    );
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await addToCart(product, {
      color: selectedColor,
      storage: selectedStorage,
      ram: selectedRam || undefined,
      model: selectedModel || undefined,
      price: finalPrice,
      stock: variantStock,
      image: activeDisplayImage,
      quantity: Math.min(variantStock, quantity),
    });
    onNavigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.customerName || !reviewForm.review) return;
    try {
      const created = await api.createReview({
        productId: product.id,
        customerName: reviewForm.customerName,
        rating: reviewForm.rating,
        review: reviewForm.review,
      });
      setReviews([created, ...reviews]);
      setReviewForm({ customerName: '', rating: 5, review: '' });
      showToast('Sharhingiz muvaffaqiyatli qo‘shildi!', 'success');
    } catch {
      showToast(t('admin.state.error'), 'error');
    }
  };

  return (
    <div className="min-h-screen pb-28 lg:pb-20">
      {/* Breadcrumb */}
      <div className="border-b border-white/5 bg-[#080C18]/60">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center gap-2 text-xs text-slate-400 overflow-x-auto whitespace-nowrap">
          <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
            {t('nav.home')}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <button onClick={() => onNavigate('/phones')} className="hover:text-white transition-colors">
            {t('nav.phones')}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <button
            onClick={() => onNavigate(`/phones?brand=${product.brand}`)}
            className="hover:text-white transition-colors"
          >
            {product.brand}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-white font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10">
        {/* Main Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 mb-16">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] sm:aspect-square rounded-[2rem] bg-gradient-to-b from-[#11192E] to-[#0A0F1D] border border-white/10 overflow-hidden flex items-center justify-center p-6 sm:p-12 group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12),transparent_70%)]" />
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeDisplayImage}
                  src={activeDisplayImage}
                  alt={`${product.name} - ${selectedColor}`}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="w-full h-full object-contain rounded-2xl relative z-10 group-hover:scale-105 transition-transform duration-500"
                />
              </AnimatePresence>

              {/* Top Left Badges */}
              <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                {hasDiscount && discountPercent > 0 && (
                  <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg">
                    -{discountPercent}% {t('product.hotDeal')}
                  </span>
                )}
                {product.newArrival && (
                  <span className="px-3 py-1 rounded-full bg-cyan-500 text-black text-xs font-extrabold uppercase tracking-wider shadow-lg">
                    {t('product.new')}
                  </span>
                )}
                {selectedColor && (
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-slate-200 text-[11px] font-semibold">
                    {selectedColor}
                  </span>
                )}
              </div>

              {/* Top Right Actions */}
              <div className="absolute top-5 right-5 z-20 flex flex-col gap-2.5">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
                    isInWishlist(product.id)
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : 'bg-black/40 border-white/15 text-slate-300 hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-rose-400' : ''}`} />
                </button>
                <button
                  onClick={() =>
                    isInCompare(product.id)
                      ? removeFromCompare(product.id)
                      : addToCompare(product)
                  }
                  className={`w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
                    isInCompare(product.id)
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                      : 'bg-black/40 border-white/15 text-slate-300 hover:text-white'
                  }`}
                >
                  <Scale className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {product.images.map((img, i) => {
                const isThumbActive = activeDisplayImage === img || (!customImageOverride && selectedImage === i);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedImage(i);
                      setCustomImageOverride(img);
                    }}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 p-2 bg-[#0d0f17] transition-all ${
                      isThumbActive
                        ? 'border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain rounded-xl" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Configuration & Purchase */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Brand & Rating */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold uppercase tracking-widest text-cyan-400">
                    {product.brand}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                    {product.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="text-sm font-bold text-white">{product.rating}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    ({reviews.length || product.reviews} {t('product.reviews')})
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-['Space_Grotesk'] font-extrabold text-white tracking-tight mb-3">
                {product.name}
              </h1>

              {/* Active Variant Configuration Summary Pill */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {[selectedColor, selectedStorage, selectedRam, selectedModel]
                  .filter(Boolean)
                  .map((chip, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-semibold text-cyan-300"
                    >
                      {chip}
                    </span>
                  ))}
              </div>

              {/* Description */}
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Price & Variant Stock Box */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#0E1526] to-indigo-950/30 border border-white/10 mb-6">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-['Space_Grotesk'] font-extrabold text-white tabular-nums">
                        ${finalPrice.toLocaleString()}
                      </span>
                      {hasDiscount && finalOldPrice && (
                        <span className="text-lg text-slate-500 line-through tabular-nums">
                          ${finalOldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cyan-400 font-medium mt-1">
                      {t('detail.installment')}{' '}
                      <span className="text-white font-bold">${monthlyInstallment.toLocaleString()}</span>{' '}
                      {t('detail.perMonth')}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          !isOutOfStock ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                        }`}
                      />
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          !isOutOfStock ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {!isOutOfStock
                          ? `${t('product.inStock')} (${variantStock} dona)`
                          : 'Tugagan'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {selectedColor} {selectedStorage ? `+ ${selectedStorage}` : ''} →{' '}
                      <strong className={!isOutOfStock ? 'text-white' : 'text-rose-400'}>
                        {!isOutOfStock ? `${variantStock} dona` : '0 dona (Tugagan)'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. Rang (Color Selector) */}
              {availableColors.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Rang: <span className="text-white">{selectedColor}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {availableColors.map((color) => {
                      const isSelected = normalizeOption(selectedColor) === normalizeOption(color.name);
                      const colorVar = resolveProductVariant(product, {
                        color: color.name,
                        storage: selectedStorage,
                        ram: selectedRam,
                        model: selectedModel,
                      });
                      const colorOut = colorVar.stock <= 0;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => handleColorSelect(color.name)}
                          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-400/50'
                              : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-white/30 shadow-inner shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.name}</span>
                          {colorOut && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                              Tugagan
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Xotira (Storage Selector) */}
              {availableStorages.length > 0 && (
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Xotira: <span className="text-white">{selectedStorage}</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {availableStorages.map((storage) => {
                      const isSelected = normalizeOption(selectedStorage) === normalizeOption(storage);
                      const previewVar = resolveProductVariant(product, {
                        color: selectedColor,
                        storage,
                        ram: selectedRam,
                        model: selectedModel,
                      });
                      return (
                        <button
                          key={storage}
                          type="button"
                          onClick={() => {
                            setSelectedStorage(storage);
                            if (previewVar.stock > 0 && quantity > previewVar.stock) {
                              setQuantity(previewVar.stock);
                            }
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                              : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs sm:text-sm font-extrabold">{storage}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                          </div>
                          <div className="flex items-center justify-between w-full mt-1">
                            <span className="text-[11px] font-mono text-cyan-400 font-bold">
                              ${previewVar.price.toLocaleString()}
                            </span>
                            <span
                              className={`text-[10px] font-semibold ${
                                previewVar.stock > 0 ? 'text-slate-400' : 'text-rose-400'
                              }`}
                            >
                              {previewVar.stock > 0 ? `${previewVar.stock} dona` : 'Tugagan'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Tezkor xotira (RAM) & 4. Versiya (Model/Version) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {availableRams.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Tezkor xotira (RAM): <span className="text-white">{selectedRam}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableRams.map((ram) => {
                        const isSelected = normalizeOption(selectedRam) === normalizeOption(ram);
                        return (
                          <button
                            key={ram}
                            type="button"
                            onClick={() => setSelectedRam(ram)}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/25'
                                : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                            }`}
                          >
                            {ram}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {availableModels.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Versiya: <span className="text-white">{selectedModel}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableModels.map((modelName) => {
                        const isSelected = normalizeOption(selectedModel) === normalizeOption(modelName);
                        return (
                          <button
                            key={modelName}
                            type="button"
                            onClick={() => setSelectedModel(modelName)}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/25'
                                : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                            }`}
                          >
                            {modelName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity & CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                <div className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 sm:w-36">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-['Space_Grotesk'] font-bold text-white">
                    {isOutOfStock ? 0 : quantity}
                  </span>
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setQuantity(Math.min(variantStock || 1, quantity + 1))}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
                    isOutOfStock
                      ? 'bg-slate-800 text-rose-400 border border-rose-500/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white shadow-xl shadow-cyan-500/25 cursor-pointer'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Tugagan' : t('product.addToCart')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`py-4 px-6 rounded-xl font-bold text-sm transition-all ${
                    isOutOfStock
                      ? 'bg-slate-900 text-slate-500 border border-white/10 cursor-not-allowed opacity-50'
                      : 'bg-white text-slate-950 hover:bg-cyan-50 cursor-pointer'
                  }`}
                >
                  {t('product.buyNow')}
                </button>
              </div>
            </div>

            {/* Delivery & Trust Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <Truck className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white">{t('trust.deliveryTitle')}</div>
                  <div className="text-slate-400">{t('detail.deliveryInfo')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white">{t('trust.warrantyTitle')}</div>
                  <div className="text-slate-400">{t('detail.warrantyInfo')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Hardware Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            { icon: Maximize2, label: t('detail.specDisplay'), value: product.display },
            { icon: Cpu, label: t('detail.specProcessor'), value: product.processor },
            { icon: Camera, label: t('detail.specMainCam'), value: product.camera },
            { icon: Battery, label: t('detail.specBattery'), value: product.battery },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#0d0f17]/90 border border-white/10 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    {item.label}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white">{item.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Tabs Section */}
        <div className="mb-16">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 mb-8">
            {[
              { id: 'overview', label: t('detail.tabOverview') },
              { id: 'specs', label: t('detail.tabSpecs') },
              { id: 'camera', label: t('detail.tabCamera') },
              { id: 'battery', label: t('detail.tabBattery') },
              { id: 'reviews', label: `${t('detail.tabReviews')} (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#0d0f17]/80 border border-white/10 space-y-4">
                <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white">
                  {product.name} — Flagman Imkoniyatlari
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {product.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  {[
                    `Eng yangi ${product.processor} flagman protsessori`,
                    `Professional ${product.camera} kamera tizimi`,
                    `${product.display} yuqori aniqlikdagi displey`,
                    `Rasmiy 1 yillik NOVA MOBILE kafolati`,
                  ].map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cyan-950/40 to-indigo-950/30 border border-cyan-500/20 flex flex-col justify-between">
                <div>
                  <Award className="w-10 h-10 text-cyan-400 mb-4" />
                  <h4 className="text-lg font-['Space_Grotesk'] font-bold text-white mb-2">
                    100% Original va Muhrlangan Qadoq
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    NOVA MOBILE do‘konidagi barcha smartfonlar IMEI ro‘yxatidan o‘tgan va zavod plombasiga ega.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-xs text-cyan-300 font-semibold">
                  SKU: {product.sku || `NV-${product.id}`}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="rounded-3xl bg-[#0d0f17]/90 border border-white/10 overflow-hidden">
              <div className="divide-y divide-white/5">
                {[
                  { label: t('detail.specDisplay'), value: product.display },
                  { label: t('detail.specRefresh'), value: product.refreshRate || '120Hz' },
                  { label: t('detail.specProcessor'), value: product.processor },
                  { label: 'Ranglar', value: availableColors.map(c => c.name).join(', ') },
                  { label: t('detail.specRam'), value: availableRams.join(', ') },
                  { label: t('detail.specStorage'), value: availableStorages.join(', ') },
                  ...(availableModels.length > 0 ? [{ label: 'Versiyalar', value: availableModels.join(', ') }] : []),
                  { label: t('detail.specMainCam'), value: product.camera },
                  { label: t('detail.specBattery'), value: product.battery },
                  { label: t('detail.specCharging'), value: product.charging || 'Fast Charging' },
                  { label: t('detail.specOs'), value: product.os || 'Flagship OS' },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {row.label}
                    </span>
                    <span className="sm:col-span-2 text-sm font-medium text-white mt-1 sm:mt-0">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0f17]/90 border border-white/10">
              <h4 className="text-lg font-bold text-white mb-2">{t('detail.specMainCam')}</h4>
              <p className="text-cyan-400 font-['Space_Grotesk'] font-bold text-xl mb-3">
                {product.camera}
              </p>
              <p className="text-sm text-slate-400">
                Optik stabilizatsiya (OIS), tungi portret rejimi va 8K/4K 60fps kinematografik video tasvirga olish imkoniyati.
              </p>
            </div>
          )}

          {activeTab === 'battery' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0f17]/90 border border-white/10">
              <h4 className="text-lg font-bold text-white mb-2">{t('detail.specBattery')}</h4>
              <p className="text-emerald-400 font-['Space_Grotesk'] font-bold text-2xl mb-2">
                {product.battery}
              </p>
              <p className="text-sm text-slate-400">
                Kun davomida faol foydalanish va intellektual energiya tejash algoritmi.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                {reviews.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#0d0f17] border border-white/10 text-center text-slate-400">
                    {t('admin.state.noReviews')}
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-6 rounded-2xl bg-[#0d0f17]/90 border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{rev.customerName}</span>
                        <span className="text-xs text-slate-500">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${idx < rev.rating ? 'fill-amber-400' : 'text-slate-700'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{rev.review}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Write Review Form */}
              <form
                onSubmit={handleReviewSubmit}
                className="lg:col-span-5 p-6 rounded-2xl bg-[#0d0f17] border border-white/10 space-y-4 h-fit"
              >
                <h4 className="text-lg font-['Space_Grotesk'] font-bold text-white">
                  {t('detail.writeReview')}
                </h4>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('checkout.fullName')}</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.customerName}
                    onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('detail.yourRating')}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`p-2 rounded-lg border ${
                          reviewForm.rating >= star
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'border-white/10 text-slate-500'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('detail.reviewComment')}</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-colors"
                >
                  {t('detail.submitReview')}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="text-2xl font-['Space_Grotesk'] font-extrabold text-white mb-6">
              {t('detail.relatedTitle')}
            </h3>
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="w-[78vw] max-w-[300px] sm:w-auto sm:max-w-none shrink-0 snap-start"
                >
                  <ProductCard product={rel} onNavigate={onNavigate} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Purchase Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#090D16]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={activeDisplayImage}
            alt={product.name}
            className="w-11 h-11 rounded-xl object-contain bg-white/5 p-1 border border-white/10 shrink-0"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">{product.name}</div>
            <div className="text-base font-['Space_Grotesk'] font-extrabold text-cyan-400">
              ${finalPrice.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              isOutOfStock
                ? 'bg-slate-800 text-rose-400 border border-rose-500/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Tugagan' : t('product.addToCart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
