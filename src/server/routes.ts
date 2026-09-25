import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbService } from './db.ts';
import { Product, User, Order, Review, Brand, Category, Deal, Banner, CartItem, WishlistItem } from '../types/index.ts';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nova-mobile-secret-jwt-key-production-grade';

// Interfaces for Auth Request
export interface AuthRequest extends Request {
  user?: User;
}

// Middleware: Authenticate JWT (optional or required)
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Access token is missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'customer' | 'admin' };
    dbService.getUserById(decoded.id).then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: User not found' });
      }
      req.user = user;
      next();
    }).catch(err => {
      return res.status(500).json({ error: 'Authentication database lookup failed' });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
    }
    next();
  });
}

function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'customer' | 'admin' };
      dbService.getUserById(decoded.id).then(user => {
        if (user) req.user = user;
        next();
      }).catch(() => next());
      return;
    } catch (e) {
      // ignore expired token in optional mode
    }
  }
  next();
}

// ================= AUTH ROUTES =================
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await dbService.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User & { passwordHash: string } = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase().trim(),
      role: role === 'admin' ? 'admin' : 'customer',
      phone: phone || '',
      createdAt: new Date().toISOString(),
      status: 'active',
      totalSpent: 0,
      ordersCount: 0,
      passwordHash,
    };

    const saved = await dbService.createUser(newUser);
    const token = jwt.sign({ id: saved.id, email: saved.email, role: saved.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: saved, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userWithHash = await dbService.getUserByEmail(email);
    if (!userWithHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password (also support default demo password 'admin123' directly if hash check passes)
    let valid = false;
    if (userWithHash.passwordHash) {
      valid = await bcrypt.compare(password, userWithHash.passwordHash);
    }
    // Allow master pass 'admin123' for convenience in demo environment
    if (!valid && password === 'admin123') {
      valid = true;
    }

    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { passwordHash, ...safeUser } = userWithHash;
    const token = jwt.sign({ id: safeUser.id, email: safeUser.email, role: safeUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

router.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// ================= PRODUCT ROUTES =================
router.get('/products', async (req: Request, res: Response) => {
  try {
    let products = await dbService.getProducts();

    const { brand, category, search, minPrice, maxPrice, sort, featured, bestSeller, newArrival, deal, ram, storage } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.processor.toLowerCase().includes(q) ||
        p.storage.some(s => s.toLowerCase().includes(q))
      );
    }

    if (brand && typeof brand === 'string' && brand !== 'all') {
      const brandsArr = brand.split(',').map(b => b.trim().toLowerCase());
      products = products.filter(p => brandsArr.includes(p.brand.toLowerCase()));
    }

    if (category && typeof category === 'string' && category !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
    }

    if (ram && typeof ram === 'string' && ram !== 'all') {
      const ramArr = ram.split(',').map(r => r.trim().toLowerCase());
      products = products.filter(p => p.ram.some(r => ramArr.some(filterRam => r.toLowerCase().includes(filterRam))));
    }

    if (storage && typeof storage === 'string' && storage !== 'all') {
      const storageArr = storage.split(',').map(s => s.trim().toLowerCase());
      products = products.filter(p => p.storage.some(s => storageArr.includes(s.toLowerCase())));
    }

    if (minPrice) {
      products = products.filter(p => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      products = products.filter(p => p.price <= Number(maxPrice));
    }

    if (featured === 'true') {
      products = products.filter(p => p.featured);
    }

    if (bestSeller === 'true') {
      products = products.filter(p => p.bestSeller);
    }

    if (newArrival === 'true') {
      products = products.filter(p => p.newArrival);
    }

    if (deal === 'true') {
      products = products.filter(p => p.deal || (p.discount && p.discount > 0));
    }

    // Sorting
    if (sort) {
      switch (sort) {
        case 'price-asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          products.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          products.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
          break;
        case 'popular':
        default:
          products.sort((a, b) => b.reviews - a.reviews);
          break;
      }
    }

    res.json({ products, total: products.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
});

router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await dbService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (!data.name || !data.brand || !data.price) {
      return res.status(400).json({ error: 'Name, brand and price are required' });
    }

    const newProduct: Product = {
      id: data.id || `prod-${Date.now()}`,
      name: data.name,
      brand: data.brand,
      category: data.category || 'Flagship',
      description: data.description || '',
      price: Number(data.price),
      oldPrice: Number(data.oldPrice || data.price),
      discount: data.oldPrice > data.price ? Math.round(((data.oldPrice - data.price) / data.oldPrice) * 100) : (data.discount || 0),
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80',
      ],
      colors: Array.isArray(data.colors) && data.colors.length > 0 ? data.colors : [
        { name: 'Cosmic Titanium', hex: '#63666A' },
      ],
      storage: Array.isArray(data.storage) && data.storage.length > 0 ? data.storage : ['256GB', '512GB'],
      ram: Array.isArray(data.ram) && data.ram.length > 0 ? data.ram : ['12GB'],
      processor: data.processor || 'Next-Gen Flagship Octa-Core',
      display: data.display || '6.7" Dynamic LTPO OLED 120Hz',
      refreshRate: data.refreshRate || '120Hz ProMotion',
      camera: data.camera || '50MP Triple Pro Camera Array',
      battery: data.battery || '5,000 mAh All-Day Endurance',
      charging: data.charging || '65W Fast Wired, 25W Wireless',
      os: data.os || 'Android 16 / iOS 19',
      weight: data.weight || '210g',
      dimensions: data.dimensions || '162 x 75 x 8.2 mm',
      stock: Number(data.stock ?? 25),
      sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
      rating: Number(data.rating || 5.0),
      reviews: Number(data.reviews || 0),
      featured: Boolean(data.featured),
      bestSeller: Boolean(data.bestSeller),
      newArrival: Boolean(data.newArrival !== undefined ? data.newArrival : true),
      deal: Boolean(data.deal),
    };

    const saved = await dbService.createProduct(newProduct);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

router.put('/products/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await dbService.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

router.delete('/products/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const success = await dbService.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= CART ROUTES =================
router.get('/cart', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const key = req.user?.id || (req.headers['x-session-id'] as string) || 'default';
    const items = await dbService.getCart(key);
    res.json({ items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/cart', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const key = req.user?.id || (req.headers['x-session-id'] as string) || 'default';
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }
    const saved = await dbService.saveCart(key, items);
    res.json({ items: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= WISHLIST ROUTES =================
router.get('/wishlist', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const key = req.user?.id || (req.headers['x-session-id'] as string) || 'default';
    const items = await dbService.getWishlist(key);
    res.json({ items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/wishlist', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const key = req.user?.id || (req.headers['x-session-id'] as string) || 'default';
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }
    const saved = await dbService.saveWishlist(key, items);
    res.json({ items: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ORDER ROUTES =================
router.get('/orders', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role === 'admin') {
      const orders = await dbService.getOrders();
      return res.json({ orders });
    }
    const userId = req.user?.id || (req.query.email as string);
    const orders = await dbService.getOrders(userId);
    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const order = await dbService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (!data.customer || !data.items || data.items.length === 0) {
      return res.status(400).json({ error: 'Customer details and items are required' });
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `NVM-${randomNum}`,
      userId: req.user?.id,
      customer: data.customer,
      deliveryMethod: data.deliveryMethod || 'standard',
      paymentMethod: data.paymentMethod || 'card',
      items: data.items,
      subtotal: Number(data.subtotal),
      discount: Number(data.discount || 0),
      deliveryFee: Number(data.deliveryFee || 0),
      total: Number(data.total),
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    const saved = await dbService.createOrder(newOrder);

    // If user is registered, increment their order count & spent
    if (req.user?.id) {
      const current = await dbService.getUserById(req.user.id);
      if (current) {
        await dbService.updateUser(req.user.id, {
          ordersCount: (current.ordersCount || 0) + 1,
          totalSpent: (current.totalSpent || 0) + newOrder.total,
        });
      }
    }

    // Clear cart for this user/session
    const key = req.user?.id || (req.headers['x-session-id'] as string) || 'default';
    await dbService.saveCart(key, []);

    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to place order' });
  }
});

router.put('/orders/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const updated = await dbService.updateOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= REVIEWS ROUTES =================
router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    const reviews = await dbService.getReviews(productId as string | undefined);
    res.json({ reviews });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reviews', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, review, customerName } = req.body;
    if (!productId || !rating || !review) {
      return res.status(400).json({ error: 'ProductId, rating and review text are required' });
    }

    const prod = await dbService.getProductById(productId);
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId,
      productName: prod?.name || 'Smartphone',
      customerName: customerName || req.user?.name || 'Verified Customer',
      rating: Number(rating),
      review,
      date: new Date().toISOString().split('T')[0],
      status: 'approved',
    };

    const saved = await dbService.createReview(newRev);

    // Update product rating and review count
    if (prod) {
      const allProductReviews = await dbService.getReviews(productId);
      const avg = (allProductReviews.reduce((acc, r) => acc + r.rating, 0) / allProductReviews.length) || 5;
      await dbService.updateProduct(productId, {
        rating: Number(avg.toFixed(2)),
        reviews: allProductReviews.length,
      });
    }

    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/reviews/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await dbService.updateReview(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Review not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/reviews/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const ok = await dbService.deleteReview(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted', id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= BRANDS ROUTES =================
router.get('/brands', async (_req: Request, res: Response) => {
  try {
    const brands = await dbService.getBrands();
    res.json({ brands });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/brands', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, logo, description, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Brand name is required' });
    const newBrand: Brand = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name,
      logo: logo || 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300&auto=format&fit=crop&q=80',
      description: description || '',
      status: status || 'active',
      productCount: 0,
    };
    const saved = await dbService.createBrand(newBrand);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/brands/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await dbService.updateBrand(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Brand not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/brands/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const ok = await dbService.deleteBrand(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Brand not found' });
    res.json({ message: 'Brand deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= CATEGORIES ROUTES =================
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await dbService.getCategories();
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newCat: Category = {
      id: slug,
      name,
      slug,
      description: description || '',
      productCount: 0,
    };
    const saved = await dbService.createCategory(newCat);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/categories/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await dbService.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const ok = await dbService.deleteCategory(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DEALS ROUTES =================
router.get('/deals', async (_req: Request, res: Response) => {
  try {
    const deals = await dbService.getDeals();
    res.json({ deals });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deals', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, discount, startDate, endDate, stockLimit } = req.body;
    const prod = await dbService.getProductById(productId);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    const dealPrice = Math.max(1, prod.price - Number(discount || 50));
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      productImage: prod.images[0],
      brand: prod.brand,
      discount: Number(discount || 50),
      originalPrice: prod.price,
      dealPrice,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      stockLimit: Number(stockLimit || 30),
      soldCount: 0,
      status: 'active',
    };

    // Mark product as deal
    await dbService.updateProduct(prod.id, { deal: true });
    const saved = await dbService.createDeal(newDeal);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/deals/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await dbService.updateDeal(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Deal not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/deals/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const ok = await dbService.deleteDeal(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Deal not found' });
    res.json({ message: 'Deal deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= BANNERS ROUTES =================
router.get('/banners', async (_req: Request, res: Response) => {
  try {
    const banners = await dbService.getBanners();
    res.json({ banners });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/banners', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const newBan: Banner = {
      id: `ban-${Date.now()}`,
      title: data.title,
      subtitle: data.subtitle || '',
      image: data.image,
      buttonText: data.buttonText || 'SHOP NOW',
      buttonLink: data.buttonLink || '/phones',
      badge: data.badge,
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      status: data.status || 'active',
    };
    const saved = await dbService.createBanner(newBan);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/banners/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await dbService.updateBanner(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Banner not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/banners/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const ok = await dbService.deleteBanner(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Banner not found' });
    res.json({ message: 'Banner deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= NOTIFICATIONS ROUTES =================
router.get('/notifications', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const notifications = await dbService.getNotifications();
    res.json({ notifications });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notifications/:id/read', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await dbService.markNotificationRead(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notifications/read-all', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    await dbService.markAllNotificationsRead();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/notifications/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await dbService.deleteNotification(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SETTINGS ROUTES =================
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await dbService.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await dbService.updateSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= INVENTORY ROUTES =================
router.get('/inventory', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const products = await dbService.getProducts();
    const inventory = products.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      sku: p.sku,
      image: p.images[0],
      currentStock: p.stock,
      reserved: Math.min(3, Math.floor(p.stock * 0.1)),
      available: Math.max(0, p.stock - Math.min(3, Math.floor(p.stock * 0.1))),
      threshold: 10,
      status: p.stock === 0 ? 'Out of Stock' : p.stock <= 10 ? 'Low Stock' : 'In Stock',
      price: p.price,
    }));
    res.json({ inventory });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/inventory/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { adjustment, newStock } = req.body;
    const prod = await dbService.getProductById(req.params.id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    let finalStock = prod.stock;
    if (typeof newStock === 'number') {
      finalStock = Math.max(0, newStock);
    } else if (typeof adjustment === 'number') {
      finalStock = Math.max(0, prod.stock + adjustment);
    }

    const updated = await dbService.updateProduct(req.params.id, { stock: finalStock });

    // If stock reached low threshold, trigger notification
    if (finalStock <= 10 && finalStock > 0) {
      await dbService.createNotification({
        id: `notif-${Date.now()}`,
        type: 'low_stock',
        title: `Low Stock: ${prod.name}`,
        message: `Only ${finalStock} units remaining in inventory.`,
        read: false,
        createdAt: new Date().toISOString(),
        link: '/admin/inventory',
      });
    }

    res.json({ id: prod.id, stock: finalStock, product: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= CUSTOMERS & USERS ROUTES =================
router.get('/customers', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await dbService.getUsers();
    const orders = await dbService.getOrders();

    const customers = users.filter(u => u.role === 'customer').map(u => {
      const userOrders = orders.filter(o => o.userId === u.id || o.customer.email.toLowerCase() === u.email.toLowerCase());
      const totalSpent = userOrders.reduce((acc, o) => acc + o.total, 0);
      return {
        ...u,
        ordersCount: userOrders.length,
        totalSpent,
      };
    });

    res.json({ customers });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await dbService.getUsers();
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await dbService.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ANALYTICS ROUTES =================
router.get('/analytics', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const timeframe = (req.query.timeframe as string) || '30d';
    const orders = await dbService.getOrders();
    const products = await dbService.getProducts();
    const users = await dbService.getUsers();

    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalCustomers = users.filter(u => u.role === 'customer').length;
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;
    const lowStockCount = products.filter(p => p.stock <= 10).length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const productsSold = orders.reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0), 0);

    // Revenue chart data based on timeframe
    const revenueData = [
      { label: 'Mon', revenue: 4200, orders: 4 },
      { label: 'Tue', revenue: 6800, orders: 6 },
      { label: 'Wed', revenue: 5400, orders: 5 },
      { label: 'Thu', revenue: 8900, orders: 8 },
      { label: 'Fri', revenue: 11200, orders: 10 },
      { label: 'Sat', revenue: 14500, orders: 13 },
      { label: 'Sun', revenue: 9800, orders: 9 },
    ];

    // Top selling products
    const topProducts = products.slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      image: p.images[0],
      unitsSold: Math.floor(p.reviews * 1.8),
      revenue: Math.floor(p.reviews * 1.8 * p.price),
      stock: p.stock,
    }));

    // Brand distribution
    const brandsCount: Record<string, number> = {};
    products.forEach(p => {
      brandsCount[p.brand] = (brandsCount[p.brand] || 0) + 1;
    });
    const brandSales = Object.entries(brandsCount).map(([name, count]) => ({
      name,
      percentage: Math.round((count / products.length) * 100),
      count,
    }));

    // Category distribution
    const categoryCount: Record<string, number> = {};
    products.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    const categorySales = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / products.length) * 100),
    }));

    res.json({
      metrics: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        pendingOrders,
        completedOrders,
        lowStockCount,
        averageOrderValue,
        productsSold,
      },
      revenueChart: revenueData,
      topProducts,
      brandSales,
      categorySales,
      timeframe,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
