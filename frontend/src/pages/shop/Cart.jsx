import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import useCartStore from '../../store/cart.store';
import { formatCurrency } from '../../utils/formatters';
import { generateWhatsAppLink } from '../../utils/whatsapp';
import api from '../../lib/axios';
import Remito from '../../components/shop/Remito';

const Cart = () => {
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [showRemito, setShowRemito] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data;
    }
  });

  const whatsappNumber = settings?.whatsapp_number || '5493813333090';

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    // Save order in backend
    try {
      await api.post('/orders', {
        customerName: customerName || 'Cliente Web',
        notes,
        total: getCartTotal(),
        items: items.map(i => ({
          productId: i.productId,
          kitId: i.kitId,
          quantity: i.quantity,
          unitPrice: i.price,
          subtotal: i.price * i.quantity
        }))
      });
      setShowRemito(true);
    } catch (error) {
      console.error('Error procesando pedido', error);
      alert('Hubo un error procesando su pedido. Intente nuevamente.');
    }
  };

  const handleConfirmWhatsApp = () => {
    const linea = '-'.repeat(28);
    
    const productos = items.map(i => 
      `  • ${i.quantity}x ${i.name} - ${formatCurrency(i.price * i.quantity)}`
    ).join('\n');

    const msg = 
`*Nuevo Pedido - Good Shop* 🛒
${linea}

*Productos:*
${productos}

${linea}
*Total: ${formatCurrency(getCartTotal())}*
${linea}

*Cliente:* ${customerName || 'No especificado'}
*Notas:* ${notes || 'Sin notas'}

_Good Shop Premium - Car Detailing Tucuman_`;

    const link = generateWhatsAppLink(whatsappNumber, msg);
    
    clearCart();
    setShowRemito(false);
    window.open(link, '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-dark-card border border-dark-border rounded-lg p-16 max-w-lg mx-auto">
          <ShoppingBag size={64} className="mx-auto text-dark-border mb-6" />
          <h2 className="text-3xl font-heading font-bold text-white mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-400 mb-8">Parece que aún no has agregado productos premium a tu carrito.</p>
          <Link to="/catalog" className="btn-primary">Ir al Catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold text-white mb-8">Tu Carrito</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.productId || item.kitId} className="glass-card p-4 flex gap-4 items-center">
              <div className="w-24 h-24 bg-dark-900 rounded overflow-hidden shrink-0 border border-dark-border">
                {item.image ? (
                  <img src={item.image} alt={item.name} width={96} height={96} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">No img</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                <p className="text-brand font-mono font-bold">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-dark-border rounded bg-dark-900">
                  <button onClick={() => updateQuantity(item.productId || item.kitId, Math.max(1, item.quantity - 1), !!item.kitId)} aria-label="Disminuir cantidad" className="px-3 py-1 text-gray-400 hover:text-white">-</button>
                  <span className="w-8 text-center text-white">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId || item.kitId, item.quantity + 1, !!item.kitId)} 
                    disabled={item.stock !== undefined && item.quantity >= item.stock}
                    aria-label="Aumentar cantidad"
                    className={`px-3 py-1 ${item.stock !== undefined && item.quantity >= item.stock ? 'text-dark-border cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                  >
                    +
                  </button>
                </div>
                <button onClick={() => removeItem(item.productId || item.kitId, !!item.kitId)} aria-label="Eliminar producto" className="text-red-500 hover:text-red-400 p-2">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 h-fit sticky top-28">
          <h2 className="text-xl font-heading font-bold text-white mb-6 border-b border-dark-border pb-4">Resumen del Pedido</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-300">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(getCartTotal())}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-xl pt-4 border-t border-dark-border">
              <span>Total</span>
              <span className="font-mono text-brand">{formatCurrency(getCartTotal())}</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full bg-dark-900 border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-brand"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Notas / Envío</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-dark-900 border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-brand resize-none"
                rows="3"
                placeholder="Datos de envío o aclaraciones..."
              ></textarea>
            </div>
          </div>

          <button onClick={handleCheckout} className="w-full btn-primary py-4 text-lg">
            Confirmar Pedido
          </button>
        </div>
      </div>

      {showRemito && (
        <Remito 
          items={items}
          customerName={customerName}
          notes={notes}
          total={getCartTotal()}
          onClose={() => setShowRemito(false)}
          onConfirm={handleConfirmWhatsApp}
        />
      )}
    </div>
  );
};

export default Cart;
