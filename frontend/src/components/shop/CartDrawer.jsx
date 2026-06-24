import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import useCartStore from '../../store/cart.store';
import { useEffect } from 'react';

const CartDrawer = () => {
  const { isCartOpen, closeCart, items, removeItem, updateQuantity, getTotal } = useCartStore();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isCartOpen]);

  const handleCheckout = () => {
    // Generate WhatsApp Message
    const phoneNumber = "1234567890"; // In a real app, this comes from settings
    
    let message = "Hola! Me gustaría realizar el siguiente pedido:\n\n";
    items.forEach(item => {
      message += `- ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toLocaleString()})\n`;
    });
    message += `\n*Total:* $${getTotal().toLocaleString()}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={closeCart}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-dark-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-800">
          <h2 className="text-xl font-bold flex items-center space-x-2 dark:text-white">
            <ShoppingBag size={24} className="text-primary-light" />
            <span>Tu Carrito</span>
          </h2>
          <button 
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag size={64} className="mb-4 opacity-20" />
              <p className="text-lg">Tu carrito está vacío</p>
              <button 
                onClick={closeCart}
                className="mt-6 text-primary-light hover:underline"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            items.map((item) => {
              const itemId = item.productId || item.kitId;
              const isKit = !!item.kitId;
              return (
              <div key={itemId} className="flex space-x-4 glass-card p-4">
                <div className="w-20 h-20 bg-dark-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} width={80} height={80} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag size={32} className="text-gray-600" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-100 line-clamp-1">{item.name}</h3>
                    <p className="text-primary-light font-medium mt-1">${item.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-3 bg-dark-950 rounded-lg p-1 border border-dark-800">
                      <button 
                        onClick={() => updateQuantity(itemId, Math.max(1, item.quantity - 1), isKit)}
                        aria-label="Disminuir cantidad"
                        className="p-1 hover:text-white text-gray-400 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-4 text-center font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(itemId, item.quantity + 1, isKit)}
                        disabled={item.stock !== undefined && item.quantity >= item.stock}
                        aria-label="Aumentar cantidad"
                        className={`p-1 transition-colors ${item.stock !== undefined && item.quantity >= item.stock ? 'text-dark-800 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(itemId, isKit)}
                      aria-label="Eliminar producto"
                      className="text-red-500/70 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-dark-800 bg-gray-50 dark:bg-dark-950">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400">Total estimado</span>
              <span className="text-2xl font-bold dark:text-white">${getTotal().toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full btn-primary py-4 text-lg shadow-lg shadow-primary-light/20 flex items-center justify-center space-x-2"
            >
              <span>Completar Pedido por WhatsApp</span>
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">
              Te enviaremos a WhatsApp para confirmar detalles de envío y pago.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
