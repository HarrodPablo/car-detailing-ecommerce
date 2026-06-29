import {
  BarChart3,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Receipt,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';
import logoImg from '../../assets/goodshop_logo.svg'

const SidebarItem = ({ icon: Icon, label, to, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 mb-1 transition-colors relative ${isActive ? 'text-brand font-bold bg-dark-900' : 'text-gray-400 hover:text-gray-200 hover:bg-dark-border'} rounded-r-lg`}
    >
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand"></div>}
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // 1. Verificar si Zustand ya tiene al usuario
      if (user) return true;
      
      // 2. Fallbacks de localStorage (el nativo que agregamos o el persist de Zustand)
      const directToken = localStorage.getItem('adminToken');
      const zustandStateStr = localStorage.getItem('good-shop-auth');
      
      let hasPersistedToken = false;
      if (zustandStateStr) {
        try {
          const parsed = JSON.parse(zustandStateStr);
          hasPersistedToken = !!parsed.state?.token;
        } catch (e) {}
      }

      return !!(directToken || hasPersistedToken);
    };

    if (!checkAuth()) {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  // Evitamos renderizar el panel admin vacilando hasta que confirmemos
  const isAuthenticated = user || localStorage.getItem('adminToken') || localStorage.getItem('good-shop-auth')?.includes('token":"');
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-dark-base flex">

      {/* ── OVERLAY mobile ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-dark-card border-r border-dark-border
        z-30 flex flex-col
        transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Botón cerrar — solo mobile */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="p-6">
          <Link to="/" className="inline-block text-white">
            <img src={logoImg} alt="Good Shop Logo" className="h-10 brightness-0 invert" />
          </Link>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto pr-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/admin" onClick={() => setSidebarOpen(false)} />
          <SidebarItem icon={Package} label="Productos" to="/admin/products" onClick={() => setSidebarOpen(false)} />
          <SidebarItem icon={Layers} label="Kits / Combos" to="/admin/kits" onClick={() => setSidebarOpen(false)} />
          <SidebarItem icon={ImageIcon} label="Creador Combos" to="/admin/combos" onClick={() => setSidebarOpen(false)} />
          <SidebarItem icon={ShoppingCart} label="Pedidos" to="/admin/orders" onClick={() => setSidebarOpen(false)} />
          <SidebarItem icon={BarChart3} label="Reportes" to="/admin/reports" onClick={() => setSidebarOpen(false)} />
          <SidebarItem icon={Receipt} label="Gastos" to="/admin/gastos" onClick={() => setSidebarOpen(false)} />
          <SidebarItem icon={Tags} label="Marcas" to="/admin/brands" onClick={() => setSidebarOpen(false)} />
          <SidebarItem icon={Tags} label="Categorías" to="/admin/categories" onClick={() => setSidebarOpen(false)} />
          <SidebarItem icon={FileText} label="Presupuestos" to="/admin/presupuestos" onClick={() => setSidebarOpen(false)} />
        </nav>

        <div className="p-4 border-t border-dark-border">
          <div className="text-sm text-gray-400 mb-4 px-2">
            Logueado como <br /><span className="text-white font-medium">{user.email}</span>
          </div>
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="flex items-center gap-3 w-full px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ── ÁREA PRINCIPAL ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header mobile — solo visible en mobile */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-dark-card border-b border-dark-border sticky top-0 z-10">
          <span className="font-heading font-bold text-white text-lg italic">
            Good Shop
          </span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white p-1"
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
