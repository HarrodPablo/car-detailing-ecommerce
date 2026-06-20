import { useState, useEffect, useCallback } from 'react';
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
      <div className="relative rounded-xl overflow-hidden 
                      border border-dark-border aspect-video 
                      max-w-3xl mx-auto">
        <img
          key={combos[actual].id}
          src={combos[actual].imageUrl || combos[actual].imagen_url}
          alt={combos[actual].name || combos[actual].nombre}
          className="w-full h-full object-cover transition-opacity 
                     duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t 
                        from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <p className="text-white font-heading font-bold text-2xl">
            {combos[actual].name || combos[actual].nombre}
          </p>
          {combos[actual].kitPrice && (
            <p className="text-brand font-mono font-bold text-xl">
              ${Number(combos[actual].kitPrice).toLocaleString('es-AR')}
            </p>
          )}
        </div>
      </div>

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
