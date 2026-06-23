import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../lib/axios';
import { formatCurrency } from '../../utils/formatters';

const Catalog = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentCategory = searchParams.get('category');
  const currentBrand = searchParams.get('brand');
  const isCombos = currentCategory === 'combos';

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        let url = '';
        if (isCombos) {
          url = '/combos';
        } else {
          url = '/products?';
          if (currentCategory) url += `categoryId=${currentCategory}&`;
          if (currentBrand) url += `brandId=${currentBrand}&`;
        }
        
        const res = await api.get(url);
        setItems(res.data);
      } catch (error) {
        console.error('Error fetching catalog', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [currentCategory, currentBrand, isCombos]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold text-white mb-8">
        {isCombos ? 'Catálogo de Combos' : 'Catálogo de Productos'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar (simplified) */}
        <aside className="space-y-6">
          <div className="glass-card p-4">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-dark-border pb-2">Categorías</h3>
            <div className="space-y-2 text-gray-400">
              <Link to="/catalog" className={`block hover:text-brand ${!currentCategory ? 'text-brand' : ''}`}>Todas</Link>
              <Link to="/catalog?category=combos" className={`block hover:text-brand ${currentCategory === 'combos' ? 'text-brand' : ''}`}>Combos</Link>
              <Link to="/catalog?category=1" className={`block hover:text-brand ${currentCategory === '1' ? 'text-brand' : ''}`}>Shampoos</Link>
              <Link to="/catalog?category=2" className={`block hover:text-brand ${currentCategory === '2' ? 'text-brand' : ''}`}>Ceras</Link>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Cargando catálogo...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.length > 0 ? items.map(item => {
                const linkTo = isCombos ? `/combos/${item.id}` : `/product/${item.slug}`;
                const imgUrl = isCombos ? item.imageUrl : item.images?.[0]?.url;
                const brandName = isCombos ? 'Combo Exclusivo' : item.brand?.name;
                const price = isCombos ? item.kitPrice : item.salePrice;

                return (
                  <Link key={item.id} to={linkTo} className="glass-card group block overflow-hidden">
                    <div className="aspect-square bg-dark-900 relative">
                      {!isCombos && item.isNew && (
                        <span className="absolute top-2 left-2 badge">NUEVO</span>
                      )}
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-screen" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">Sin Imagen</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-brand uppercase tracking-widest font-bold mb-1">{brandName}</p>
                      <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-brand transition-colors">{item.name}</h3>
                      <p className="text-xl font-mono text-white">{formatCurrency(price)}</p>
                    </div>
                  </Link>
                );
              }) : (
                <div className="col-span-full text-center py-20 text-gray-400 glass-card">
                  No se encontraron resultados con estos filtros.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;
