import { useQuery } from '@tanstack/react-query';
import { Package2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../lib/axios';
import { SkeletonComboCard } from '../../../../src/components/ui/SkeletonCard';

const CombosSection = () => {
  const { data: combos = [], isLoading, isError } = useQuery({
    queryKey: ['combos-home'],
    queryFn: async () => {
      // Usamos el endpoint GET /api/combos.
      // (Alternativa: GET /api/products?type=combo)
      const res = await api.get('/combos');
      return res.data;
    }
  });

  if (!isLoading && (!combos || combos.length === 0)) {
    return null;
  }

  const displayedCombos = combos.slice(0, 3);

  return (
    <section className="bg-dark-base py-24 border-t border-dark-border">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-[#8B0000] text-xs font-bold uppercase tracking-widest mb-2">
              ARMA TU KIT
            </p>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white uppercase mb-2">
              COMBOS <span className="text-[#8B0000]">PREMIUM</span>
            </h2>
            <p className="text-gray-400 font-sans">
              Todo lo que necesitás en un solo paquete
            </p>
          </div>
          
          <Link 
            to="/catalog?type=combo" 
            className="text-white hover:text-brand transition-colors font-sans font-medium flex items-center gap-2 group"
          >
            Ver todos
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* State Handling & Grid */}
        {isError ? (
          <div className="w-full py-12 text-center text-gray-500 font-sans">
            No se pudieron cargar los combos
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              // Skeleton Loading State
              Array.from({ length: 3 }).map((_, idx) => (
                <SkeletonComboCard key={idx} />
              ))
            ) : (
              // Actual Combos
              displayedCombos.map((combo) => {
                const imgUrl = combo.imageUrl || (combo.images && combo.images[0]?.url);
                return (
                  <div 
                    key={combo.id}
                    className="bg-[#111] border border-[#2D2D2D] rounded-xl overflow-hidden hover:border-[#8B0000] transition-colors duration-300 relative flex flex-col"
                  >
                    {/* Image Area */}
                    <div className="w-full aspect-square bg-[#1a1a1a] flex items-center justify-center p-4">
                      {imgUrl ? (
                        <img 
                          src={imgUrl} 
                          alt={combo.name} 
                          loading="lazy"
                          width="300"
                          height="300"
                          className="w-full h-full object-contain mix-blend-screen"
                        />
                      ) : (
                        <Package2 size={48} className="text-[#2D2D2D]" />
                      )}
                    </div>
                    
                    <div className="absolute top-3 left-3 bg-[#8B0000] text-white text-[10px] font-bold tracking-widest px-2 py-1 rounded">
                      COMBO
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-heading font-black text-white text-base uppercase mb-1 line-clamp-2">
                        {combo.name}
                      </h3>
                      
                      <div className="mt-auto pt-2">
                        <p className="font-mono text-[#8B0000] text-xl font-bold mt-2">
                          ${(combo.salePrice || combo.price || 0).toLocaleString('es-AR')}
                        </p>
                        
                        <Link 
                          to={`/combos/${combo.slug || combo.id}`}
                          className="w-full mt-4 bg-[#1a1a1a] hover:bg-[#8B0000] border border-[#2D2D2D] hover:border-[#8B0000] text-white font-bold text-sm tracking-widest py-3 rounded-lg transition-colors duration-200 flex items-center justify-center uppercase"
                        >
                          Ver combo →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CombosSection;
