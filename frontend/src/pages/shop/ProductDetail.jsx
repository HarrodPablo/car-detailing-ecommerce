import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package2, ShoppingCart, ShieldCheck, Truck, RotateCcw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { formatCurrency } from '../../utils/formatters';
import useCartStore from '../../store/cart.store';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="bg-[#111] rounded-xl border border-[#2D2D2D] aspect-square w-full"></div>
          <div className="space-y-6">
            <div className="h-4 w-32 bg-[#2D2D2D] rounded"></div>
            <div className="h-10 w-3/4 bg-[#2D2D2D] rounded"></div>
            <div className="h-8 w-40 bg-[#2D2D2D] rounded"></div>
            <div className="space-y-3 pt-6">
              <div className="h-4 w-full bg-[#2D2D2D] rounded"></div>
              <div className="h-4 w-full bg-[#2D2D2D] rounded"></div>
              <div className="h-4 w-2/3 bg-[#2D2D2D] rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-dark-card border border-dark-border rounded-xl p-16 max-w-lg mx-auto">
          <Package2 size={64} className="mx-auto text-dark-border mb-6" />
          <h2 className="text-3xl font-heading font-bold text-white mb-4">Producto no encontrado</h2>
          <p className="text-[#666] mb-8">El producto que estás buscando no existe o fue eliminado.</p>
          <button onClick={() => navigate('/catalog')} className="btn-primary flex items-center justify-center gap-2 w-full mx-auto max-w-xs">
            <ArrowLeft size={18} /> Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.salePrice,
      quantity,
      stock: product.stock,
      image: product.imageUrl || (product.images && product.images[0]?.url)
    });
    
    toast.success('Producto agregado al carrito');
  };

  const hasSpecs = product.contentAmount || product.applicationType || product.experienceLevel || product.countryOfOrigin;
  const imageUrl = product.imageUrl || (product.images && product.images[0]?.url);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-8">
        <Link to="/" className="text-[#666] hover:text-white transition-colors">Inicio</Link>
        <span className="text-[#666] mx-2">/</span>
        <Link to="/catalog" className="text-[#666] hover:text-white transition-colors">Catálogo</Link>
        <span className="text-[#666] mx-2">/</span>
        <span className="text-white">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* COLUMNA IZQUIERDA */}
        <div className="bg-[#111] rounded-xl border border-[#2D2D2D] p-8 flex items-center justify-center min-h-[400px]">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.name} 
              width={600}
              height={600}
              fetchpriority="high"
              className="object-contain max-h-[500px] w-full mix-blend-screen" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#666]">
              <Package2 size={64} className="mb-4 opacity-50" />
              <span>Sin Imagen</span>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA */}
        <div className="flex flex-col">
          <div className="text-[#8B0000] text-xs font-bold tracking-widest uppercase mb-2">
            {product.category?.name || product.brand?.name || 'Producto'}
          </div>
          
          <h1 className="font-heading font-black text-4xl text-white leading-tight">
            {product.name}
          </h1>
          
          {product.sku && (
            <div className="text-[#666] text-sm mt-1">
              Item #: {product.sku}
            </div>
          )}

          <div className="font-mono text-4xl font-bold text-white mt-4 flex items-end gap-4">
            {formatCurrency(product.salePrice)}
            {product.isOffer && (
              <span className="text-xl text-gray-500 line-through font-normal">{formatCurrency(product.salePrice * 1.2)}</span>
            )}
          </div>

          <p className="text-[#999] text-base leading-relaxed mt-4 whitespace-pre-wrap">
            {product.longDescription || product.shortDescription || 'Sin descripción disponible para este producto.'}
          </p>

          {/* Especificaciones */}
          {hasSpecs && (
            <div className="bg-[#111] border border-[#2D2D2D] rounded-xl p-5 mt-6">
              <h3 className="font-bold text-white mb-3">Especificaciones</h3>
              <div className="flex flex-col">
                {product.contentAmount && (
                  <div className="flex justify-between py-2 border-b border-[#2D2D2D] last:border-0">
                    <span className="text-[#666]">Tamaño / Contenido</span>
                    <span className="text-white font-medium">{product.contentAmount} {product.contentUnit}</span>
                  </div>
                )}
                {product.applicationType && (
                  <div className="flex justify-between py-2 border-b border-[#2D2D2D] last:border-0">
                    <span className="text-[#666]">Tipo de Aplicación</span>
                    <span className="text-white font-medium capitalize">{product.applicationType}</span>
                  </div>
                )}
                {product.experienceLevel && (
                  <div className="flex justify-between py-2 border-b border-[#2D2D2D] last:border-0">
                    <span className="text-[#666]">Nivel de Experiencia</span>
                    <span className="text-white font-medium capitalize">{product.experienceLevel}</span>
                  </div>
                )}
                {product.countryOfOrigin && (
                  <div className="flex justify-between py-2 border-b border-[#2D2D2D] last:border-0">
                    <span className="text-[#666]">Origen</span>
                    <span className="text-white font-medium">{product.countryOfOrigin}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Spacer to push controls to bottom if content is short */}
          <div className="mt-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center bg-[#111] border border-[#2D2D2D] rounded-lg overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Disminuir cantidad"
                  className="px-4 py-3 text-[#666] hover:text-white transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center text-white font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  aria-label="Aumentar cantidad"
                  className={`px-4 py-3 transition-colors ${quantity >= product.stock ? 'text-[#333] cursor-not-allowed' : 'text-[#666] hover:text-white'}`}
                >
                  +
                </button>
              </div>
              <div className="font-bold">
                {product.stock > 0 ? (
                  <span className="text-green-400">En stock ({product.stock})</span>
                ) : (
                  <span className="text-red-400">Sin stock</span>
                )}
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase flex justify-center items-center gap-3 transition-colors ${product.stock > 0 ? 'bg-[#8B0000] hover:bg-[#A00000] text-white' : 'bg-[#111] text-[#666] border border-[#2D2D2D] cursor-not-allowed'}`}
            >
              <ShoppingCart size={20} />
              {product.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
            </button>

            {/* Garantías */}
            <div className="grid grid-cols-3 gap-2 border-t border-[#2D2D2D] pt-5 mt-5">
              <div className="flex flex-col items-center text-center">
                <Truck className="text-[#8B0000] mb-2" size={24} />
                <span className="text-white text-sm font-bold mb-1">Envío disponible</span>
                <span className="text-[#666] text-xs">A todo el país</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <ShieldCheck className="text-[#8B0000] mb-2" size={24} />
                <span className="text-white text-sm font-bold mb-1">Producto original</span>
                <span className="text-[#666] text-xs">Garantía de autenticidad</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw className="text-[#8B0000] mb-2" size={24} />
                <span className="text-white text-sm font-bold mb-1">Devoluciones</span>
                <span className="text-[#666] text-xs">Consultá condiciones</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
