import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import React, { lazy, Suspense } from 'react';

const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const CombosAdmin = lazy(() => import('./pages/admin/Combos'));
const KitsAdmin = lazy(() => import('./pages/admin/Kits'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const GastosAdmin = lazy(() => import('./pages/admin/Gastos'));
const Login = lazy(() => import('./pages/admin/Login'));
const OrdersAdmin = lazy(() => import('./pages/admin/Orders'));
const ProductsAdmin = lazy(() => import('./pages/admin/Products'));
const ReportsAdmin = lazy(() => import('./pages/admin/Reports'));

const CategoriesAdmin = lazy(() => import('./pages/admin/Categories'));
const BrandsAdmin = lazy(() => import('./pages/admin/Brands'));

const ShopLayout = lazy(() => import('./components/shop/ShopLayout'));
const Cart = lazy(() => import('./pages/shop/Cart'));
const Catalog = lazy(() => import('./pages/shop/Catalog'));
const ComboDetail = lazy(() => import('./pages/shop/ComboDetail'));
const HomePage = lazy(() => import('./pages/home/HomePage'));
const ProductDetail = lazy(() => import('./pages/shop/ProductDetail'));

const PresupuestosAdmin = lazy(() => import('./pages/admin/Presupuestos'));

import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#111111',
          color: '#fff',
          border: '1px solid #2D2D2D',
        },
        success: { iconTheme: { primary: '#8B0000', secondary: '#fff' } }
      }} />
      <div className="min-h-screen flex flex-col font-sans">
        <main className="flex-1">
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
              <div className="w-8 h-8 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <Routes>
              {/* Shop Routes */}
              <Route path="/" element={<ShopLayout />}>
                <Route index element={<HomePage />} />
                <Route path="catalog" element={<Catalog />} />
                <Route path="producto/:id" element={<ProductDetail />} />
                <Route path="combos/:id" element={<ComboDetail />} />
                <Route path="cart" element={<Cart />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductsAdmin />} />
                <Route path="categories" element={<CategoriesAdmin />} />
                <Route path="brands" element={<BrandsAdmin />} />
                <Route path="kits" element={<KitsAdmin />} />
                <Route path="combos" element={<CombosAdmin />} />
                <Route path="orders" element={<OrdersAdmin />} />
                <Route path="reports" element={<ReportsAdmin />} />
                <Route path="gastos" element={<GastosAdmin />} />
                <Route path="presupuestos" element={<PresupuestosAdmin />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
