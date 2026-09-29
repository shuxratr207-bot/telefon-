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

function resolveApiBaseUrl(): string {
  const rawEnvUrl = String(
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''
  ).trim();

  if (!rawEnvUrl) {
    return '/api';
  }

  const cleaned = rawEnvUrl.replace(/\/+$/, '');

  // Prevent accidental localhost / 127.0.0.1 API URLs in production builds
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    (cleaned.includes('localhost') || cleaned.includes('127.0.0.1'))
  ) {
    return '/api';
  }

  if (cleaned.endsWith('/api')) {
    return cleaned;
  }

  return `${cleaned}/api`;
}

export const API_BASE = resolveApiBaseUrl();

function getSessionId(): string {
  let sessionId = localStorage.getItem('nova_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('nova_session_id', sessionId);
  }
  return sessionId;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('nova_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId(),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = { ...getAuthHeader(), ...(options.headers as Record<string, string>) };
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${normalizedEndpoint}`, {
      ...options,
      headers,
    });

    // If external VITE_API_URL returned 404 HTML page, fallback to same-origin /api
    const contentType = res.headers.get('content-type') || '';
    if (res.status === 404 && !contentType.includes('application/json') && API_BASE !== '/api') {
      res = await fetch(`/api${normalizedEndpoint}`, {
        ...options,
        headers,
      });
    }
  } catch (networkErr) {
    if (API_BASE !== '/api') {
      res = await fetch(`/api${normalizedEndpoint}`, {
        ...options,
        headers,
      });
    } else {
      throw networkErr;
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `So‘rov xatosi (${res.status})`);
  }
  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string, adminOnly = false) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, adminOnly }),
    }),

  register: (payload: { name: string; email: string; password: string; phone?: string }) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  // Products
  getProducts: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    return request<{ products: Product[]; total: number }>(`/products?${query.toString()}`);
  },

  getProductById: (id: string) => request<Product>(`/products/${id}`),

  createProduct: (data: Partial<Product>) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id: string, data: Partial<Product>) =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: string) =>
    request<{ message: string; id: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),

  // Cart
  getCart: () => request<{ items: CartItem[] }>('/cart'),
  saveCart: (items: CartItem[]) =>
    request<{ items: CartItem[] }>('/cart', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  // Wishlist
  getWishlist: () => request<{ items: WishlistItem[] }>('/wishlist'),
  saveWishlist: (items: WishlistItem[]) =>
    request<{ items: WishlistItem[] }>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  // Orders
  getOrders: (email?: string) => {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    return request<{ orders: Order[] }>(`/orders${q}`);
  },
  getOrderById: (id: string) => request<Order>(`/orders/${id}`),
  createOrder: (payload: any) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateOrderStatus: (id: string, status: Order['status']) =>
    request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Reviews
  getReviews: (productId?: string) => {
    const q = productId ? `?productId=${encodeURIComponent(productId)}` : '';
    return request<{ reviews: Review[] }>(`/reviews${q}`);
  },
  createReview: (payload: { productId: string; rating: number; review: string; customerName?: string }) =>
    request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateReview: (id: string, updates: Partial<Review>) =>
    request<Review>(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteReview: (id: string) =>
    request<{ message: string }>(`/reviews/${id}`, {
      method: 'DELETE',
    }),

  // Brands
  getBrands: () => request<{ brands: Brand[] }>('/brands'),
  createBrand: (data: Partial<Brand>) =>
    request<Brand>('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBrand: (id: string, data: Partial<Brand>) =>
    request<Brand>(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBrand: (id: string) =>
    request<{ message: string }>(`/brands/${id}`, {
      method: 'DELETE',
    }),

  // Categories
  getCategories: () => request<{ categories: Category[] }>('/categories'),
  createCategory: (data: Partial<Category>) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: Partial<Category>) =>
    request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    }),

  // Deals
  getDeals: () => request<{ deals: Deal[] }>('/deals'),
  createDeal: (data: any) =>
    request<Deal>('/deals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDeal: (id: string, data: Partial<Deal>) =>
    request<Deal>(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteDeal: (id: string) =>
    request<{ message: string }>(`/deals/${id}`, {
      method: 'DELETE',
    }),

  // Banners
  getBanners: () => request<{ banners: Banner[] }>('/banners'),
  createBanner: (data: Partial<Banner>) =>
    request<Banner>('/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBanner: (id: string, data: Partial<Banner>) =>
    request<Banner>(`/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBanner: (id: string) =>
    request<{ message: string }>(`/banners/${id}`, {
      method: 'DELETE',
    }),

  // Notifications
  getNotifications: () => request<{ notifications: NotificationItem[] }>('/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', {
      method: 'PUT',
    }),
  deleteNotification: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE',
    }),

  // Settings
  getSettings: () => request<StoreSettings>('/settings'),
  updateSettings: (data: Partial<StoreSettings>) =>
    request<StoreSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Inventory
  getInventory: () => request<{ inventory: any[] }>('/inventory'),
  adjustStock: (id: string, payload: { adjustment?: number; newStock?: number }) =>
    request<{ id: string; stock: number; product: Product }>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Customers & Users
  getCustomers: () => request<{ customers: User[] }>('/customers'),
  getUsers: () => request<{ users: User[] }>('/users'),
  updateUser: (id: string, data: Partial<User>) =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Analytics
  getAnalytics: (timeframe = '30d') => request<any>(`/analytics?timeframe=${timeframe}`),
};
