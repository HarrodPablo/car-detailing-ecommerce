import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/axios';

const BrandsStrip = () => {
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await api.get('/brands');
      return res.data;
    }
  });

  return (
    <section className="bg-dark-card border-y border-dark-border py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-xs font-sans font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">
          Marcas Disponibles
        </h2>
        
        {/* Horizontal scroll container with hidden scrollbar */}
        <div className="flex overflow-x-auto pb-4 gap-12 items-center snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {isLoading ? (
            // Skeleton Loading State
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex-none snap-center">
                <div className="h-8 w-32 bg-[#1a1a1a] animate-pulse rounded"></div>
              </div>
            ))
          ) : brands.length === 0 ? (
            <div className="w-full text-center text-gray-600 font-sans text-sm py-2">
              No hay marcas cargadas
            </div>
          ) : (
            brands.map((brand) => (
              <div 
                key={brand.id} 
                className="flex-none snap-center opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              >
                <span className="text-2xl font-heading font-bold text-white whitespace-nowrap uppercase">
                  {brand.name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default BrandsStrip;
