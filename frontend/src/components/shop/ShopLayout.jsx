import { Outlet, Link } from 'react-router-dom';
import { ShoppingCart, Menu } from 'lucide-react';
import useCartStore from '../../store/cart.store';
import logoImg from '../../assets/goodshop.svg';
import Footer from './Footer';

const ShopLayout = () => {
  const { items, getCartTotal } = useCartStore();

  return (
    <div className="flex flex-col min-h-screen bg-dark-base">
      <header className="bg-dark-950 border-b border-brand/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="md:hidden text-white" aria-label="Abrir menú"><Menu /></button>
            <Link to="/" className="flex items-center">
              <img src={logoImg} alt="Good Shop Logo" className="h-8 brightness-0 invert" />
            </Link>
            <nav className="hidden md:flex gap-6 ml-8">
              <Link to="/" className="text-gray-300 hover:text-white uppercase text-sm font-bold tracking-wide">Inicio</Link>
              <Link to="/catalog" className="text-gray-300 hover:text-white uppercase text-sm font-bold tracking-wide">Catálogo</Link>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/cart" className="relative text-white hover:text-brand transition-colors flex items-center gap-2">
              <ShoppingCart />
              <span className="hidden md:inline font-mono">${getCartTotal().toLocaleString('es-AR')}</span>
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default ShopLayout;
