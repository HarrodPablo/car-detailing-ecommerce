import { FileDown, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Remito from '../../components/shop/Remito';

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [customDates, setCustomDates] = useState({ desde: '', hasta: '' });
  const [selectedOrderForRemito, setSelectedOrderForRemito] = useState(null);

  const fetchOrders = async () => {
    try {
      let query = `?fecha=${filter}`;
      if (filter === 'custom' && customDates.desde && customDates.hasta) {
        query += `&desde=${customDates.desde}&hasta=${customDates.hasta}`;
      }
      const res = await api.get(`/orders${query}`);
      setOrders(res.data);
    } catch (error) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter !== 'custom' || (filter === 'custom' && customDates.desde && customDates.hasta)) {
      fetchOrders();
    }
  }, [filter, customDates]);

  const updateStatus = async (order, status) => {
    try {
      await api.patch(`/orders/${order.id}/status`, { status });
      toast.success('Estado actualizado');
      fetchOrders();

      if (status === 'entregado') {
        setSelectedOrderForRemito(order);
        if (order.customerPhone) {
          const name = order.customerName || 'Cliente';
          const msg = encodeURIComponent(`Hola ${name}, te adjuntamos el comprobante de tu pedido #${order.id}. ¡Gracias por tu compra! - Good Shop`);
          const rawPhone = order.customerPhone.replace(/\D/g, ''); // Ensure only numbers
          window.open(`https://wa.me/54${rawPhone}?text=${msg}`, '_blank');
        } else {
          toast('Pedido marcado como entregado, pero no hay teléfono registrado para enviar el comprobante', { icon: '⚠️' });
        }
      }
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const deleteOrder = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este pedido permanentemente?')) {
      try {
        await api.delete(`/orders/${id}`);
        toast.success('Pedido eliminado');
        fetchOrders();
      } catch (error) {
        toast.error('Error al eliminar el pedido');
      }
    }
  };



  if (loading) return <div className="text-center py-10">Cargando...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-heading font-bold text-white">Pedidos</h1>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-dark-900 border border-dark-border text-white rounded p-2 focus:outline-none focus:border-brand"
          >
            <option value="">Todos</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mes</option>
            <option value="custom">Rango personalizado</option>
          </select>

          {filter === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customDates.desde}
                onChange={(e) => setCustomDates({ ...customDates, desde: e.target.value })}
                className="bg-dark-900 border border-dark-border text-white rounded p-2 focus:border-brand outline-none"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={customDates.hasta}
                onChange={(e) => setCustomDates({ ...customDates, hasta: e.target.value })}
                className="bg-dark-900 border border-dark-border text-white rounded p-2 focus:border-brand outline-none"
              />
            </div>
          )}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-900 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">ID / Fecha</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-dark-900/50 transition-colors">
                  <td className="p-4">
                    <p className="text-white font-mono">#{order.id}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-300">{order.customerName || 'Cliente anónimo'}</p>
                    <p className="text-xs text-gray-500">{order.customerPhone}</p>
                  </td>
                  <td className="p-4 text-white font-mono">{formatCurrency(order.total)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs uppercase font-bold rounded ${order.status === 'cancelado' ? 'bg-red-500/20 text-red-500' : 'bg-brand/20 text-brand'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order, e.target.value)}
                        className="bg-dark-base border border-dark-border text-sm text-gray-300 rounded p-1"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_camino">En camino</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>

                      <button
                        onClick={() => setSelectedOrderForRemito(order)}
                        title="Ver Remito"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-900 rounded transition-colors"
                      >
                        <FileDown size={18} />
                      </button>

                      <button
                        onClick={() => deleteOrder(order.id)}
                        title="Eliminar Pedido"
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No hay pedidos encontrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrderForRemito && (() => {
        const rawNotes = selectedOrderForRemito.notes || '';
        const hasPayment = rawNotes.startsWith('Pago: ');
        const paymentMethodFromNotes = hasPayment ? rawNotes.split('\n')[0].replace('Pago: ', '') : undefined;
        const actualNotes = hasPayment ? rawNotes.split('\n').slice(1).join('\n') : rawNotes;

        return (
          <Remito
            orderId={selectedOrderForRemito.id}
            showDownload={true}
            items={selectedOrderForRemito.items.map(item => ({
              name: item.product?.name || item.kit?.name || 'Item eliminado',
              quantity: item.quantity,
              price: item.unitPrice
            }))}
            customerName={selectedOrderForRemito.customerName}
            paymentMethod={paymentMethodFromNotes}
            notes={[
              selectedOrderForRemito.customerPhone ? `Tel: ${selectedOrderForRemito.customerPhone}` : '',
              actualNotes
            ].filter(Boolean).join('\n\n')}
            total={selectedOrderForRemito.total}
            onClose={() => setSelectedOrderForRemito(null)}
            onConfirm={() => {
              if (selectedOrderForRemito.customerPhone) {
                const name = selectedOrderForRemito.customerName || 'Cliente';
                const msg = encodeURIComponent(`Hola ${name}, te adjuntamos el comprobante de tu pedido #${selectedOrderForRemito.id}. ¡Gracias por tu compra! - Good Shop`);
                const rawPhone = selectedOrderForRemito.customerPhone.replace(/\D/g, '');
                window.open(`https://wa.me/54${rawPhone}?text=${msg}`, '_blank');
              } else {
                toast('No hay teléfono registrado para este pedido', { icon: '⚠️' });
              }
            }}
          />
        );
      })()}
    </div>
  );
};

export default OrdersAdmin;
