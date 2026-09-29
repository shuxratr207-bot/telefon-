import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { dbService } from './db.ts';
import { Product, User, Order, Review, Brand, Category, Deal, Banner, CartItem, WishlistItem } from '../types/index.ts';

dotenv.config();

const router = Router();

function getJwtSecret(): string {
  return (process.env.JWT_SECRET || 'nova-mobile-secret-jwt-key-production-grade').trim();
}

interface JwtTokenPayload {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'customer' | 'admin';
}

function signUserToken(user: User): string {
  const payload: JwtTokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone || '',
    role: user.role,
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

async function resolveUserFromToken(decoded: JwtTokenPayload): Promise<User | null> {
  if (decoded.role === 'admin') {
    const byId = await dbService.getUserById(decoded.id);
    if (byId && byId.role === 'admin') return byId;
    return await dbService.getAdminUser();
  }

  let user = await dbService.getUserById(decoded.id);
  if (!user && decoded.email) {
    const byEmail = await dbService.getUserByEmail(decoded.email);
    if (byEmail) {
      const { passwordHash, ...safe } = byEmail;
      user = safe;
    }
  }

  // If valid signed JWT exists across serverless instances when running in memory mode, re-hydrate user
  if (!user && decoded.id && decoded.email) {
    const hydrated: User = {
      id: decoded.id,
      name: decoded.name || decoded.email.split('@')[0],
      email: decoded.email,
      role: decoded.role || 'customer',
      phone: decoded.phone || '',
      createdAt: new Date().toISOString(),
      status: 'active',
      totalSpent: 0,
      ordersCount: 0,
    };
    user = await dbService.createUser(hydrated);
  }

  return user;
}

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
    const decoded = jwt.verify(token, getJwtSecret()) as JwtTokenPayload;
    resolveUserFromToken(decoded)
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized: User not found' });
        }
        req.user = user;
        next();
      })
      .catch(() => {
        return res.status(500).json({ error: 'Authentication database lookup failed' });
      });
  } catch {
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
      const decoded = jwt.verify(token, getJwtSecret()) as JwtTokenPayload;
      resolveUserFromToken(decoded)
        .then(user => {
          if (user) req.user = user;
          next();
        })
        .catch(() => next());
      return;
    } catch {
      // ignore expired token in optional mode
    }
  }
  next();
}

// ================= AUTH ROUTES =================
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Iltimos, barcha majburiy maydonlarni to‘ldiring!' });
    }

    // Special Admin Password Flow: verified strictly on the backend
    const isAdminSecret = await dbService.verifyAdminSecret(String(password));
    if (isAdminSecret) {
      const adminUser = await dbService.getAdminUser();
      const token = signUserToken({ ...adminUser, role: 'admin' });
      return res.status(200).json({ user: { ...adminUser, role: 'admin' }, token, isAdminRedirect: true });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'To‘liq ism, elektron pochta va parol kiritilishi shart' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak' });
    }

    const existing = await dbService.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Ushbu elektron pochta orqali hisob allaqachon mavjud' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(String(password), salt);

    // Normal customer Sign Up MUST ONLY create role = "customer"
    const newUser: User & { passwordHash: string } = {
      id: `user-${Date.now()}`,
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      role: 'customer',
      phone: phone ? String(phone).trim() : '',
      createdAt: new Date().toISOString(),
      status: 'active',
      totalSpent: 0,
      ordersCount: 0,
      passwordHash,
    };

    const saved = await dbService.createUser(newUser);
    const token = signUserToken(saved);

    res.status(201).json({ user: saved, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, adminOnly } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Elektron pochta va parol kiritilishi shart' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const isAdminSecret = await dbService.verifyAdminSecret(String(password));
    const userWithHash = await dbService.getUserByEmail(cleanEmail);

    // Check if admin credentials were provided
    if (isAdminSecret && (adminOnly || cleanEmail === dbService.getAdminEmail() || !userWithHash || userWithHash.role === 'admin')) {
      const adminUser = await dbService.getAdminUser();
      const finalAdmin: User = { ...adminUser, role: 'admin' };
      const token = signUserToken(finalAdmin);
      return res.json({ user: finalAdmin, token });
    }

    // Also allow admin secret login if user entered the admin secret password on Sign In
    if (isAdminSecret) {
      const adminUser = await dbService.getAdminUser();
      const finalAdmin: User = { ...adminUser, role: 'admin' };
      const token = signUserToken(finalAdmin);
      return res.json({ user: finalAdmin, token });
    }

    if (!userWithHash) {
      return res.status(401).json({ error: 'Elektron pochta yoki parol noto‘g‘ri' });
    }

    let valid = false;
    if (userWithHash.passwordHash) {
      valid = await bcrypt.compare(String(password), userWithHash.passwordHash);
    }

    if (!valid) {
      return res.status(401).json({ error: 'Elektron pochta yoki parol noto‘g‘ri' });
    }

    if (adminOnly && userWithHash.role !== 'admin') {
      return res.status(403).json({ error: 'Kirish rad etildi: Administrator huquqi talab qilinadi' });
    }

    const { passwordHash, ...safeUser } = userWithHash;
    const token = signUserToken(safeUser);

    res.json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Tizimga kirishda xatolik yuz berdi' });
  }
});

router.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// ================= PRODUCT ROUTES =================
router.get('/products', async (req: Request, res: Response) => {
  try {
    let products = await dbService.getProducts();

    const { brand, category, search, minPrice, maxPrice, sort, featured, bestSeller, newArrival, deal, ram, storage, color } = req.query;
    const norm = (val?: string) => (val || '').toLowerCase().replace(/\s+/g, '').trim();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      const qNorm = norm(q);
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.processor.toLowerCase().includes(q) ||
        p.storage.some(s => norm(s).includes(qNorm)) ||
        p.ram.some(r => norm(r).includes(qNorm)) ||
        p.colors.some(c => c.name.toLowerCase().includes(q)) ||
        (p.variants || []).some(
          v =>
            (v.color && v.color.toLowerCase().includes(q)) ||
            (v.storage && norm(v.storage).includes(qNorm)) ||
            (v.ram && norm(v.ram).includes(qNorm)) ||
            (v.model && v.model.toLowerCase().includes(q))
        )
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
      const ramArr = ram.split(',').map(r => norm(r));
      products = products.filter(
        p =>
          p.ram.some(r => ramArr.some(f => norm(r).includes(f))) ||
          (p.variants || []).some(v => v.ram && ramArr.some(f => norm(v.ram).includes(f)))
      );
    }

    if (storage && typeof storage === 'string' && storage !== 'all') {
      const storageArr = storage.split(',').map(s => norm(s));
      products = products.filter(
        p =>
          p.storage.some(s => storageArr.includes(norm(s))) ||
          (p.variants || []).some(v => v.storage && storageArr.includes(norm(v.storage)))
      );
    }

    if (color && typeof color === 'string' && color !== 'all') {
      const colorArr = color.split(',').map(c => norm(c));
      products = products.filter(
        p =>
          p.colors.some(c => colorArr.some(f => norm(c.name).includes(f))) ||
          (p.variants || []).some(v => v.color && colorArr.some(f => norm(v.color).includes(f)))
      );
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

function validateAndCleanVariants(rawVariants: any[], fallbackImage?: string) {
  if (!Array.isArray(rawVariants) || rawVariants.length === 0) {
    return { variants: [], error: null };
  }
  const cleaned = [];
  for (let i = 0; i < rawVariants.length; i++) {
    const v = rawVariants[i];
    if (!v || typeof v !== 'object') continue;
    const color = v.color !== undefined ? String(v.color).trim() : '';
    const storage = v.storage !== undefined ? String(v.storage).trim() : '';
    const ram = v.ram !== undefined ? String(v.ram).trim() : '';
    const model = v.model !== undefined ? String(v.model).trim() : '';
    const priceRaw = v.price;
    const stockRaw = v.stock;

    if (!color) {
      return { variants: [], error: 'Rangni kiriting.' };
    }
    if (!storage) {
      return { variants: [], error: 'Xotirani tanlang.' };
    }
    if (priceRaw === undefined || String(priceRaw).trim() === '' || isNaN(Number(priceRaw)) || Number(priceRaw) <= 0) {
      return { variants: [], error: 'Narxni kiriting.' };
    }
    if (stockRaw === undefined || String(stockRaw).trim() === '' || isNaN(Number(stockRaw)) || Number(stockRaw) < 0) {
      return { variants: [], error: 'Ombordagi sonini kiriting.' };
    }

    cleaned.push({
      id: v.id || `var-${Date.now()}-${i}`,
      color,
      colorHex: v.colorHex || '#1e1e24',
      storage,
      ram: ram || undefined,
      model: model || undefined,
      price: Number(priceRaw),
      oldPrice: v.oldPrice && Number(v.oldPrice) > Number(priceRaw) ? Number(v.oldPrice) : undefined,
      stock: Number(stockRaw),
      image: v.image && String(v.image).trim() ? String(v.image).trim() : fallbackImage,
    });
  }
  return { variants: cleaned, error: null };
}

router.post('/products', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const images = Array.isArray(data.images) ? data.images.filter((img: string) => img && String(img).trim()) : [];

    if (!data.name || !String(data.name).trim()) {
      return res.status(400).json({ error: 'Mahsulot nomini kiriting.' });
    }
    if (!data.brand || !String(data.brand).trim()) {
      return res.status(400).json({ error: 'Brendni tanlang.' });
    }
    if (!data.category || !String(data.category).trim()) {
      return res.status(400).json({ error: 'Kategoriya tanlang.' });
    }

    const { variants: cleanVariants, error: variantError } = validateAndCleanVariants(
      data.variants,
      images[0]
    );
    if (variantError) {
      return res.status(400).json({ error: variantError });
    }

    const price =
      data.price !== undefined && String(data.price).trim() !== ''
        ? Number(data.price)
        : cleanVariants.length > 0
        ? Math.min(...cleanVariants.map(v => v.price))
        : NaN;

    const stock =
      data.stock !== undefined && String(data.stock).trim() !== ''
        ? Number(data.stock)
        : cleanVariants.length > 0
        ? cleanVariants.reduce((sum, v) => sum + v.stock, 0)
        : NaN;

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Narxni kiriting.' });
    }
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({ error: 'Ombordagi sonini kiriting.' });
    }
    if (images.length === 0) {
      return res.status(400).json({ error: 'Rasm yuklang.' });
    }

    const rawOldPrice = data.oldPrice !== undefined && data.oldPrice !== '' ? Number(data.oldPrice) : 0;
    const oldPrice = !isNaN(rawOldPrice) && rawOldPrice > price ? rawOldPrice : 0;
    const explicitDiscount = data.discount !== undefined && data.discount !== '' ? Number(data.discount) : 0;
    const discount =
      !isNaN(explicitDiscount) && explicitDiscount > 0
        ? explicitDiscount
        : oldPrice > price
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : 0;

    const storageSet = new Set<string>(
      Array.isArray(data.storage) ? data.storage.map((s: string) => String(s).trim()).filter(Boolean) : []
    );
    const ramSet = new Set<string>(
      Array.isArray(data.ram) ? data.ram.map((s: string) => String(s).trim()).filter(Boolean) : []
    );
    const modelSet = new Set<string>(
      Array.isArray(data.models) ? data.models.map((s: string) => String(s).trim()).filter(Boolean) : []
    );
    const colorMap = new Map<string, { name: string; hex: string; image?: string }>();

    if (Array.isArray(data.colors)) {
      for (const c of data.colors) {
        if (c && c.name && String(c.name).trim()) {
          colorMap.set(String(c.name).trim().toLowerCase(), {
            name: String(c.name).trim(),
            hex: c.hex || '#1e1e24',
            image: c.image || images[0],
          });
        }
      }
    }

    for (const v of cleanVariants) {
      if (v.storage) storageSet.add(v.storage);
      if (v.ram) ramSet.add(v.ram);
      if (v.model) modelSet.add(v.model);
      if (v.color) {
        const key = v.color.toLowerCase();
        if (!colorMap.has(key)) {
          colorMap.set(key, {
            name: v.color,
            hex: v.colorHex || '#1e1e24',
            image: v.image || images[0],
          });
        } else if (v.image) {
          const existing = colorMap.get(key)!;
          existing.image = v.image;
        }
      }
    }

    const newProduct: Product = {
      id: data.id || `prod-${Date.now()}`,
      name: String(data.name).trim(),
      brand: String(data.brand).trim(),
      category: String(data.category).trim(),
      description: data.description ? String(data.description).trim() : '',
      price,
      oldPrice,
      discount,
      images,
      colors: Array.from(colorMap.values()),
      storage: Array.from(storageSet),
      ram: Array.from(ramSet),
      models: modelSet.size > 0 ? Array.from(modelSet) : undefined,
      variants: cleanVariants,
      processor: data.processor ? String(data.processor).trim() : '',
      display: data.display ? String(data.display).trim() : '',
      refreshRate: data.refreshRate ? String(data.refreshRate).trim() : '',
      camera: data.camera ? String(data.camera).trim() : '',
      battery: data.battery ? String(data.battery).trim() : '',
      charging: data.charging ? String(data.charging).trim() : '',
      os: data.os ? String(data.os).trim() : '',
      weight: data.weight ? String(data.weight).trim() : '',
      dimensions: data.dimensions ? String(data.dimensions).trim() : '',
      stock,
      sku: data.sku && String(data.sku).trim() ? String(data.sku).trim() : `NOVA-${Date.now().toString().slice(-6)}`,
      rating: data.rating !== undefined ? Number(data.rating) : 5.0,
      reviews: data.reviews !== undefined ? Number(data.reviews) : 0,
      featured: Boolean(data.featured),
      bestSeller: Boolean(data.bestSeller),
      newArrival: Boolean(data.newArrival),
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
    const data = { ...req.body };
    const existingProduct = await dbService.getProductById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (data.variants !== undefined) {
      const fallbackImg = (Array.isArray(data.images) && data.images[0]) || existingProduct.images?.[0];
      const { variants: cleanVariants, error: variantError } = validateAndCleanVariants(
        data.variants,
        fallbackImg
      );
      if (variantError) {
        return res.status(400).json({ error: variantError });
      }
      data.variants = cleanVariants;

      if (cleanVariants.length > 0) {
        const storageSet = new Set<string>(
          Array.isArray(data.storage) ? data.storage.map((s: string) => String(s).trim()).filter(Boolean) : []
        );
        const ramSet = new Set<string>(
          Array.isArray(data.ram) ? data.ram.map((s: string) => String(s).trim()).filter(Boolean) : []
        );
        const modelSet = new Set<string>(
          Array.isArray(data.models) ? data.models.map((s: string) => String(s).trim()).filter(Boolean) : []
        );
        const colorMap = new Map<string, { name: string; hex: string; image?: string }>();

        if (Array.isArray(data.colors)) {
          for (const c of data.colors) {
            if (c && c.name && String(c.name).trim()) {
              colorMap.set(String(c.name).trim().toLowerCase(), {
                name: String(c.name).trim(),
                hex: c.hex || '#1e1e24',
                image: c.image || fallbackImg,
              });
            }
          }
        }

        for (const v of cleanVariants) {
          if (v.storage) storageSet.add(v.storage);
          if (v.ram) ramSet.add(v.ram);
          if (v.model) modelSet.add(v.model);
          if (v.color) {
            const key = v.color.toLowerCase();
            if (!colorMap.has(key)) {
              colorMap.set(key, {
                name: v.color,
                hex: v.colorHex || '#1e1e24',
                image: v.image || fallbackImg,
              });
            } else if (v.image) {
              const existing = colorMap.get(key)!;
              existing.image = v.image;
            }
          }
        }

        data.colors = Array.from(colorMap.values());
        data.storage = Array.from(storageSet);
        data.ram = Array.from(ramSet);
        data.models = modelSet.size > 0 ? Array.from(modelSet) : [];
      }
    }

    if (data.price !== undefined) {
      const price = Number(data.price);
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Narxni kiriting.' });
      }
      data.price = price;
    }
    if (data.stock !== undefined) {
      const stock = Number(data.stock);
      if (isNaN(stock) || stock < 0) {
        return res.status(400).json({ error: 'Ombordagi sonini kiriting.' });
      }
      data.stock = stock;
    }
    if (data.oldPrice !== undefined) {
      const oldPrice = Number(data.oldPrice);
      const currentPrice = data.price ?? existingProduct.price ?? 0;
      data.oldPrice = !isNaN(oldPrice) && oldPrice > currentPrice ? oldPrice : 0;
      if (data.discount === undefined) {
        data.discount = data.oldPrice > currentPrice ? Math.round(((data.oldPrice - currentPrice) / data.oldPrice) * 100) : 0;
      }
    }
    const updated = await dbService.updateProduct(req.params.id, data);
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
    if (!userId) {
      return res.json({ orders: [] });
    }
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

    const normalizedItems = (data.items as any[]).map(it => ({
      productId: it.productId,
      name: it.name || it.productName || '',
      productName: it.productName || it.name || '',
      brand: it.brand || '',
      image: it.image || '',
      color: it.color || '',
      storage: it.storage || '',
      ram: it.ram || '',
      model: it.model || '',
      price: Number(it.price || 0),
      quantity: Number(it.quantity || 1),
    }));

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `NVM-${randomNum}`,
      userId: req.user?.id,
      customer: data.customer,
      deliveryMethod: data.deliveryMethod || 'standard',
      paymentMethod: data.paymentMethod || 'card',
      items: normalizedItems,
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
    if (!data.title || !String(data.title).trim()) {
      return res.status(400).json({ error: 'Sarlavhani kiriting.' });
    }
    if (!data.image || !String(data.image).trim()) {
      return res.status(400).json({ error: 'Rasm yuklang.' });
    }
    const newBan: Banner = {
      id: `ban-${Date.now()}`,
      title: String(data.title).trim(),
      subtitle: data.subtitle ? String(data.subtitle).trim() : '',
      image: String(data.image).trim(),
      buttonText: data.buttonText ? String(data.buttonText).trim() : 'Xarid qilish',
      buttonLink: data.buttonLink ? String(data.buttonLink).trim() : '/phones',
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
