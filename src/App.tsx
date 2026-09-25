import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { CompareProvider } from './context/CompareContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';

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
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any>(null);
  const { user, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
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

  // Check if current route is within the admin section
  const isAdminRoute = currentPath.startsWith('/admin');

  // Loading barrier for initial auth check
  if (isLoading && isAdminRoute && currentPath !== '/admin/login') {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Admin routing logic
  if (isAdminRoute) {
    if (currentPath === '/admin/login') {
      return <AdminLoginPage onNavigate={navigate} />;
    }

    // Role-based protection: if not logged in or not admin, redirect to login
    if (!isAdmin) {
      return <AdminLoginPage onNavigate={navigate} />;
    }

    return (
      <AdminLayout currentRoute={currentPath} onNavigate={navigate}>
        {currentPath === '/admin' && <AdminDashboardPage onNavigate={navigate} />}
        {currentPath === '/admin/products' && <AdminProductsPage onNavigate={navigate} />}
        {currentPath === '/admin/orders' && <AdminOrdersPage onNavigate={navigate} />}
        {currentPath === '/admin/customers' && <AdminCustomersPage onNavigate={navigate} />}
        {currentPath === '/admin/users' && <AdminUsersPage onNavigate={navigate} />}
        {currentPath === '/admin/brands' && <AdminBrandsPage onNavigate={navigate} />}
        {currentPath === '/admin/categories' && <AdminCategoriesPage onNavigate={navigate} />}
        {currentPath === '/admin/inventory' && <AdminInventoryPage onNavigate={navigate} />}
        {currentPath === '/admin/deals' && <AdminDealsPage onNavigate={navigate} />}
        {currentPath === '/admin/reviews' && <AdminReviewsPage onNavigate={navigate} />}
        {currentPath === '/admin/banners' && <AdminBannersPage onNavigate={navigate} />}
        {currentPath === '/admin/analytics' && <AdminAnalyticsPage onNavigate={navigate} />}
        {currentPath === '/admin/notifications' && <AdminNotificationsPage onNavigate={navigate} />}
        {currentPath === '/admin/settings' && <AdminSettingsPage onNavigate={navigate} />}
      </AdminLayout>
    );
  }

  // Customer Dynamic Product Detail Route Match: /phones/:id
  if (currentPath.startsWith('/phones/') && currentPath !== '/phones') {
    const id = currentPath.replace('/phones/', '').split('?')[0];
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col justify-between">
        <Header currentPath={currentPath} onNavigate={navigate} />
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

  switch (currentPath) {
    case '/phones':
      PageComponent = <PhonesPage onNavigate={navigate} />;
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
      <Header currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1">{PageComponent}</main>
      <QuickCartDrawer onNavigate={navigate} />
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
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
  );
}
