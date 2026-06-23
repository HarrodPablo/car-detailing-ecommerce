import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { formatCurrency } from '../../utils/formatters';
import useCartStore from '../../store/cart.store';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
      } catch (error) {
        toast.error('Producto no encontrado');
        navigate('/catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock < quantity) {
      toast.error('No hay suficiente stock');
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.salePrice,
      quantity,
      image: product.images?.[0]?.url
    });
    
    toast.success('Producto agregado al carrito');
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Cargando producto...</div>;
  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 transition-colors">
        <ArrowLeft size={20} /> Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-dark-900 border border-dark-border rounded-lg overflow-hidden flex items-center justify-center p-8 relative">
            {product.isNew && <span className="absolute top-4 left-4 badge text-sm px-3 py-1">NUEVO</span>}
            {product.images && product.images.length > 0 ? (
              <img src={product.images[activeImage].url} alt={product.name} className="w-full h-full object-contain mix-blend-screen" />
            ) : (
              <div className="text-gray-600">Sin Imagen</div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-24 shrink-0 bg-dark-900 border rounded-lg overflow-hidden ${activeImage === idx ? 'border-brand' : 'border-dark-border opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover mix-blend-screen" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-brand uppercase tracking-widest font-bold mb-2">{product.brand?.name}</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 leading-tight">{product.name}</h1>
          
          <div className="text-3xl font-mono text-white mb-6 font-bold flex items-end gap-4">
            {formatCurrency(product.salePrice)}
            {product.discount > 0 && (
              <span className="text-xl text-gray-500 line-through font-normal">{formatCurrency(product.salePrice * 1.2)}</span>
            )}
          </div>
          
          <div className="prose prose-invert mb-8 max-w-none text-gray-400">
            <p>{product.description}</p>
          </div>

          <div className="space-y-6 mb-8 flex-1">
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <ShieldCheck className="text-brand" size={24} />
              <span>Producto 100% Original Garantizado</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <Truck className="text-brand" size={24} />
              <span>Envíos a todo el país</span>
            </div>
          </div>

          <div className="border-t border-dark-border pt-8 mt-auto">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-gray-400 text-sm uppercase tracking-wider font-bold">Cantidad</span>
              <div className="flex items-center border border-dark-border rounded-sm bg-dark-900 overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">-</button>
                <input 
                  type="number" 
                  min="1" 
                  max={product.stock} 
                  value={quantity} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (isNaN(val)) {
                      setQuantity('');
                    } else {
                      setQuantity(Math.min(product.stock, Math.max(1, val)));
                    }
                  }}
                  onBlur={() => {
                    if (quantity === '' || quantity < 1) setQuantity(1);
                  }}
                  className="w-14 text-center text-white font-mono bg-transparent outline-none appearance-none"
                  style={{ MozAppearance: 'textfield' }}
                />
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">+</button>
              </div>
              <span className="text-sm text-gray-500">{product.stock} disponibles</span>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 text-lg font-bold uppercase tracking-wider flex justify-center items-center gap-3 transition-colors ${product.stock > 0 ? 'bg-brand hover:bg-brand-hover text-white' : 'bg-dark-900 text-gray-500 cursor-not-allowed'}`}
            >
              <ShoppingCart />
              {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
