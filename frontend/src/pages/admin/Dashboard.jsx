import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import api from '../../lib/axios';
import { formatCurrency } from '../../utils/formatters';

const DashboardWidget = ({ title, value, icon: Icon, colorClass }) => (
  <div className="glass-card p-6 flex items-center justify-between">
    <div>
      <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-mono font-bold text-white">{value}</h3>
    </div>
    <div className={`p-4 rounded-full ${colorClass} bg-opacity-10`}>
      <Icon size={28} className={colorClass.replace('bg-', 'text-')} />
    </div>
  </div>
);

const Dashboard = () => {
  const [reports, setReports] = useState({
    ventas: [],
    marcas: []
  });
  const [alerts, setAlerts] = useState({ stock: [], lotes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ventasRes, marcasRes, stockRes, lotesRes] = await Promise.all([
          api.get('/reports/ventas'),
          api.get('/reports/marcas'),
          api.get('/alerts/stock'),
          api.get('/alerts/lotes')
        ]);
        
        setReports({
          ventas: ventasRes.data,
          marcas: marcasRes.data
        });
        
        setAlerts({
          stock: stockRes.data,
          lotes: lotesRes.data
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-center py-20">Cargando dashboard...</div>;

  const totalVentas = reports.ventas.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Resumen de tu tienda Good Shop</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget 
          title="Ventas Totales" 
          value={formatCurrency(totalVentas)} 
          icon={DollarSign} 
          colorClass="bg-green-500 text-green-500" 
        />
        <DashboardWidget 
          title="Pedidos" 
          value={reports.ventas.length} 
          icon={ShoppingCart} 
          colorClass="bg-blue-500 text-blue-500" 
        />
        <DashboardWidget 
          title="Alertas Stock" 
          value={alerts.stock.length} 
          icon={AlertTriangle} 
          colorClass="bg-yellow-500 text-yellow-500" 
        />
        <DashboardWidget 
          title="Lotes por Vencer" 
          value={alerts.lotes.length} 
          icon={Clock} 
          colorClass="bg-red-500 text-red-500" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h2 className="text-xl font-heading font-bold text-white mb-6">Ventas de la Semana</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports.ventas.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(val) => `$${val}`} />
                <Tooltip cursor={{fill: '#1a1a1a'}} contentStyle={{backgroundColor: '#111111', borderColor: '#2D2D2D'}} />
                <Bar dataKey="total" fill="#8B0000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-heading font-bold text-white mb-6">Marcas más vendidas</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports.marcas.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                <XAxis type="number" stroke="#6B7280" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} width={100} />
                <Tooltip cursor={{fill: '#1a1a1a'}} contentStyle={{backgroundColor: '#111111', borderColor: '#2D2D2D'}} />
                <Bar dataKey="sales" fill="#8B0000" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Row */}
      {alerts.stock.length > 0 && (
        <div className="glass-card p-6 border-yellow-500/30 border">
          <h2 className="text-xl font-heading font-bold text-yellow-500 flex items-center gap-2 mb-4">
            <AlertTriangle /> Alertas de Stock Bajo
          </h2>
          <ul className="space-y-2">
            {alerts.stock.map(p => (
              <li key={p.id} className="flex justify-between items-center py-2 border-b border-dark-border last:border-0">
                <span className="text-gray-300">{p.name}</span>
                <span className="text-yellow-500 font-mono font-bold">{p.stock} unid.</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
