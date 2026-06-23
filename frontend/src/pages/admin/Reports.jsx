import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, TrendingDown, CreditCard, Sparkles, Receipt, RefreshCw, HandCoins } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PIE_COLORS = ['#8B0000', '#B22222', '#CD5C5C', '#F08080', '#FA8072', '#E9967A', '#FFA07A'];

const DashboardWidget = ({ title, value, icon: Icon, colorClass, subtitle, subtitleColorClass }) => (
  <div className="glass-card p-6 flex flex-col justify-between h-full">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-mono font-bold text-white">{value}</h3>
      </div>
      <div className={`p-4 rounded-full ${colorClass} bg-opacity-10`}>
        <Icon size={28} className={colorClass.replace('bg-', 'text-')} />
      </div>
    </div>
    {subtitle && (
      <div className={`text-sm font-medium flex items-center gap-1 ${subtitleColorClass}`}>
        {subtitle.includes('+') ? <TrendingUp size={16} /> : subtitle.includes('-') ? <TrendingDown size={16} /> : null}
        <span>{subtitle}</span>
      </div>
    )}
  </div>
);

const Reports = () => {
  const [filterType, setFilterType] = useState('mes');
  const [customDates, setCustomDates] = useState({ desde: '', hasta: '' });
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({
    resumen: { facturacion: 0, pedidos: 0, ticketPromedio: 0, comparativo: 0 },
    ventas: { chartData: [] },
    productosTop: [],
    categorias: [],
    marcas: [],
    orders: [] // Para la tabla
  });

  const getDatesForFilter = () => {
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (filterType) {
      case 'hoy':
        // Same as default
        break;
      case 'semana':
        startDate.setDate(startDate.getDate() - 6);
        break;
      case 'mes':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'año':
        startDate.setDate(startDate.getDate() - 365);
        break;
      case 'custom':
        if (customDates.desde && customDates.hasta) {
          startDate = new Date(customDates.desde);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customDates.hasta);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    return { 
      desde: startDate.toISOString().split('T')[0], 
      hasta: endDate.toISOString().split('T')[0] 
    };
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { desde, hasta } = getDatesForFilter();
      const query = `?desde=${desde}&hasta=${hasta}`;

      const [resumenRes, ventasRes, productosRes, categoriasRes, marcasRes, ordersRes] = await Promise.all([
        api.get(`/reports/resumen${query}`),
        api.get(`/reports/ventas${query}`),
        api.get(`/reports/productos-top${query}`),
        api.get(`/reports/categorias${query}`),
        api.get(`/reports/marcas${query}`),
        // Fetch orders using standard endpoint but with date filter. 
        // We will just fetch all and filter in frontend if endpoint doesn't support date range directly,
        // or actually since it's just for display, let's fetch orders and filter them here.
        api.get('/orders')
      ]);

      // Filter orders by date manually since /orders doesn't have a from/to query out of the box in backend
      const { startDate, endDate } = (() => {
         const d = new Date(desde);
         d.setHours(0,0,0,0);
         const h = new Date(hasta);
         h.setHours(23,59,59,999);
         return { startDate: d, endDate: h };
      })();

      const filteredOrders = ordersRes.data.filter(o => {
        const d = new Date(o.createdAt);
        return d >= startDate && d <= endDate;
      });

      setData({
        resumen: resumenRes.data,
        ventas: ventasRes.data,
        productosTop: productosRes.data,
        categorias: categoriasRes.data,
        marcas: marcasRes.data,
        orders: filteredOrders
      });
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo recargar si no es custom, o si es custom y tiene ambas fechas
    if (filterType !== 'custom' || (filterType === 'custom' && customDates.desde && customDates.hasta)) {
      fetchAllData();
    }
  }, [filterType, customDates]);

  const { resumen, ventas, productosTop, categorias, marcas, orders } = data;

  const getComparativoText = (val) => {
    if (val === 0) return 'Sin cambios vs período anterior';
    if (val > 0) return `+${val}% vs período anterior`;
    return `${val}% vs período anterior`;
  };

  const comparativoColor = resumen.comparativo > 0 ? 'text-green-500' : resumen.comparativo < 0 ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="space-y-8">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Reportes y Estadísticas</h1>
          <p className="text-gray-400">Análisis de rendimiento de la tienda</p>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-dark-900 border border-dark-border text-white rounded p-2 focus:outline-none focus:border-brand"
          >
            <option value="hoy">Hoy</option>
            <option value="semana">Últimos 7 días</option>
            <option value="mes">Últimos 30 días</option>
            <option value="año">Último año</option>
            <option value="custom">Rango personalizado</option>
          </select>

          {filterType === 'custom' && (
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={customDates.desde}
                onChange={(e) => setCustomDates({...customDates, desde: e.target.value})}
                className="bg-dark-900 border border-dark-border text-white rounded p-2 focus:border-brand outline-none"
              />
              <span className="text-gray-400">-</span>
              <input 
                type="date" 
                value={customDates.hasta}
                onChange={(e) => setCustomDates({...customDates, hasta: e.target.value})}
                className="bg-dark-900 border border-dark-border text-white rounded p-2 focus:border-brand outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando reportes...</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardWidget 
              title="Facturación Total" 
              value={formatCurrency(resumen.facturacion)} 
              icon={DollarSign} 
              colorClass="bg-green-500 text-green-500" 
              subtitle={getComparativoText(resumen.comparativo)}
              subtitleColorClass={comparativoColor}
            />
            <DashboardWidget 
              title="Cantidad de Pedidos" 
              value={resumen.pedidos} 
              icon={ShoppingCart} 
              colorClass="bg-blue-500 text-blue-500" 
            />
            <DashboardWidget 
              title="Ticket Promedio" 
              value={formatCurrency(resumen.ticketPromedio)} 
              icon={CreditCard} 
              colorClass="bg-purple-500 text-purple-500" 
            />
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Ventas en el tiempo */}
            <div className="glass-card p-6 flex flex-col">
              <h2 className="text-xl font-heading font-bold text-white mb-6">Ventas por Período</h2>
              <div className="flex-1 min-h-[300px]">
                {ventas.chartData.length === 0 || ventas.chartData.every(d => d.total === 0) ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">Sin ventas registradas</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ventas.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                      <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickFormatter={(val) => {
                        const parts = val.split('-');
                        if(parts.length === 3) return `${parts[2]}/${parts[1]}`;
                        if(parts.length === 2) return `${parts[1]}/${parts[0]}`;
                        return val;
                      }} />
                      <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(val) => `$${val}`} width={80} />
                      <Tooltip cursor={{fill: '#1a1a1a'}} contentStyle={{backgroundColor: '#111111', borderColor: '#2D2D2D'}} />
                      <Bar dataKey="total" fill="#8B0000" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Categorías */}
            <div className="glass-card p-6 flex flex-col">
              <h2 className="text-xl font-heading font-bold text-white mb-6">Distribución por Categoría</h2>
              <div className="flex-1 min-h-[300px]">
                {categorias.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">Sin categorías registradas</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorias}
                        dataKey="total"
                        nameKey="categoria"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        label={false}
                      >
                        {categorias.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor: '#111111', borderColor: '#2D2D2D'}} formatter={(val) => formatCurrency(val)} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Productos */}
            <div className="glass-card p-6 flex flex-col">
              <h2 className="text-xl font-heading font-bold text-white mb-6">Top 5 Productos (Unidades)</h2>
              <div className="flex-1 min-h-[300px]">
                {productosTop.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">Sin productos vendidos</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productosTop} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                      <XAxis type="number" stroke="#6B7280" fontSize={12} allowDecimals={false} />
                      <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} width={120} tick={{fill: '#9CA3AF'}} />
                      <Tooltip cursor={{fill: '#1a1a1a'}} contentStyle={{backgroundColor: '#111111', borderColor: '#2D2D2D'}} />
                      <Bar dataKey="cantidad" fill="#8B0000" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Marcas */}
            <div className="glass-card p-6 flex flex-col">
              <h2 className="text-xl font-heading font-bold text-white mb-6">Top 5 Marcas (Facturación)</h2>
              <div className="flex-1 min-h-[300px]">
                {marcas.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">Sin marcas vendidas</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marcas.slice(0, 5)} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                      <XAxis type="number" stroke="#6B7280" fontSize={12} tickFormatter={(val) => `$${val}`} />
                      <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} width={120} tick={{fill: '#9CA3AF'}} />
                      <Tooltip cursor={{fill: '#1a1a1a'}} contentStyle={{backgroundColor: '#111111', borderColor: '#2D2D2D'}} formatter={(val) => formatCurrency(val)} />
                      <Bar dataKey="sales" fill="#8B0000" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

          {/* ORDERS TABLE */}
          <div className="glass-card overflow-hidden mt-8">
            <div className="p-6 border-b border-dark-border">
              <h2 className="text-xl font-heading font-bold text-white">Pedidos en el período</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-dark-900 text-gray-400 text-sm uppercase tracking-wider">
                    <th className="p-4 font-medium">ID / Fecha</th>
                    <th className="p-4 font-medium">Cliente</th>
                    <th className="p-4 font-medium">Total</th>
                    <th className="p-4 font-medium">Estado</th>
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
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-500">No hubo pedidos en el período seleccionado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
