import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { CompareProvider } from './context/CompareContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';

// Customer Components
import { Header } from './components/common/Header.tsx';
import { Footer } from './components/common/Footer.tsx';
import { QuickCartDrawer } from './components/common/QuickCartDrawer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { PhonesPage } from './pages/PhonesPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { BrandsPage } from './pages/BrandsPage.tsx';
import { ComparePage } from './pages/ComparePage.tsx';
import { DealsPage } from './pages/DealsPage.tsx';
import { WishlistPage } from './pages/WishlistPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderSuccessPage } from './pages/OrderSuccessPage.tsx';
import { OrdersPage } from './pages/OrdersPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout.tsx';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.tsx';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.tsx';
import { AdminProductsPage } from './pages/admin/AdminProductsPage.tsx';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.tsx';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage.tsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.tsx';
import { AdminBrandsPage } from './pages/admin/AdminBrandsPage.tsx';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage.tsx';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage.tsx';
import { AdminDealsPage } from './pages/admin/AdminDealsPage.tsx';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage.tsx';
import { AdminBannersPage } from './pages/admin/AdminBannersPage.tsx';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage.tsx';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage.tsx';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.tsx';

function RouterContent() {
  const [currentPath, setCurrentPath] = useState<string>(
    () => (window.location.pathname || '/') + (window.location.search || '')
  );
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any>(null);
  const { isAdmin, isLoading } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath((window.location.pathname || '/') + (window.location.search || ''));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [pathname, queryStr = ''] = currentPath.split('?');
  const urlParams = new URLSearchParams(queryStr);

  // Check if current route is within the admin section
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    if (!isLoading && isAdminRoute && pathname !== '/admin/login' && !isAdmin) {
      window.history.replaceState({}, '', '/admin/login');
      setCurrentPath('/admin/login');
    }
  }, [isLoading, isAdminRoute, pathname, isAdmin]);

  // Loading barrier for initial auth check
  if (isLoading && isAdminRoute && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Admin routing logic
  if (isAdminRoute) {
    if (pathname === '/admin/login' || !isAdmin) {
      return <AdminLoginPage onNavigate={navigate} />;
    }

    return (
      <AdminLayout currentRoute={pathname} onNavigate={navigate}>
        {pathname === '/admin' && <AdminDashboardPage onNavigate={navigate} />}
        {pathname === '/admin/products' && <AdminProductsPage onNavigate={navigate} />}
        {pathname === '/admin/orders' && <AdminOrdersPage onNavigate={navigate} />}
        {pathname === '/admin/customers' && <AdminCustomersPage onNavigate={navigate} />}
        {pathname === '/admin/users' && <AdminUsersPage onNavigate={navigate} />}
        {pathname === '/admin/brands' && <AdminBrandsPage onNavigate={navigate} />}
        {pathname === '/admin/categories' && <AdminCategoriesPage onNavigate={navigate} />}
        {pathname === '/admin/inventory' && <AdminInventoryPage onNavigate={navigate} />}
        {pathname === '/admin/deals' && <AdminDealsPage onNavigate={navigate} />}
        {pathname === '/admin/reviews' && <AdminReviewsPage onNavigate={navigate} />}
        {pathname === '/admin/banners' && <AdminBannersPage onNavigate={navigate} />}
        {pathname === '/admin/analytics' && <AdminAnalyticsPage onNavigate={navigate} />}
        {pathname === '/admin/notifications' && <AdminNotificationsPage onNavigate={navigate} />}
        {pathname === '/admin/settings' && <AdminSettingsPage onNavigate={navigate} />}
      </AdminLayout>
    );
  }

  // Customer Dynamic Product Detail Route Match: /phones/:id
  if (pathname.startsWith('/phones/') && pathname !== '/phones') {
    const id = pathname.replace('/phones/', '');
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col justify-between">
        <Header currentPath={pathname} onNavigate={navigate} />
        <main className="flex-1">
          <ProductDetailPage productId={id} onNavigate={navigate} />
        </main>
        <QuickCartDrawer onNavigate={navigate} />
        <Footer onNavigate={navigate} />
      </div>
    );
  }

  // Customer Routing Matcher
  let PageComponent = <HomePage onNavigate={navigate} />;

  switch (pathname) {
    case '/phones':
      PageComponent = (
        <PhonesPage
          onNavigate={navigate}
          initialBrand={urlParams.get('brand') || undefined}
          initialSearch={urlParams.get('search') || undefined}
          initialSort={urlParams.get('sort') || undefined}
        />
      );
      break;
    case '/brands':
      PageComponent = <BrandsPage onNavigate={navigate} />;
      break;
    case '/compare':
      PageComponent = <ComparePage onNavigate={navigate} />;
      break;
    case '/deals':
      PageComponent = <DealsPage onNavigate={navigate} />;
      break;
    case '/wishlist':
      PageComponent = <WishlistPage onNavigate={navigate} />;
      break;
    case '/cart':
      PageComponent = <CartPage onNavigate={navigate} />;
      break;
    case '/checkout':
      PageComponent = (
        <CheckoutPage
          onNavigate={navigate}
          onOrderSuccess={order => setLastPlacedOrder(order)}
        />
      );
      break;
    case '/order-success':
      PageComponent = (
        <OrderSuccessPage
          orderData={lastPlacedOrder}
          onNavigate={navigate}
        />
      );
      break;
    case '/orders':
      PageComponent = <OrdersPage onNavigate={navigate} />;
      break;
    case '/signin':
      PageComponent = <ProfilePage initialMode="login" onNavigate={navigate} />;
      break;
    case '/signup':
      PageComponent = <ProfilePage initialMode="register" onNavigate={navigate} />;
      break;
    case '/profile':
      PageComponent = <ProfilePage onNavigate={navigate} />;
      break;
    case '/about':
      PageComponent = <AboutPage onNavigate={navigate} />;
      break;
    case '/':
    default:
      PageComponent = <HomePage onNavigate={navigate} />;
      break;
  }

  return (
    <div className="min-h-screen bg-[#090a0f] flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      <Header currentPath={pathname} onNavigate={navigate} />
      <main className="flex-1">{PageComponent}</main>
      <QuickCartDrawer onNavigate={navigate} />
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <ToastProvider>
                <RouterContent />
              </ToastProvider>
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
