import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../lib/axios';
import ProductCard from '../../../../src/components/shop/ProductCard';
import { SkeletonProductCard } from '../../../../src/components/ui/SkeletonCard';

const BestSellersSection = () => {
  const scrollRef = useRef(null);

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: async () => {
      // TODO: cambiar orderBy a salesCount cuando exista en el modelo
      const res = await api.get('/products?limit=8&orderBy=createdAt&order=desc');
      return res.data;
    }
  });

  const scroll = (direction) => {
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.firstElementChild?.clientWidth || 280;
      const gap = 24; // Tailwind gap-6 is 24px
      const scrollAmount = itemWidth + gap;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="bg-dark-base py-24 border-t border-dark-border">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-heading font-bold text-white uppercase mb-2">
              Más <span className="text-brand">Vendidos</span>
            </h2>
            <p className="text-gray-400 font-sans">
              Los productos favoritos de nuestros clientes
            </p>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border border-dark-border flex items-center justify-center text-white hover:border-brand hover:text-brand transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border border-dark-border flex items-center justify-center text-white hover:border-brand hover:text-brand transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* State Handling & Products Grid */}
        {isError ? (
          <div className="w-full py-12 text-center text-gray-500 font-sans">
            No se pudieron cargar los productos
          </div>
        ) : (
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide gap-6" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {isLoading ? (
              // Skeleton state
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex-none w-[280px] snap-center">
                  <SkeletonProductCard />
                </div>
              ))
            ) : (
              // Actual products
              products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  className="flex-none w-[280px] snap-center" 
                />
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellersSection;
