import { Link } from 'react-router-dom';
import { Package2 } from 'lucide-react';

const ComboCard = ({ combo }) => {
  const imgUrl = combo.imageUrl || (combo.images && combo.images[0]?.url);

  return (
    <div className="bg-[#111] border border-[#2D2D2D] rounded-xl overflow-hidden hover:border-[#8B0000] transition-colors duration-300 relative flex flex-col h-full">
      {/* Image Area */}
      <div className="w-full aspect-square bg-[#1a1a1a] flex items-center justify-center p-4">
        {imgUrl ? (
          <img 
            src={imgUrl} 
            alt={combo.name} 
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
            ${(combo.kitPrice || combo.salePrice || combo.price || 0).toLocaleString('es-AR')}
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
};

export default ComboCard;
