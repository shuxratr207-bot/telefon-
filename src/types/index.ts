export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  oldPrice: number;
  discount: number;
  images: string[];
  colors: ProductColor[];
  storage: string[];
  ram: string[];
  processor: string;
  display: string;
  camera: string;
  battery: string;
  charging?: string;
  refreshRate?: string;
  os?: string;
  weight?: string;
  dimensions?: string;
  rating: number;
  reviews: number;
  stock: number;
  category: string;
  sku: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  deal: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  region?: string;
  city?: string;
  address?: string;
  createdAt: string;
  status: 'active' | 'inactive';
  totalSpent?: number;
  ordersCount?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  image: string;
  color: string;
  storage: string;
  ram?: string;
  price: number;
  quantity: number;
  stock: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  rating: number;
  category: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  image: string;
  color: string;
  storage: string;
  price: number;
  quantity: number;
}

export interface OrderCustomer {
  fullName: string;
  phone: string;
  email: string;
  region: string;
  city: string;
  address: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customer: OrderCustomer;
  deliveryMethod: 'standard' | 'express' | 'pickup';
  paymentMethod: 'card' | 'cod' | 'apple_pay';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  review: string;
  date: string;
  status: 'approved' | 'hidden';
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: 'active' | 'inactive';
  productCount?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  productCount?: number;
}

export interface Deal {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  brand: string;
  discount: number;
  originalPrice: number;
  dealPrice: number;
  startDate: string;
  endDate: string;
  stockLimit: number;
  soldCount: number;
  status: 'active' | 'scheduled' | 'ended';
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  badge?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export interface NotificationItem {
  id: string;
  type: 'order' | 'low_stock' | 'out_of_stock' | 'customer' | 'review';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface StoreSettings {
  store: {
    name: string;
    logo: string;
    phone: string;
    email: string;
    address: string;
    socialLinks: {
      instagram: string;
      telegram: string;
      youtube: string;
      tiktok: string;
    };
  };
  delivery: {
    standardPrice: number;
    expressPrice: number;
    freeDeliveryThreshold: number;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeoutMinutes: number;
  };
}
