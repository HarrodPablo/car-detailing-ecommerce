import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CarruselCombos from '../../components/shop/CarruselCombos';
import HeroSection from '../home/components/HeroSection';
import api from '../../lib/axios';
import { formatCurrency } from '../../utils/formatters';

const Home = () => {
  const [combos, setCombos] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [combosRes, productsRes] = await Promise.all([
          api.get('/combos'),
          api.get('/products?isFeatured=true')
        ]);
        setCombos(combosRes.data);
        setFeaturedProducts(productsRes.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching home data', error);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div>
      {/* ===== HERO ===== */}
      <HeroSection />

      {/* ===== COMBOS ===== */}
      {combos.length > 0 && (
        <div className="py-20 bg-dark-card border-y border-dark-border">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-heading font-bold text-white text-center mb-12 uppercase tracking-wide">
              Combos <span className="text-brand">Destacados</span>
            </h2>
            <CarruselCombos combos={combos} />
          </div>
        </div>
      )}

      {/* ===== FEATURED PRODUCTS ===== */}
      <div className="py-20 max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-heading font-bold text-white text-center mb-12 uppercase tracking-wide">
          Lo más <span className="text-brand">Nuevo</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="glass-card group block overflow-hidden"
            >
              <div className="aspect-square bg-dark-900 relative">
                {product.isNew && (
                  <span className="absolute top-2 left-2 badge">NUEVO</span>
                )}
                {product.images?.[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover mix-blend-screen group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    Sin Imagen
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-brand uppercase tracking-widest font-bold mb-1">
                  {product.brand?.name}
                </p>
                <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-brand transition-colors">
                  {product.name}
                </h3>
                <p className="text-xl font-mono text-white">
                  {formatCurrency(product.salePrice)}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/catalog" className="btn-secondary">
            Ver todo el catálogo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;