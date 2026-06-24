import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, ArrowLeft, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { formatCurrency } from '../../utils/formatters';
import useCartStore from '../../store/cart.store';

const ComboDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCombo = async () => {
      try {
        const res = await api.get(`/combos/${id}`);
        setCombo(res.data);
      } catch (err) {
        setError(true);
        toast.error('Combo no encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchCombo();
  }, [id]);

  const handleAddToCart = () => {
    if (!combo) return;
    
    addItem({
      kitId: combo.id,
      name: combo.name,
      price: combo.kitPrice,
      quantity,
      image: combo.imageUrl
    });
    
    toast.success('Combo agregado al carrito');
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Cargando combo...</div>;
  
  if (error || !combo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">El combo que buscas no existe.</h2>
        <button onClick={() => navigate('/')} className="btn-primary">Volver al inicio</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} aria-label="Volver" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 transition-colors">
        <ArrowLeft size={20} /> Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Col: Image */}
        <div className="space-y-4">
          <div className="aspect-video bg-dark-900 border border-dark-border rounded-xl overflow-hidden flex items-center justify-center relative shadow-2xl">
            {combo.imageUrl ? (
              <img src={combo.imageUrl} alt={combo.name} width={600} height={400} fetchpriority="high" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-600 flex flex-col items-center">
                <Package size={48} className="mb-2 opacity-50" />
                <span>Sin Imagen</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Info */}
        <div className="flex flex-col">
          <p className="text-brand uppercase tracking-widest font-bold mb-2">Combo Promocional</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 leading-tight">{combo.name}</h1>
          
          <div className="text-4xl font-mono text-brand mb-8 font-bold flex items-end gap-4">
            {formatCurrency(combo.kitPrice)}
          </div>
          
          {/* Productos Incluidos */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Package className="text-brand" size={24} /> Productos incluidos:
            </h3>
            <div className="space-y-3">
              {combo.items?.map((item) => {
                const p = item.product;
                const imgUrl = p.images?.find(i => i.isPrimary)?.url || p.images?.[0]?.url;
                
                return (
                  <Link 
                    key={item.id} 
                    to={`/product/${p.slug}`}
                    className="flex items-center gap-4 bg-dark-900 border border-dark-border p-3 rounded-lg hover:border-brand transition-colors group"
                  >
                    <div className="w-16 h-16 bg-black rounded flex items-center justify-center shrink-0">
                      {imgUrl ? (
                        <img src={imgUrl} alt={p.name} width={64} height={64} loading="lazy" className="w-full h-full object-contain mix-blend-screen" />
                      ) : (
                        <span className="text-xs text-gray-600">N/A</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-brand font-bold uppercase mb-1">{p.brand?.name}</p>
                      <p className="text-white font-medium truncate group-hover:text-brand transition-colors">{p.name}</p>
                      <p className="text-sm text-gray-400 mt-1">{item.quantity}x {formatCurrency(p.salePrice)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 mb-8 flex-1">
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <ShieldCheck className="text-brand" size={24} />
              <span>Calidad Premium Asegurada</span>
            </div>
          </div>

          <div className="border-t border-dark-border pt-8 mt-auto">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-gray-400 text-sm uppercase tracking-wider font-bold">Cantidad de Combos</span>
              <div className="flex items-center border border-dark-border rounded-sm bg-dark-900 overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Disminuir cantidad" className="px-4 py-2 text-gray-400 hover:text-white transition-colors">-</button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (isNaN(val)) {
                      setQuantity('');
                    } else {
                      setQuantity(Math.max(1, val));
                    }
                  }}
                  onBlur={() => {
                    if (quantity === '' || quantity < 1) setQuantity(1);
                  }}
                  className="w-14 text-center text-white font-mono bg-transparent outline-none appearance-none"
                  style={{ MozAppearance: 'textfield' }}
                />
                <button onClick={() => setQuantity(quantity + 1)} aria-label="Aumentar cantidad" className="px-4 py-2 text-gray-400 hover:text-white transition-colors">+</button>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full py-4 text-lg font-bold uppercase tracking-wider flex justify-center items-center gap-3 transition-colors bg-brand hover:bg-brand-hover text-white rounded-md"
            >
              <ShoppingCart />
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboDetail;
