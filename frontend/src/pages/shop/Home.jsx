import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      {/* Hero */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0A0A] z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Car Detailing" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="badge text-lg px-4 py-1">VENTAS MINORISTAS Y MAYORISTAS</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-heading font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            EL ARTE DEL <span className="text-brand">DETAILING</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Productos premium para el cuidado automotor. Resultados profesionales para entusiastas y expertos.
          </p>
          <Link to="/catalog" className="btn-primary text-lg px-8 py-4">
            Explorar Catálogo
          </Link>
        </div>
      </div>

      {/* Combos Carousel */}
      {combos.length > 0 && (
        <div className="py-20 bg-dark-card border-y border-dark-border">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-heading font-bold text-white text-center mb-12 uppercase tracking-wide">
              Combos <span className="text-brand">Destacados</span>
            </h2>
            <div className="flex overflow-x-auto gap-6 pb-8 snap-x">
              {combos.map(combo => (
                <div key={combo.id} className="min-w-[80vw] md:min-w-[600px] snap-center shrink-0 rounded-lg overflow-hidden relative group">
                  <img src={combo.imageUrl} alt={combo.name} className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="btn-primary">Ver Combo</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div className="py-20 max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-heading font-bold text-white text-center mb-12 uppercase tracking-wide">
          Lo más <span className="text-brand">Nuevo</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <Link key={product.id} to={`/product/${product.slug}`} className="glass-card group block overflow-hidden">
              <div className="aspect-square bg-dark-900 relative">
                {product.isNew && (
                  <span className="absolute top-2 left-2 badge">NUEVO</span>
                )}
                {product.images?.[0] ? (
                  <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover mix-blend-screen group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">Sin Imagen</div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-brand uppercase tracking-widest font-bold mb-1">{product.brand?.name}</p>
                <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-brand transition-colors">{product.name}</h3>
                <p className="text-xl font-mono text-white">{formatCurrency(product.salePrice)}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/catalog" className="btn-secondary">Ver todo el catálogo</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
