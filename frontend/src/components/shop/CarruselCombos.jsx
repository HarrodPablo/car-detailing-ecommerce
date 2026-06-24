import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CarruselCombos = ({ combos }) => {
  const [actual, setActual] = useState(0);

  const siguiente = useCallback(() => {
    setActual(prev => (prev + 1) % combos.length);
  }, [combos.length]);

  const anterior = () => {
    setActual(prev => (prev - 1 + combos.length) % combos.length);
  };

  // Autoplay cada 4 segundos
  useEffect(() => {
    if (combos.length <= 1) return;
    const timer = setInterval(siguiente, 4000);
    return () => clearInterval(timer);
  }, [siguiente, combos.length]);

  if (!combos.length) return null;

  return (
    <div className="relative">
      {/* Imagen principal */}
      <Link 
        to={`/combos/${combos[actual].id}`}
        className="relative block rounded-xl overflow-hidden 
                   border border-dark-border aspect-video 
                   max-w-3xl mx-auto cursor-pointer group"
      >
        <img
          key={combos[actual].id}
          src={combos[actual].imageUrl || combos[actual].imagen_url}
          alt={combos[actual].name || combos[actual].nombre}
          width={800}
          height={450}
          fetchpriority="high"
          className="w-full h-full object-cover transition-transform 
                     duration-700 group-hover:scale-105"
        />
        {console.log('combo actual:', combos[actual])}
      </Link>

      {/* Controles — solo si hay más de 1 */}
      {combos.length > 1 && (
        <>
          <button
            onClick={anterior}
            className="absolute left-0 top-1/2 -translate-y-1/2 
                       -translate-x-2 bg-dark-card border 
                       border-dark-border rounded-full p-2 
                       text-white hover:bg-brand hover:border-brand 
                       transition-colors z-10"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={siguiente}
            className="absolute right-0 top-1/2 -translate-y-1/2 
                       translate-x-2 bg-dark-card border 
                       border-dark-border rounded-full p-2 
                       text-white hover:bg-brand hover:border-brand 
                       transition-colors z-10"
            aria-label="Siguiente"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {combos.map((_, i) => (
              <button
                key={i}
                onClick={() => setActual(i)}
                className={`transition-all rounded-full ${
                  i === actual
                    ? 'w-6 h-2 bg-brand'
                    : 'w-2 h-2 bg-dark-border hover:bg-gray-500'
                }`}
                aria-label={`Ir al combo ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CarruselCombos;
