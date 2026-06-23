import {
  BarChart3,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Tags
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';

const SidebarItem = ({ icon: Icon, label, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
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

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-dark-base overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col h-full shrink-0 z-10">
        <div className="p-6">
          <Link to="/" className="text-2xl font-heading font-bold text-white flex flex-col">
            <span>GOOD SHOP</span>
            <span className="text-xs text-brand tracking-widest uppercase">Premium</span>
          </Link>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto pr-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/admin" />
          <SidebarItem icon={Package} label="Productos" to="/admin/products" />
          <SidebarItem icon={Layers} label="Kits / Combos" to="/admin/kits" />
          <SidebarItem icon={ImageIcon} label="Creador Combos" to="/admin/combos" />
          <SidebarItem icon={ShoppingCart} label="Pedidos" to="/admin/orders" />
          <SidebarItem icon={BarChart3} label="Reportes" to="/admin/reports" />
          <SidebarItem icon={Tags} label="Marcas" to="/admin/brands" />
          <SidebarItem icon={Tags} label="Categorías" to="/admin/categories" />
          <SidebarItem icon={Settings} label="Configuración" to="/admin/settings" />
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

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-dark-base p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
