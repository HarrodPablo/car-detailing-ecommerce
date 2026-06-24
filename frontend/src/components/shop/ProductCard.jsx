import { Link } from 'react-router-dom';
import { Package, ShoppingCart } from 'lucide-react';
import useCartStore from '../../store/cart.store';

const ProductCard = ({ 
  product, 
  isCombo = false,
  className = "" 
}) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: isCombo ? null : product.id,
      kitId: isCombo ? product.id : null,
      name: product.name,
      price: isCombo ? (product.kitPrice || product.salePrice || product.price) : product.salePrice,
      quantity: 1,
      stock: isCombo ? undefined : product.stock,
      image: product.imageUrl || (product.images && product.images[0]?.url)
    });
  };

  const imgUrl = product.imageUrl || (product.images && product.images[0]?.url);
  const linkTo = isCombo ? `/combos/${product.slug || product.id}` : `/producto/${product.slug || product.id}`;
  const brandName = isCombo ? 'Combo Exclusivo' : product.brand?.name;
  const badgeText = isCombo ? "COMBO" : (product.isNew ? "NUEVO" : "DESTACADO");
  const price = isCombo ? (product.kitPrice || product.salePrice || product.price) : product.salePrice;

  return (
    <Link 
      to={linkTo}
      className={`bg-dark-card border border-dark-border rounded-xl p-4 flex flex-col group hover:border-brand/50 transition-colors ${className}`}
    >
      {/* Product Image Box */}
      <div className="relative aspect-square bg-[#111] rounded-lg mb-4 flex items-center justify-center overflow-hidden">
        <div className="absolute top-3 left-3 bg-[#8B0000] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest z-10">
          {badgeText}
        </div>
        
        {/* Out of Stock overlay */}
        {!isCombo && product.stock <= 0 && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-red-500/90 text-white text-[10px] font-bold uppercase rounded z-10 backdrop-blur-sm">
            Sin Stock
          </span>
        )}
        
        {imgUrl ? (
          <img 
            src={imgUrl} 
            alt={product.name} 
            width={400}
            height={400}
            loading="lazy"
            className="w-3/4 h-3/4 object-contain transition-transform duration-500 group-hover:scale-110 mix-blend-lighten"
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-gray-600">
            <Package className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1">
        {brandName && (
          <p className="text-[#8B0000] text-xs uppercase tracking-widest mb-1">
            {brandName}
          </p>
        )}
        
        <h3 className="text-white font-bold text-lg leading-tight mb-2 flex-1 group-hover:text-brand transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        {!isCombo && product.sku && (
          <p className="text-[#666] font-mono text-xs mb-2">SKU: {product.sku}</p>
        )}
        
        <p className="text-[#8B0000] font-mono text-xl mb-4">
          ${price?.toLocaleString('es-AR')}
        </p>

        <button 
          onClick={handleAddToCart}
          disabled={!isCombo && product.stock <= 0}
          className={`w-full py-3 text-white font-sans font-medium rounded transition-colors duration-200 flex items-center justify-center gap-2 mt-auto ${
            (!isCombo && product.stock <= 0) 
              ? 'bg-dark-900 text-gray-400 cursor-not-allowed' 
              : 'bg-[#1a1a1a] hover:bg-[#8B0000]'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {(!isCombo && product.stock <= 0) ? 'Sin Stock' : 'Agregar al Carrito'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
