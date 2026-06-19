import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders?fecha=${filter}`);
      setOrders(res.data);
    } catch (error) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success('Estado actualizado');
      fetchOrders();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  if (loading) return <div className="text-center py-10">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-white">Pedidos</h1>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="bg-dark-900 border border-dark-border text-white rounded p-2 focus:outline-none focus:border-brand"
        >
          <option value="">Todos</option>
          <option value="hoy">Hoy</option>
          <option value="semana">Esta Semana</option>
          <option value="mes">Este Mes</option>
        </select>
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
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="bg-dark-base border border-dark-border text-sm text-gray-300 rounded p-1"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="preparando">Preparando</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
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
    </div>
  );
};

export default OrdersAdmin;
