import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/axios';

import img3d from '../../../assets/brands/3d.svg';
import all_detail from '../../../assets/brands/all_detail.svg';
import fullcar from '../../../assets/brands/fullcar.svg';
import koch_chemie from '../../../assets/brands/koch-chemie.svg';
import laffite from '../../../assets/brands/laffite.svg';
import max_shine from '../../../assets/brands/max_shine.svg';
import menzerna from '../../../assets/brands/menzerna.svg';
import overcars from '../../../assets/brands/overcars.svg';
import rupes from '../../../assets/brands/rupes.svg';
import sonax from '../../../assets/brands/sonax.svg';
import ternova from '../../../assets/brands/ternova.svg';
import toxic from '../../../assets/brands/toxic.svg';
import vintex from '../../../assets/brands/vintex.svg';
import vonixx from '../../../assets/brands/vonixx.svg';
import wurth from '../../../assets/brands/wurth.svg';

const logoMap = {
  '3d': img3d,
  'all detail': all_detail,
  'fullcar': fullcar,
  'full car': fullcar,
  'koch chemie': koch_chemie,
  'laffite': laffite,
  'laffitte': laffite,
  'max shine': max_shine,
  'maxshine': max_shine,
  'menzerna': menzerna,
  'overcars': overcars,
  'rupes': rupes,
  'sonax': sonax,
  'ternova': ternova,
  'ternnova': ternova,
  'toxic shine': toxic,
  'toxic': toxic,
  'vintex': vintex,
  'vonixx': vonixx,
  'wurth': wurth,
  'würth': wurth,
  'wurt': wurth,
};

const BrandItem = ({ brand }) => {
  const normalizedName = brand.name?.toLowerCase().trim();
  const logoSrc = logoMap[normalizedName];

  return (
    <div className="flex-none flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer px-4 w-32 md:w-48 h-16 md:h-24">
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={brand.name}
          className="w-full h-full object-contain brightness-0 invert"
          title={brand.name}
        />
      ) : (
        <span className="text-2xl font-heading font-bold text-white whitespace-nowrap uppercase text-center">
          {brand.name}
        </span>
      )}
    </div>
  );
};

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

        {/* Carousel container */}
        <div className="overflow-hidden relative w-full">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 30s linear infinite;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>

          {isLoading ? (
            <div className="flex gap-12 justify-center pb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="h-8 w-32 bg-[#1a1a1a] animate-pulse rounded"></div>
              ))}
            </div>
          ) : brands.length === 0 ? (
            <div className="w-full text-center text-gray-600 font-sans text-sm py-2">
              No hay marcas cargadas
            </div>
          ) : (
            <div className="flex w-max animate-marquee pb-4 hover:pause">
              {/* Primer set de marcas */}
              <div className="flex gap-12 items-center pr-12">
                {brands.map((brand) => (
                  <BrandItem key={`b1-${brand.id}`} brand={brand} />
                ))}
              </div>
              {/* Segundo set idéntico para el loop infinito */}
              <div className="flex gap-12 items-center pr-12">
                {brands.map((brand) => (
                  <BrandItem key={`b2-${brand.id}`} brand={brand} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BrandsStrip;
