import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AdminLayout from './components/admin/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProductsAdmin from './pages/admin/Products';
import CombosAdmin from './pages/admin/Combos';
import OrdersAdmin from './pages/admin/Orders';

import ShopLayout from './components/shop/ShopLayout';
import Home from './pages/shop/Home';
import Catalog from './pages/shop/Catalog';
import ProductDetail from './pages/shop/ProductDetail';
import Cart from './pages/shop/Cart';

// Placeholders for less critical modules to satisfy routing
const CategoriesAdmin = () => <div className="p-8"><h2 className="text-3xl font-bold text-white mb-4">Categorías</h2><p className="text-gray-400">Módulo en construcción.</p></div>;
const BrandsAdmin = () => <div className="p-8"><h2 className="text-3xl font-bold text-white mb-4">Marcas</h2><p className="text-gray-400">Módulo en construcción.</p></div>;
const KitsAdmin = () => <div className="p-8"><h2 className="text-3xl font-bold text-white mb-4">Kits / Combos</h2><p className="text-gray-400">Gestiona los kits aquí. (En construcción)</p></div>;
const ReportsAdmin = () => <div className="p-8"><h2 className="text-3xl font-bold text-white mb-4">Reportes Detallados</h2><p className="text-gray-400">Ver Dashboard para reportes gráficos.</p></div>;
const SettingsAdmin = () => <div className="p-8"><h2 className="text-3xl font-bold text-white mb-4">Configuración</h2><p className="text-gray-400">Gestión de WhatsApp, Nombre, Umbrales, etc.</p></div>;

function App() {
  return (
    <Router>
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
          <Routes>
            {/* Shop Routes */}
            <Route path="/" element={<ShopLayout />}>
              <Route index element={<Home />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="product/:slug" element={<ProductDetail />} />
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
              <Route path="settings" element={<SettingsAdmin />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
