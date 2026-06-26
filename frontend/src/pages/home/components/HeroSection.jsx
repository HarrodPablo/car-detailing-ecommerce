import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { SkeletonHeroCard } from '../../../../src/components/ui/SkeletonCard';
import api from '../../../lib/axios';
import { generateWhatsAppLink } from '../../../utils/whatsapp';

const VIDEO_URL = 'https://res.cloudinary.com/dgvwzbnez/video/upload/v1782496446/Slow_motion_close_up_of_a_hand_p31dce.mp4';

const HeroSection = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        document.addEventListener('click', () => video.play(), { once: true });
      });
    }
  }, []);

  const { data: products, isLoading } = useQuery({
    queryKey: ['hero-product'],
    queryFn: async () => {
      const res = await api.get('/products?limit=1&orderBy=createdAt&order=desc');
      return res.data;
    }
  });

  const latestProduct = products && products.length > 0 ? products[0] : null;

  return (
    <section className="relative min-h-[90vh] bg-dark-base flex items-center overflow-hidden">
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
        `}
      </style>

      {/* Background Image with Dark Gradient Overlay */}
      {/* Background Image with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            opacity: 1,
            transform: 'scale(1.15) translateY(6%)'
          }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r 
          from-dark-base via-dark-base/90 to-transparent"
          style={{ zIndex: 2 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t 
          from-dark-base to-transparent"
          style={{ zIndex: 2 }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Text & CTA */}
        <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-card border border-brand/30 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            <span className="text-sm font-medium text-gray-300 font-sans tracking-wide uppercase">
              Ventas minoristas y mayoristas
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 leading-tight">
            EL ARTE DEL <br />
            <span className="text-brand">DETAILING</span>
          </h1>

          <p className="text-lg text-gray-400 font-sans mb-10 max-w-xl leading-relaxed">
            Descubrí la excelencia en el cuidado automotor. Proveemos a profesionales y entusiastas con los productos más innovadores del mercado para lograr un acabado perfecto y duradero.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto">
            <Link to="/catalog" className="px-8 py-4 bg-brand hover:bg-brand-hover text-white font-sans font-semibold rounded transition-colors duration-300 flex items-center justify-center gap-2">
              Explorar Catálogo
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <a
              href={generateWhatsAppLink('543813333090', '¡Hola! Me gustaría recibir información sobre compras por mayor  🚗')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-transparent border border-white/20 hover:border-white text-white font-sans font-semibold rounded transition-colors duration-300 flex items-center justify-center"
            >
              Contacto Mayorista
            </a>
          </div>

          <div className="w-full h-px bg-dark-border mb-8"></div>

          {/* Stats */}
          <div className="flex items-center gap-8 md:gap-16">
            <div>
              <p className="text-3xl font-heading font-bold text-white mb-1">+500</p>
              <p className="text-sm text-gray-500 font-sans uppercase tracking-wider">Productos</p>
            </div>
            <div>
              <p className="text-3xl font-heading font-bold text-white mb-1">+20</p>
              <p className="text-sm text-gray-500 font-sans uppercase tracking-wider">Marcas</p>
            </div>
            <div>
              <p className="text-3xl font-heading font-bold text-brand mb-1">#1</p>
              <p className="text-sm text-gray-500 font-sans uppercase tracking-wider">En Tucumán</p>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Product Image */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end justify-center relative mt-12 lg:mt-0 min-h-[400px]">
          {isLoading ? (
            <SkeletonHeroCard />
          ) : latestProduct ? (
            <>
              {/* Decorative background glow behind the product */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand/20 blur-[100px] rounded-full pointer-events-none"></div>

              <div className="relative animate-float flex flex-col items-center">
                {/* Product Image */}
                <img
                  src={latestProduct.imageUrl || (latestProduct.images && latestProduct.images[0]?.url) || "https://images.unsplash.com/photo-1620853761821-399a9a3b6f00?q=80&w=600&auto=format&fit=crop"}
                  alt={latestProduct.name}
                  className="w-64 h-auto object-contain drop-shadow-2xl mix-blend-lighten mb-6"
                />

                {/* Product Info Card */}
                <div className="bg-dark-card border border-dark-border p-4 rounded-lg flex items-center gap-6 shadow-xl backdrop-blur-sm bg-opacity-90 max-w-sm">
                  <div className="flex-1">
                    <p className="text-brand text-[10px] font-sans font-bold uppercase tracking-wider mb-1">
                      {latestProduct.category?.name || latestProduct.Category?.name || "NUEVO INGRESO"}
                    </p>
                    <p className="text-white font-sans font-semibold text-sm line-clamp-2" title={latestProduct.name}>
                      {latestProduct.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-mono font-bold text-xl">
                      ${latestProduct.salePrice.toLocaleString('es-AR')}
                    </p>
                    <Link
                      to={`/producto/${latestProduct.slug || latestProduct.id}`}
                      className="text-gray-400 text-xs font-sans hover:text-brand transition-colors flex items-center gap-1 mt-1 justify-end w-full"
                    >
                      Ver más
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
