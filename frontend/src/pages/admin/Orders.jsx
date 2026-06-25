import html2pdf from 'html2pdf.js';
import { FileDown, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [customDates, setCustomDates] = useState({ desde: '', hasta: '' });

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
        generatePDF(order);
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

  const generatePDF = (order) => {
    const container = document.createElement('div');
    container.style.padding = '40px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.color = '#333';
    container.style.backgroundColor = '#fff';
    container.style.width = '800px';

    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
      itemsHtml = order.items.map(item => {
        const name = item.product?.name || item.kit?.name || 'Item eliminado';
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.unitPrice)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.subtotal)}</td>
          </tr>
        `;
      }).join('');
    } else {
      itemsHtml = `<tr><td colspan="4" style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">Sin ítems</td></tr>`;
    }

    container.innerHTML = `
      <div style="margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="margin: 0; font-size: 28px; color: #8B0000; text-transform: uppercase; font-weight: bold;">REMITO INTERNO</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Documento de control comercial</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 16px; font-weight: bold;">Pedido #${order.id}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Fecha: ${formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div style="margin-bottom: 30px; padding: 15px; border: 1px solid #ddd; background-color: #f9f9f9;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Datos del Cliente</h3>
        <p style="margin: 5px 0;"><strong>Nombre:</strong> ${order.customerName || 'Cliente anónimo'}</p>
        <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${order.customerPhone || '-'}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 10px; border-bottom: 2px solid #ccc; text-align: left;">Cant.</th>
            <th style="padding: 10px; border-bottom: 2px solid #ccc; text-align: left;">Descripción</th>
            <th style="padding: 10px; border-bottom: 2px solid #ccc; text-align: right;">P. Unit.</th>
            <th style="padding: 10px; border-bottom: 2px solid #ccc; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
        <div style="border: 2px solid #8B0000; padding: 15px 30px; background-color: #fffaf0;">
          <p style="margin: 0; font-size: 18px;"><strong>Total:</strong> <span style="font-size: 24px; color: #8B0000; font-weight: bold; margin-left: 15px;">${formatCurrency(order.total)}</span></p>
        </div>
      </div>

      <div style="text-align: center; border-top: 1px dashed #ccc; padding-top: 20px; color: #888;">
        <p style="margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Documento No Válido como Factura</p>
        <p style="margin: 5px 0 0 0; font-size: 11px;">Uso exclusivo interno para control de stock y despachos.</p>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `Pedido_${order.id}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(container).save();
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

                     {/* <button
                        onClick={() => generatePDF(order)}
                        title="Descargar Remito"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-900 rounded transition-colors"
                      >
                        <FileDown size={18} />
                      </button>*/}

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
    </div>
  );
};

export default OrdersAdmin;
