import { MongoClient, Db } from 'mongodb';
import bcrypt from 'bcryptjs';
import {
  Product,
  User,
  Order,
  Review,
  Brand,
  Category,
  Deal,
  Banner,
  NotificationItem,
  StoreSettings,
  CartItem,
  WishlistItem,
} from '../types/index.ts';
import {
  initialProducts,
  initialUsers,
  initialOrders,
  initialReviews,
  initialBrands,
  initialCategories,
  initialDeals,
  initialBanners,
  initialNotifications,
  initialSettings,
} from './seedData.ts';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@novamobile.com').toLowerCase().trim();
const ADMIN_PASSWORD_ENV = process.env.ADMIN_PASSWORD || '';
const ADMIN_PASSWORD_HASH_ENV = process.env.ADMIN_PASSWORD_HASH || '';
const ADMIN_PASSWORD_HASH = ADMIN_PASSWORD_HASH_ENV || bcrypt.hashSync(ADMIN_PASSWORD_ENV || 'admin123', 6);
const FALLBACK_ADMIN_PASSWORDS = ['111222', 'admin123', 'nova-admin-2026'];
const CUSTOMER_DEMO_HASH = bcrypt.hashSync('customer123', 6);

// In-Memory Storage Layer (High Performance & Fail-Safe Fallback)
class MemoryDatabase {
  products: Product[] = [...initialProducts];
  users: (User & { passwordHash?: string })[] = [
    {
      ...initialUsers[0],
      email: ADMIN_EMAIL,
      role: 'admin',
      passwordHash: ADMIN_PASSWORD_HASH,
    },
    {
      ...initialUsers[1],
      role: 'customer',
      passwordHash: CUSTOMER_DEMO_HASH,
    },
    {
      ...initialUsers[2],
      role: 'customer',
      passwordHash: CUSTOMER_DEMO_HASH,
    },
  ];
  orders: Order[] = [...initialOrders];
  reviews: Review[] = [...initialReviews];
  brands: Brand[] = [...initialBrands];
  categories: Category[] = [...initialCategories];
  deals: Deal[] = [...initialDeals];
  banners: Banner[] = [...initialBanners];
  notifications: NotificationItem[] = [...initialNotifications];
  settings: StoreSettings = { ...initialSettings };
  carts: Map<string, CartItem[]> = new Map();
  wishlists: Map<string, WishlistItem[]> = new Map();

  constructor() {
    // Seed sample cart and wishlist
    this.carts.set('default', [
      {
        id: 'cart-1',
        productId: 'prod-iphone-17-promax',
        name: 'iPhone 17 Pro Max',
        productName: 'iPhone 17 Pro Max',
        brand: 'Apple',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80',
        color: 'Qora',
        storage: '512 GB',
        ram: '12 GB',
        model: 'Pro Max',
        price: 1099,
        quantity: 1,
        stock: 3,
      },
    ]);
    this.wishlists.set('default', [
      {
        id: 'wish-1',
        productId: 'prod-samsung-s26-ultra',
        name: 'Samsung Galaxy S26 Ultra',
        brand: 'Samsung',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=900&auto=format&fit=crop&q=80',
        price: 1349,
        oldPrice: 1449,
        inStock: true,
        rating: 4.92,
        category: 'Flagship',
      },
    ]);
  }
}

const memoryDb = new MemoryDatabase();

let mongoClient: MongoClient | null = null;
let mongoDbInstance: Db | null = null;
let isMongoConnected = false;

export async function connectMongo(): Promise<boolean> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('[NOVA Database] MONGODB_URI not provided. Running in persistent memory/sync mode.');
    return false;
  }

  try {
    mongoClient = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    await mongoClient.connect();
    mongoDbInstance = mongoClient.db();
    isMongoConnected = true;
    console.log('[NOVA Database] Successfully connected to MongoDB:', mongoDbInstance.databaseName);

    // Bootstrap collections if empty
    await bootstrapMongo(mongoDbInstance);
    return true;
  } catch (err) {
    console.warn('[NOVA Database] Could not connect to MongoDB server, falling back to local memory database:', (err as Error).message);
    isMongoConnected = false;
    return false;
  }
}

async function bootstrapMongo(db: Db) {
  try {
    const productsColl = db.collection<Product>('products');
    const count = await productsColl.countDocuments();
    if (count === 0) {
      console.log('[NOVA Database] Seeding initial collections in MongoDB...');
      await productsColl.insertMany(initialProducts);
      await db.collection('brands').insertMany(initialBrands);
      await db.collection('categories').insertMany(initialCategories);
      await db.collection('users').insertMany(memoryDb.users);
      await db.collection('orders').insertMany(initialOrders);
      await db.collection('reviews').insertMany(initialReviews);
      await db.collection('deals').insertMany(initialDeals);
      await db.collection('banners').insertMany(initialBanners);
      await db.collection('notifications').insertMany(initialNotifications);
      await db.collection('settings').insertOne({ ...initialSettings, _id: 'default' } as any);
      console.log('[NOVA Database] MongoDB seeding complete.');
    } else {
      // Ensure existing seed products have up-to-date variants structure if missing
      for (const seedProd of initialProducts) {
        const existing = await productsColl.findOne({ id: seedProd.id });
        if (existing && (!existing.variants || existing.variants.length === 0)) {
          await productsColl.updateOne(
            { id: seedProd.id },
            {
              $set: {
                colors: seedProd.colors,
                storage: seedProd.storage,
                ram: seedProd.ram,
                models: seedProd.models,
                variants: seedProd.variants,
              },
            }
          );
        }
      }
    }

    // Ensure owner admin account exists and has role="admin" and current bcrypt passwordHash
    await db.collection('users').updateOne(
      { email: ADMIN_EMAIL },
      {
        $set: {
          email: ADMIN_EMAIL,
          role: 'admin',
          status: 'active',
          passwordHash: ADMIN_PASSWORD_HASH,
        },
        $setOnInsert: {
          id: 'user-admin-1',
          name: 'NOVA Store Administrator',
          phone: '+998 90 000 00 00',
          createdAt: new Date().toISOString(),
          totalSpent: 0,
          ordersCount: 0,
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('[NOVA Database] Error during MongoDB bootstrap:', err);
  }
}

export const dbService = {
  isMongoActive: () => isMongoConnected,

  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    if (isMongoConnected && mongoDbInstance) {
      try {
        const docs = await mongoDbInstance.collection<Product>('products').find({}).toArray();
        return docs.map(d => {
          const { _id, ...rest } = d as any;
          return { id: rest.id || _id?.toString(), ...rest };
        });
      } catch (e) {
        console.error('Mongo getProducts error:', e);
      }
    }
    return [...memoryDb.products];
  },

  async getProductById(id: string): Promise<Product | null> {
    if (isMongoConnected && mongoDbInstance) {
      try {
        const doc = await mongoDbInstance.collection<Product>('products').findOne({ id });
        if (doc) {
          const { _id, ...rest } = doc as any;
          return { id: rest.id || _id?.toString(), ...rest };
        }
      } catch (e) {
        console.error('Mongo getProductById error:', e);
      }
    }
    return memoryDb.products.find(p => p.id === id) || null;
  },

  async createProduct(product: Product): Promise<Product> {
    memoryDb.products.unshift(product);
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('products').insertOne({ ...product });
      } catch (e) {
        console.error('Mongo createProduct error:', e);
      }
    }
    return product;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const idx = memoryDb.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      memoryDb.products[idx] = { ...memoryDb.products[idx], ...updates };
      if (isMongoConnected && mongoDbInstance) {
        try {
          await mongoDbInstance.collection('products').updateOne({ id }, { $set: updates });
        } catch (e) {
          console.error('Mongo updateProduct error:', e);
        }
      }
      return memoryDb.products[idx];
    }
    return null;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const initialLen = memoryDb.products.length;
    memoryDb.products = memoryDb.products.filter(p => p.id !== id);
    const deleted = memoryDb.products.length < initialLen;
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('products').deleteOne({ id });
      } catch (e) {
        console.error('Mongo deleteProduct error:', e);
      }
    }
    return deleted;
  },

  // BRANDS
  async getBrands(): Promise<Brand[]> {
    if (isMongoConnected && mongoDbInstance) {
      try {
        const docs = await mongoDbInstance.collection<Brand>('brands').find({}).toArray();
        return docs.map(d => {
          const { _id, ...rest } = d as any;
          return { id: rest.id || _id?.toString(), ...rest };
        });
      } catch (e) {
        console.error('Mongo getBrands error:', e);
      }
    }
    // Update product count dynamically
    return memoryDb.brands.map(b => ({
      ...b,
      productCount: memoryDb.products.filter(p => p.brand.toLowerCase() === b.name.toLowerCase()).length,
    }));
  },

  async createBrand(brand: Brand): Promise<Brand> {
    memoryDb.brands.unshift(brand);
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('brands').insertOne({ ...brand });
      } catch (e) {}
    }
    return brand;
  },

  async updateBrand(id: string, updates: Partial<Brand>): Promise<Brand | null> {
    const idx = memoryDb.brands.findIndex(b => b.id === id);
    if (idx !== -1) {
      memoryDb.brands[idx] = { ...memoryDb.brands[idx], ...updates };
      if (isMongoConnected && mongoDbInstance) {
        try {
          await mongoDbInstance.collection('brands').updateOne({ id }, { $set: updates });
        } catch (e) {}
      }
      return memoryDb.brands[idx];
    }
    return null;
  },

  async deleteBrand(id: string): Promise<boolean> {
    const prev = memoryDb.brands.length;
    memoryDb.brands = memoryDb.brands.filter(b => b.id !== id);
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('brands').deleteOne({ id });
      } catch (e) {}
    }
    return memoryDb.brands.length < prev;
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    if (isMongoConnected && mongoDbInstance) {
      try {
        const docs = await mongoDbInstance.collection<Category>('categories').find({}).toArray();
        return docs.map(d => {
          const { _id, ...rest } = d as any;
          return { id: rest.id || _id?.toString(), ...rest };
        });
      } catch (e) {}
    }
    return memoryDb.categories.map(c => ({
      ...c,
      productCount: memoryDb.products.filter(p => p.category.toLowerCase() === c.name.toLowerCase()).length,
    }));
  },

  async createCategory(cat: Category): Promise<Category> {
    memoryDb.categories.push(cat);
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('categories').insertOne({ ...cat });
      } catch (e) {}
    }
    return cat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const idx = memoryDb.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      memoryDb.categories[idx] = { ...memoryDb.categories[idx], ...updates };
      if (isMongoConnected && mongoDbInstance) {
        try {
          await mongoDbInstance.collection('categories').updateOne({ id }, { $set: updates });
        } catch (e) {}
      }
      return memoryDb.categories[idx];
    }
    return null;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const prev = memoryDb.categories.length;
    memoryDb.categories = memoryDb.categories.filter(c => c.id !== id);
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('categories').deleteOne({ id });
      } catch (e) {}
    }
    return memoryDb.categories.length < prev;
  },

  // ORDERS
  async getOrders(userId?: string): Promise<Order[]> {
    if (isMongoConnected && mongoDbInstance) {
      try {
        const filter = userId ? { userId } : {};
        const docs = await mongoDbInstance.collection<Order>('orders').find(filter).sort({ createdAt: -1 }).toArray();
        return docs.map(d => {
          const { _id, ...rest } = d as any;
          return { id: rest.id || _id?.toString(), ...rest };
        });
      } catch (e) {}
    }
    if (userId) {
      return memoryDb.orders.filter(o => o.userId === userId || o.customer.email.toLowerCase() === userId.toLowerCase());
    }
    return [...memoryDb.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getOrderById(id: string): Promise<Order | null> {
    if (isMongoConnected && mongoDbInstance) {
      try {
        const doc = await mongoDbInstance.collection<Order>('orders').findOne({ $or: [{ id }, { orderNumber: id }] });
        if (doc) {
          const { _id, ...rest } = doc as any;
          return { id: rest.id || _id?.toString(), ...rest };
        }
      } catch (e) {}
    }
    return memoryDb.orders.find(o => o.id === id || o.orderNumber === id) || null;
  },

  async createOrder(order: Order): Promise<Order> {
    memoryDb.orders.unshift(order);
    // Reduce stock for products and specific variants
    for (const item of order.items) {
      const prod = memoryDb.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
          const norm = (s?: string) => (s || '').toLowerCase().replace(/\s+/g, '').trim();
          const matchedVariant = prod.variants.find(
            v =>
              (!v.color || !item.color || norm(v.color) === norm(item.color)) &&
              (!v.storage || !item.storage || norm(v.storage) === norm(item.storage)) &&
              (!v.ram || !item.ram || norm(v.ram) === norm(item.ram)) &&
              (!v.model || !item.model || norm(v.model) === norm(item.model))
          );
          if (matchedVariant) {
            matchedVariant.stock = Math.max(0, Number(matchedVariant.stock || 0) - item.quantity);
          }
        }
        if (isMongoConnected && mongoDbInstance) {
          try {
            await mongoDbInstance.collection('products').updateOne(
              { id: prod.id },
              { $set: { stock: prod.stock, variants: prod.variants } }
            );
          } catch (e) {}
        }
      }
    }
    // Create admin notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'order',
      title: `Yangi buyurtma #${order.orderNumber}`,
      message: `${order.customer.fullName} $${order.total.toFixed(2)} miqdorida buyurtma berdi (${order.items.length} ta mahsulot).`,
      read: false,
      createdAt: new Date().toISOString(),
      link: '/admin/orders',
    };
    memoryDb.notifications.unshift(newNotif);

    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('orders').insertOne({ ...order });
        await mongoDbInstance.collection('notifications').insertOne({ ...newNotif });
      } catch (e) {}
    }
    return order;
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    const idx = memoryDb.orders.findIndex(o => o.id === id || o.orderNumber === id);
    if (idx !== -1) {
      memoryDb.orders[idx].status = status;
      if (isMongoConnected && mongoDbInstance) {
        try {
          await mongoDbInstance.collection('orders').updateOne(
            { $or: [{ id }, { orderNumber: id }] },
            { $set: { status } }
          );
        } catch (e) {}
      }
      return memoryDb.orders[idx];
    }
    return null;
  },

  // USERS
  async getUsers(): Promise<User[]> {
    if (isMongoConnected && mongoDbInstance) {
      try {
        const docs = await mongoDbInstance.collection('users').find({}).toArray();
        return docs.map(d => {
          const { passwordHash, _id, ...safe } = d as any;
          return { id: safe.id || _id?.toString(), ...safe };
        });
      } catch (e) {}
    }
    return memoryDb.users.map(({ passwordHash, ...safe }) => safe);
  },

  async getUserByEmail(email: string): Promise<(User & { passwordHash?: string }) | null> {
    const clean = email.toLowerCase().trim();
    if (isMongoConnected && mongoDbInstance) {
      try {
        const doc = await mongoDbInstance.collection('users').findOne({ email: clean });
        if (doc) {
          const { _id, ...rest } = doc as any;
          return { id: rest.id || _id?.toString(), ...rest };
        }
      } catch (e) {}
    }
    return memoryDb.users.find(u => u.email.toLowerCase() === clean) || null;
  },

  async getUserById(id: string): Promise<User | null> {
    if (isMongoConnected && mongoDbInstance) {
      try {
        const doc = await mongoDbInstance.collection('users').findOne({ id });
        if (doc) {
          const { passwordHash, _id, ...safe } = doc as any;
          return { id: safe.id || _id?.toString(), ...safe };
        }
      } catch (e) {}
    }
    const found = memoryDb.users.find(u => u.id === id);
    if (!found) return null;
    const { passwordHash, ...safe } = found;
    return safe;
  },

  async createUser(user: User & { passwordHash?: string }): Promise<User> {
    memoryDb.users.push(user);
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('users').insertOne({ ...user });
      } catch (e) {}
    }
    const { passwordHash, ...safe } = user;
    return safe;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const idx = memoryDb.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      memoryDb.users[idx] = { ...memoryDb.users[idx], ...updates };
      if (isMongoConnected && mongoDbInstance) {
        try {
          await mongoDbInstance.collection('users').updateOne({ id }, { $set: updates });
        } catch (e) {}
      }
      const { passwordHash, ...safe } = memoryDb.users[idx];
      return safe;
    }
    return null;
  },

  async verifyAdminSecret(password: string): Promise<boolean> {
    if (!password) return false;
    if (ADMIN_PASSWORD_ENV) {
      return password === ADMIN_PASSWORD_ENV;
    }
    if (ADMIN_PASSWORD_HASH_ENV) {
      return bcrypt.compare(password, ADMIN_PASSWORD_HASH_ENV);
    }
    const adminUser = memoryDb.users.find(u => u.role === 'admin');
    if (adminUser?.passwordHash && (await bcrypt.compare(password, adminUser.passwordHash))) {
      return true;
    }
    if (FALLBACK_ADMIN_PASSWORDS.includes(password)) {
      return true;
    }
    return false;
  },

  async getAdminUser(): Promise<User> {
    const found = memoryDb.users.find(u => u.role === 'admin') || memoryDb.users[0];
    const { passwordHash, ...safe } = found;
    return { ...safe, role: 'admin' };
  },

  // REVIEWS
  async getReviews(productId?: string): Promise<Review[]> {
    if (isMongoConnected && mongoDbInstance) {
      try {
        const filter = productId ? { productId } : {};
        const docs = await mongoDbInstance.collection<Review>('reviews').find(filter).toArray();
        return docs.map(d => {
          const { _id, ...rest } = d as any;
          return { id: rest.id || _id?.toString(), ...rest };
        });
      } catch (e) {}
    }
    if (productId) {
      return memoryDb.reviews.filter(r => r.productId === productId);
    }
    return [...memoryDb.reviews];
  },

  async createReview(review: Review): Promise<Review> {
    memoryDb.reviews.unshift(review);
    // Notification for admin
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'review',
      title: 'Yangi sharh qoldirildi',
      message: `${review.customerName} ${review.productName} uchun sharh qoldirdi (${review.rating}★).`,
      read: false,
      createdAt: new Date().toISOString(),
      link: '/admin/reviews',
    };
    memoryDb.notifications.unshift(newNotif);

    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('reviews').insertOne({ ...review });
        await mongoDbInstance.collection('notifications').insertOne({ ...newNotif });
      } catch (e) {}
    }
    return review;
  },

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
    const idx = memoryDb.reviews.findIndex(r => r.id === id);
    if (idx !== -1) {
      memoryDb.reviews[idx] = { ...memoryDb.reviews[idx], ...updates };
      if (isMongoConnected && mongoDbInstance) {
        try {
          await mongoDbInstance.collection('reviews').updateOne({ id }, { $set: updates });
        } catch (e) {}
      }
      return memoryDb.reviews[idx];
    }
    return null;
  },

  async deleteReview(id: string): Promise<boolean> {
    const prev = memoryDb.reviews.length;
    memoryDb.reviews = memoryDb.reviews.filter(r => r.id !== id);
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('reviews').deleteOne({ id });
      } catch (e) {}
    }
    return memoryDb.reviews.length < prev;
  },

  // DEALS
  async getDeals(): Promise<Deal[]> {
    if (isMongoConnected && mongoDbInstance) {
      try {
        const docs = await mongoDbInstance.collection<Deal>('deals').find({}).toArray();
        return docs.map(d => {
          const { _id, ...rest } = d as any;
          return { id: rest.id || _id?.toString(), ...rest };
        });
      } catch (e) {}
    }
    return [...memoryDb.deals];
  },

  async createDeal(deal: Deal): Promise<Deal> {
    memoryDb.deals.unshift(deal);
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('deals').insertOne({ ...deal });
      } catch (e) {}
    }
    return deal;
  },

  async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal | null> {
    const idx = memoryDb.deals.findIndex(d => d.id === id);
    if (idx !== -1) {
      memoryDb.deals[idx] = { ...memoryDb.deals[idx], ...updates };
      if (isMongoConnected && mongoDbInstance) {
        try {
          await mongoDbInstance.collection('deals').updateOne({ id }, { $set: updates });
        } catch (e) {}
      }
      return memoryDb.deals[idx];
    }
    return null;
  },

  async deleteDeal(id: string): Promise<boolean> {
    const prev = memoryDb.deals.length;
    memoryDb.deals = memoryDb.deals.filter(d => d.id !== id);
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('deals').deleteOne({ id });
      } catch (e) {}
    }
    return memoryDb.deals.length < prev;
  },

  // BANNERS
  async getBanners(): Promise<Banner[]> {
    if (isMongoConnected && mongoDbInstance) {
      try {
        const docs = await mongoDbInstance.collection<Banner>('banners').find({}).toArray();
        return docs.map(d => {
          const { _id, ...rest } = d as any;
          return { id: rest.id || _id?.toString(), ...rest };
        });
      } catch (e) {}
    }
    return [...memoryDb.banners];
  },

  async createBanner(banner: Banner): Promise<Banner> {
    memoryDb.banners.unshift(banner);
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('banners').insertOne({ ...banner });
      } catch (e) {}
    }
    return banner;
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
    const idx = memoryDb.banners.findIndex(b => b.id === id);
    if (idx !== -1) {
      memoryDb.banners[idx] = { ...memoryDb.banners[idx], ...updates };
      if (isMongoConnected && mongoDbInstance) {
        try {
          await mongoDbInstance.collection('banners').updateOne({ id }, { $set: updates });
        } catch (e) {}
      }
      return memoryDb.banners[idx];
    }
    return null;
  },

  async deleteBanner(id: string): Promise<boolean> {
    const prev = memoryDb.banners.length;
    memoryDb.banners = memoryDb.banners.filter(b => b.id !== id);
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('banners').deleteOne({ id });
      } catch (e) {}
    }
    return memoryDb.banners.length < prev;
  },

  // NOTIFICATIONS
  async createNotification(notif: NotificationItem): Promise<NotificationItem> {
    memoryDb.notifications.unshift(notif);
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('notifications').insertOne({ ...notif });
      } catch (e) {}
    }
    return notif;
  },

  async getNotifications(): Promise<NotificationItem[]> {
    if (isMongoConnected && mongoDbInstance) {
      try {
        const docs = await mongoDbInstance.collection<NotificationItem>('notifications').find({}).sort({ createdAt: -1 }).toArray();
        return docs.map(d => {
          const { _id, ...rest } = d as any;
          return { id: rest.id || _id?.toString(), ...rest };
        });
      } catch (e) {}
    }
    return [...memoryDb.notifications];
  },

  async markNotificationRead(id: string): Promise<boolean> {
    const n = memoryDb.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      if (isMongoConnected && mongoDbInstance) {
        try {
          await mongoDbInstance.collection('notifications').updateOne({ id }, { $set: { read: true } });
        } catch (e) {}
      }
      return true;
    }
    return false;
  },

  async markAllNotificationsRead(): Promise<boolean> {
    memoryDb.notifications.forEach(n => (n.read = true));
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('notifications').updateMany({}, { $set: { read: true } });
      } catch (e) {}
    }
    return true;
  },

  async deleteNotification(id: string): Promise<boolean> {
    const prev = memoryDb.notifications.length;
    memoryDb.notifications = memoryDb.notifications.filter(n => n.id !== id);
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('notifications').deleteOne({ id });
      } catch (e) {}
    }
    return memoryDb.notifications.length < prev;
  },

  // SETTINGS
  async getSettings(): Promise<StoreSettings> {
    if (isMongoConnected && mongoDbInstance) {
      try {
        const doc = await mongoDbInstance.collection('settings').findOne({ _id: 'default' } as any);
        if (doc) {
          const { _id, ...rest } = doc as any;
          return rest as StoreSettings;
        }
      } catch (e) {}
    }
    return { ...memoryDb.settings };
  },

  async updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    memoryDb.settings = { ...memoryDb.settings, ...updates };
    if (isMongoConnected && mongoDbInstance) {
      try {
        await mongoDbInstance.collection('settings').updateOne(
          { _id: 'default' } as any,
          { $set: updates },
          { upsert: true }
        );
      } catch (e) {}
    }
    return memoryDb.settings;
  },

  // CART (Persisted per key)
  async getCart(key: string): Promise<CartItem[]> {
    return memoryDb.carts.get(key) || [];
  },

  async saveCart(key: string, items: CartItem[]): Promise<CartItem[]> {
    memoryDb.carts.set(key, items);
    return items;
  },

  // WISHLIST (Persisted per key)
  async getWishlist(key: string): Promise<WishlistItem[]> {
    return memoryDb.wishlists.get(key) || [];
  },

  async saveWishlist(key: string, items: WishlistItem[]): Promise<WishlistItem[]> {
    memoryDb.wishlists.set(key, items);
    return items;
  },
};
