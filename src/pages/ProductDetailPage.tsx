import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Shield,
  Truck,
  RotateCcw,
  Heart,
  Layers,
  ShoppingBag,
  ArrowRight,
  Minus,
  Plus,
  Cpu,
  Battery,
  Camera,
  Layers as DisplayIcon,
  Check,
  Send,
  Sparkles,
  Share2,
} from 'lucide-react';
import { Product, Review } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCompare } from '../context/CompareContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onNavigate }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Configuration options
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedRam, setSelectedRam] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'camera' | 'battery' | 'reviews'>('overview');

  // New review form
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      try {
        const prod = await api.getProductById(productId);
        setProduct(prod);
        setSelectedColorIndex(0);
        setSelectedImageIndex(0);
        if (prod.storage && prod.storage.length > 0) setSelectedStorage(prod.storage[0]);
        if (prod.ram && prod.ram.length > 0) setSelectedRam(prod.ram[0]);

        // Track recently viewed
        try {
          const viewed = JSON.parse(localStorage.getItem('nova_recently_viewed') || '[]');
          const updated = [prod.id, ...viewed.filter((id: string) => id !== prod.id)].slice(0, 10);
          localStorage.setItem('nova_recently_viewed', JSON.stringify(updated));
        } catch {}

        // Fetch reviews
        const revRes = await api.getReviews(productId);
        setReviews(revRes.reviews.filter(r => r.status === 'approved'));
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-32 pb-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading flagship specs...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-32 pb-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Smartphone Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">The requested device is no longer available in our catalogue.</p>
        <button
          onClick={() => onNavigate('/phones')}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const currentColor = product.colors?.[selectedColorIndex];
  // If color has special image, prioritize it, otherwise display chosen thumbnail
  const currentDisplayImage = currentColor?.image || product.images[selectedImageIndex] || product.images[0];

  const isFavorite = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const handleColorChange = (index: number) => {
    setSelectedColorIndex(index);
    // Smooth image switch
    if (product.colors[index]?.image) {
      const imgIdx = product.images.indexOf(product.colors[index].image!);
      if (imgIdx > -1) setSelectedImageIndex(imgIdx);
    }
  };

  const handleAddToCart = async () => {
    await addToCart(product, {
      color: currentColor?.name,
      storage: selectedStorage,
      ram: selectedRam,
      quantity,
    });
    showToast(`Added ${quantity}x ${product.name} to cart!`, 'success');
  };

  const handleBuyNow = async () => {
    await addToCart(product, {
      color: currentColor?.name,
      storage: selectedStorage,
      ram: selectedRam,
      quantity,
    });
    onNavigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) {
      showToast('Please provide your name and review text.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const created = await api.createReview({
        productId: product.id,
        rating: reviewerRating,
        review: reviewerComment,
        customerName: reviewerName,
      });
      setReviews([created, ...reviews]);
      setReviewerComment('');
      setReviewerName('');
      showToast('Review submitted and published successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <button onClick={() => onNavigate('/')} className="hover:text-slate-300">
            Home
          </button>
          <span>/</span>
          <button onClick={() => onNavigate('/phones')} className="hover:text-slate-300">
            Smartphones
          </button>
          <span>/</span>
          <button onClick={() => onNavigate(`/phones?brand=${product.brand}`)} className="hover:text-slate-300">
            {product.brand}
          </button>
          <span>/</span>
          <span className="text-slate-300 truncate max-w-xs">{product.name}</span>
        </div>

        {/* Top Product Presentation: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          {/* Left Column: Image Gallery & Thumbnails */}
          <div className="lg:col-span-6 space-y-4">
            {/* Big Main Stage */}
            <div className="relative rounded-3xl bg-[#0d0f17] border border-white/10 p-8 sm:p-12 h-[420px] sm:h-[500px] flex items-center justify-center overflow-hidden shadow-2xl">
              {/* Radial glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-indigo-500/10 pointer-events-none" />

              <motion.img
                key={currentDisplayImage}
                src={currentDisplayImage}
                alt={product.name}
                initial={{ opacity: 0.6, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
              />

              {/* Badges on Main Image */}
              <div className="absolute top-4 left-4 flex gap-2">
                {product.deal && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Flash Deal
                  </span>
                )}
                {product.newArrival && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    2026 Model
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl bg-[#0d0f17] border p-2 shrink-0 flex items-center justify-center transition-all ${
                    selectedImageIndex === idx
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30'
                      : 'border-white/10 hover:border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} angle ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Information, Selectors & Purchasing */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
                  {product.brand} • {product.category}
                </span>
                <span className="text-xs font-mono text-slate-500">SKU: {product.sku}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk'] mt-1">
                {product.name}
              </h1>

              {/* Rating & Reviews summary */}
              <div className="flex items-center gap-3 mt-3 text-sm">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 font-bold text-white">{product.rating}</span>
                </div>
                <span className="text-slate-500">•</span>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-cyan-400 hover:underline"
                >
                  {reviews.length || product.reviews} Verified Reviews
                </button>
              </div>
            </div>

            {/* Price section */}
            <div className="p-4 rounded-2xl bg-[#0d0f17] border border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-white">
                    ${product.price.toLocaleString()}
                  </span>
                  {product.oldPrice > product.price && (
                    <span className="text-base text-slate-500 line-through">
                      ${product.oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tax included. Eligible for 0% APR installment financing.
                </p>
              </div>
              {product.discount > 0 && (
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    SAVE ${product.oldPrice - product.price}
                  </span>
                </div>
              )}
            </div>

            {/* Color Selector with Smooth Switch */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-2.5">
                  <span>Selected Finish:</span>
                  <span className="text-cyan-400">{currentColor?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {product.colors.map((color, idx) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorChange(idx)}
                      className={`group relative p-1 rounded-full transition-all ${
                        selectedColorIndex === idx
                          ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#090a0f]'
                          : 'hover:scale-105'
                      }`}
                      title={color.name}
                    >
                      <div
                        className="w-7 h-7 rounded-full shadow-inner border border-white/20"
                        style={{ backgroundColor: color.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Storage Selection */}
            {product.storage && product.storage.length > 0 && (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-2.5">
                  <span>Internal Capacity:</span>
                  <span className="text-cyan-400">{selectedStorage}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.storage.map(cap => (
                    <button
                      key={cap}
                      onClick={() => setSelectedStorage(cap)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        selectedStorage === cap
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RAM Options */}
            {product.ram && product.ram.length > 0 && (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-2.5">
                  <span>RAM Configuration:</span>
                  <span className="text-cyan-400">{selectedRam}</span>
                </div>
                <div className="flex gap-2">
                  {product.ram.map(r => (
                    <button
                      key={r}
                      onClick={() => setSelectedRam(r)}
                      className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all ${
                        selectedRam === r
                          ? 'bg-indigo-950/60 border-indigo-400 text-indigo-300'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Stock Notice */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-white/15 rounded-xl bg-black/40 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs">
                {product.stock > 0 ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    In Stock ({product.stock} units ready for immediate dispatch)
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Action Buttons: Add to Cart, Buy Now, Wishlist, Compare */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  <span>ADD TO CART</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>BUY NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Auxiliary Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    toggleWishlist(product);
                    showToast(
                      isFavorite ? 'Removed from wishlist' : 'Saved to wishlist',
                      'info'
                    );
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isFavorite
                      ? 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
                  <span>{isFavorite ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <button
                  onClick={() => {
                    if (isCompared) {
                      removeFromCompare(product.id);
                      showToast('Removed from compare', 'info');
                    } else {
                      const ok = addToCompare(product);
                      if (ok) showToast('Added to comparison matrix', 'success');
                      else showToast('Comparison list full (max 3)', 'error');
                    }
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isCompared
                      ? 'bg-indigo-500/30 border-indigo-500/40 text-indigo-300'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>{isCompared ? 'Compared' : 'Compare Device'}</span>
                </button>
              </div>
            </div>

            {/* Guarantees Box */}
            <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-[#0d0f17]/60 border border-white/5 text-center text-xs">
              <div className="space-y-1">
                <Shield className="w-4 h-4 text-cyan-400 mx-auto" />
                <p className="font-bold text-white">2-Yr Warranty</p>
                <p className="text-[10px] text-slate-500">Official coverage</p>
              </div>
              <div className="space-y-1">
                <Truck className="w-4 h-4 text-blue-400 mx-auto" />
                <p className="font-bold text-white">Fast Delivery</p>
                <p className="text-[10px] text-slate-500">Dispatched in 24h</p>
              </div>
              <div className="space-y-1">
                <RotateCcw className="w-4 h-4 text-indigo-400 mx-auto" />
                <p className="font-bold text-white">14-Day Return</p>
                <p className="text-[10px] text-slate-500">Hassle-free policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Overview, Specifications, Camera, Battery, Reviews */}
        <div className="border-t border-white/10 pt-10">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-4 no-scrollbar">
            {(['overview', 'specs', 'camera', 'battery', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                  activeTab === tab
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'specs'
                  ? 'Specifications'
                  : tab === 'camera'
                  ? 'Pro Optics'
                  : tab === 'battery'
                  ? 'Endurance'
                  : tab === 'reviews'
                  ? `Reviews (${reviews.length})`
                  : 'Overview'}
              </button>
            ))}
          </div>

          {/* Tab Panes */}
          <div className="py-8">
            {/* 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 max-w-4xl">
                <div>
                  <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-3">
                    Engineered Beyond Compromise
                  </h3>
                  <p className="text-base text-slate-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div className="p-5 rounded-2xl bg-[#0d0f17] border border-white/10 space-y-2">
                    <Cpu className="w-6 h-6 text-cyan-400" />
                    <h4 className="font-bold text-sm text-white">Silicon Architecture</h4>
                    <p className="text-xs text-slate-400">{product.processor}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#0d0f17] border border-white/10 space-y-2">
                    <DisplayIcon className="w-6 h-6 text-blue-400" />
                    <h4 className="font-bold text-sm text-white">Display Supremacy</h4>
                    <p className="text-xs text-slate-400">{product.display}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#0d0f17] border border-white/10 space-y-2">
                    <Battery className="w-6 h-6 text-emerald-400" />
                    <h4 className="font-bold text-sm text-white">Power &amp; Thermal</h4>
                    <p className="text-xs text-slate-400">{product.battery}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SPECIFICATIONS TABLE */}
            {activeTab === 'specs' && (
              <div className="max-w-4xl bg-[#0d0f17] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="divide-y divide-white/5 text-sm">
                  {[
                    { label: 'Display', value: product.display },
                    { label: 'Refresh Rate', value: product.refreshRate || '120Hz LTPO' },
                    { label: 'Processor', value: product.processor },
                    { label: 'RAM', value: product.ram.join(', ') },
                    { label: 'Storage', value: product.storage.join(', ') },
                    { label: 'Camera Array', value: product.camera },
                    { label: 'Battery Capacity', value: product.battery },
                    { label: 'Fast Charging', value: product.charging || 'Fast charging supported' },
                    { label: 'Operating System', value: product.os || 'Android 16 / iOS 19' },
                    { label: 'Weight', value: product.weight || '215g' },
                    { label: 'Dimensions', value: product.dimensions || '162 x 75 x 8.2 mm' },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-3 p-4 hover:bg-white/[0.02]">
                      <span className="font-semibold text-slate-400 col-span-1">{row.label}</span>
                      <span className="text-white col-span-2">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. PRO OPTICS */}
            {activeTab === 'camera' && (
              <div className="max-w-4xl space-y-6">
                <div className="p-6 rounded-2xl bg-[#0d0f17] border border-white/10 flex items-start gap-4">
                  <Camera className="w-8 h-8 text-cyan-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Next-Gen Sensor Fusion</h4>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      {product.camera}. Equipped with large pixel bins, advanced OIS stabilization, multi-spectral color sensors, and 8K cinematic recording with HDR color grading.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-400">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <strong className="block text-white">4K / 8K Video</strong> 60fps Dolby Vision
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <strong className="block text-white">Night Sight Pro</strong> Low-light computational AI
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <strong className="block text-white">Optical Zoom</strong> Periscope tetraprism
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ENDURANCE & CHARGING */}
            {activeTab === 'battery' && (
              <div className="max-w-4xl space-y-6">
                <div className="p-6 rounded-2xl bg-[#0d0f17] border border-white/10 flex items-start gap-4">
                  <Battery className="w-8 h-8 text-emerald-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Battery &amp; Thermal Management</h4>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      {product.battery}. Built with advanced high-density cell chemistry and intelligent power routing algorithms that learn your daily schedule to prolong lifespan.
                    </p>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
                      <span className="font-bold text-cyan-400 block mb-1">Charging Capability:</span>
                      <span className="text-slate-200">{product.charging || '65W Super Fast Wired, 25W Qi2 Wireless Magnetic'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. REVIEWS & SUBMISSION */}
            {activeTab === 'reviews' && (
              <div className="max-w-4xl space-y-8">
                {/* Review Form */}
                <div className="p-6 rounded-2xl bg-[#0d0f17] border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-1">Leave a Verified Review</h4>
                  <p className="text-xs text-slate-400 mb-4">Share your hands-on experience with this device.</p>

                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Your Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewerName}
                          onChange={e => setReviewerName(e.target.value)}
                          placeholder="e.g. Jordan Blake"
                          className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Rating Score
                        </label>
                        <div className="flex items-center gap-2 pt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewerRating(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= reviewerRating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Your Feedback / Insights
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={reviewerComment}
                        onChange={e => setReviewerComment(e.target.value)}
                        placeholder="What do you think of the display, camera, performance and battery?"
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs uppercase shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-white">
                    Verified Customer Reviews ({reviews.length})
                  </h4>

                  {reviews.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-[#0d0f17]/50 rounded-2xl border border-white/5">
                      Be the first to review {product.name}!
                    </div>
                  ) : (
                    reviews.map(rev => (
                      <div
                        key={rev.id}
                        className="p-5 rounded-2xl bg-[#0d0f17] border border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{rev.customerName}</span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Verified Buyer
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 font-mono">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-amber-400' : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{rev.review}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
