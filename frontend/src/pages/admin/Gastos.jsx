import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Upload, Receipt, Plus, Trash2, ChevronDown, ChevronUp, RefreshCw, X, Save } from 'lucide-react';
import api from '../../lib/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';

const GastosAdmin = () => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [expandedRow, setExpandedRow] = useState(null);

  // IA Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const fileInputRef = useRef(null);

  // Manual form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    monto: '',
    categoria: 'general',
    proveedor: ''
  });

  const fetchGastos = async () => {
    setLoading(true);
    try {
      const [year, month] = filterMonth.split('-');
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      
      const res = await api.get(`/gastos?desde=${start.toISOString().split('T')[0]}&hasta=${end.toISOString().split('T')[0]}`);
      setGastos(res.data);
    } catch (error) {
      toast.error('Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGastos();
  }, [filterMonth]);

  const handleScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('factura', file);

    setIsScanning(true);
    setScannedData(null);
    try {
      const res = await api.post('/gastos/escanear-factura', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const data = res.data;
      // Initialize form with scanned data
      setScannedData({
        fecha: data.fecha || new Date().toISOString().split('T')[0],
        descripcion: data.items && data.items.length > 0 ? `Compra a ${data.proveedor || 'proveedor'}` : '',
        monto: data.total || 0,
        categoria: 'stock',
        proveedor: data.proveedor || '',
        items: data.items || []
      });
      toast.success('Factura procesada con éxito');
    } catch (error) {
      if (error.response?.status === 503) {
        toast.error('La IA no está configurada (Falta API Key)');
      } else {
        toast.error('No se pudo procesar la factura');
      }
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveScanned = async () => {
    if (!scannedData.descripcion || !scannedData.monto) {
      return toast.error('Descripción y monto son obligatorios');
    }
    try {
      await api.post('/gastos', scannedData);
      toast.success('Gasto guardado correctamente');
      setScannedData(null);
      fetchGastos();
    } catch (error) {
      toast.error('Error al guardar el gasto');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gastos', manualForm);
      toast.success('Gasto agregado');
      setManualForm({
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
        monto: '',
        categoria: 'general',
        proveedor: ''
      });
      setShowManualForm(false);
      fetchGastos();
    } catch (error) {
      toast.error('Error al agregar gasto');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este gasto?')) return;
    try {
      await api.delete(`/gastos/${id}`);
      toast.success('Gasto eliminado');
      fetchGastos();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  // KPIs
  const totalMes = gastos.reduce((acc, g) => acc + Number(g.monto), 0);
  const gastoMasAlto = gastos.length > 0 ? gastos.reduce((max, g) => Number(g.monto) > Number(max.monto) ? g : max, gastos[0]) : null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Gastos</h1>
          <p className="text-gray-400">Control de egresos y facturas inteligente</p>
        </div>
      </div>

      {/* SECTION 1: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between border-t-4 border-t-red-500">
          <p className="text-gray-400 text-sm font-medium mb-1">Total Gastos del Mes</p>
          <h3 className="text-3xl font-mono font-bold text-red-500">{formatCurrency(totalMes)}</h3>
        </div>
        <div className="glass-card p-6 flex flex-col justify-between border-t-4 border-t-orange-500">
          <p className="text-gray-400 text-sm font-medium mb-1">Gasto Más Alto</p>
          <h3 className="text-2xl font-mono font-bold text-white">
            {gastoMasAlto ? formatCurrency(gastoMasAlto.monto) : '$0'}
          </h3>
          {gastoMasAlto && <p className="text-sm text-gray-500 mt-1 truncate">{gastoMasAlto.descripcion}</p>}
        </div>
        <div className="glass-card p-6 flex flex-col justify-between border-t-4 border-t-blue-500">
          <p className="text-gray-400 text-sm font-medium mb-1">Gastos Registrados</p>
          <h3 className="text-3xl font-mono font-bold text-white">{gastos.length}</h3>
        </div>
      </div>

      {/* SECTION 2: IA Scanner */}
      <div className="glass-card border border-brand/30 overflow-hidden">
        <div className="bg-brand/10 p-4 border-b border-brand/30 flex items-center gap-3">
          <div className="p-2 bg-brand/20 rounded-full text-brand">
            <Receipt size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Escanear Factura con IA</h2>
            <p className="text-sm text-gray-400">Subí un ticket o factura y Gemini extraerá los datos automáticamente.</p>
          </div>
        </div>
        
        <div className="p-6">
          {!isScanning && !scannedData && (
            <div 
              className="border-2 border-dashed border-dark-border hover:border-brand/50 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={48} className="text-gray-500 mb-4" />
              <p className="text-white font-medium mb-1">Hacé click para subir una imagen</p>
              <p className="text-sm text-gray-500">Soporta JPG, PNG, WEBP, PDF</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleScan} 
                className="hidden" 
                accept="image/*,application/pdf"
              />
            </div>
          )}

          {isScanning && (
            <div className="py-12 flex flex-col items-center justify-center text-brand">
              <RefreshCw size={48} className="animate-spin mb-4" />
              <p className="font-medium text-lg">Procesando con IA...</p>
              <p className="text-sm text-gray-400 mt-2">Extrayendo ítems y montos de la factura</p>
            </div>
          )}

          {scannedData && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Datos Extraídos</h3>
                <button onClick={() => setScannedData(null)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Proveedor</label>
                  <input type="text" value={scannedData.proveedor} onChange={e => setScannedData({...scannedData, proveedor: e.target.value})} className="w-full bg-dark-900 border border-dark-border rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fecha</label>
                  <input type="date" value={scannedData.fecha} onChange={e => setScannedData({...scannedData, fecha: e.target.value})} className="w-full bg-dark-900 border border-dark-border rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Monto Total</label>
                  <input type="number" step="0.01" value={scannedData.monto} onChange={e => setScannedData({...scannedData, monto: e.target.value})} className="w-full bg-dark-900 border border-dark-border rounded p-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Categoría</label>
                  <select value={scannedData.categoria} onChange={e => setScannedData({...scannedData, categoria: e.target.value})} className="w-full bg-dark-900 border border-dark-border rounded p-2 text-white">
                    <option value="stock">Stock / Mercadería</option>
                    <option value="envios">Envíos / Logística</option>
                    <option value="marketing">Marketing / Publicidad</option>
                    <option value="servicios">Servicios / Suscripciones</option>
                    <option value="general">General / Otros</option>
                  </select>
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                  <label className="block text-xs text-gray-500 mb-1">Descripción Breve</label>
                  <input type="text" value={scannedData.descripcion} onChange={e => setScannedData({...scannedData, descripcion: e.target.value})} className="w-full bg-dark-900 border border-dark-border rounded p-2 text-white" placeholder="Ej: Compra de microfibras" />
                </div>
              </div>

              {scannedData.items && scannedData.items.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-300 mb-2">Ítems Detectados</h4>
                  <div className="bg-dark-900 rounded border border-dark-border overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-dark-base text-gray-500">
                        <tr>
                          <th className="p-2">Ítem</th>
                          <th className="p-2 text-center">Cant</th>
                          <th className="p-2 text-right">P. Unit</th>
                          <th className="p-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-border">
                        {scannedData.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2 text-gray-300">{item.nombre}</td>
                            <td className="p-2 text-center font-mono text-gray-400">{item.cantidad}</td>
                            <td className="p-2 text-right font-mono text-gray-400">{formatCurrency(item.precioUnitario)}</td>
                            <td className="p-2 text-right font-mono text-white">{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={handleSaveScanned} className="bg-brand hover:bg-brand-hover text-white px-6 py-2 rounded font-bold flex items-center gap-2 transition-colors">
                  <Save size={18} /> Guardar Gasto
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Manual Form */}
      <div>
        <button 
          onClick={() => setShowManualForm(!showManualForm)}
          className="flex items-center gap-2 text-brand hover:text-white transition-colors font-medium mb-4"
        >
          {showManualForm ? <ChevronUp size={20} /> : <Plus size={20} />}
          {showManualForm ? 'Ocultar carga manual' : 'Cargar gasto manualmente'}
        </button>

        {showManualForm && (
          <form onSubmit={handleManualSubmit} className="glass-card p-6 animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Descripción *</label>
              <input required type="text" value={manualForm.descripcion} onChange={e => setManualForm({...manualForm, descripcion: e.target.value})} className="w-full bg-dark-900 border border-dark-border rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Monto *</label>
              <input required type="number" step="0.01" value={manualForm.monto} onChange={e => setManualForm({...manualForm, monto: e.target.value})} className="w-full bg-dark-900 border border-dark-border rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha *</label>
              <input required type="date" value={manualForm.fecha} onChange={e => setManualForm({...manualForm, fecha: e.target.value})} className="w-full bg-dark-900 border border-dark-border rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Categoría</label>
              <select value={manualForm.categoria} onChange={e => setManualForm({...manualForm, categoria: e.target.value})} className="w-full bg-dark-900 border border-dark-border rounded p-2 text-white">
                <option value="stock">Stock</option>
                <option value="envios">Envíos</option>
                <option value="marketing">Marketing</option>
                <option value="servicios">Servicios</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Proveedor (Opcional)</label>
              <input type="text" value={manualForm.proveedor} onChange={e => setManualForm({...manualForm, proveedor: e.target.value})} className="w-full bg-dark-900 border border-dark-border rounded p-2 text-white" />
            </div>
            <div className="lg:col-span-3 flex justify-end">
              <button type="submit" className="bg-dark-border hover:bg-gray-700 text-white px-6 py-2 rounded font-bold transition-colors w-full lg:w-auto">
                Agregar Gasto
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECTION 4: Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-dark-border flex justify-between items-center">
          <h2 className="text-xl font-heading font-bold text-white">Historial de Gastos</h2>
          <input 
            type="month" 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-dark-900 border border-dark-border text-white rounded p-2 text-sm focus:border-brand outline-none"
          />
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-900 text-gray-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium w-8"></th>
                  <th className="p-4 font-medium">Fecha</th>
                  <th className="p-4 font-medium">Descripción</th>
                  <th className="p-4 font-medium">Proveedor</th>
                  <th className="p-4 font-medium">Categoría</th>
                  <th className="p-4 font-medium text-right">Monto</th>
                  <th className="p-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {gastos.map(gasto => {
                  const hasItems = gasto.items && Array.isArray(gasto.items) && gasto.items.length > 0;
                  const isExpanded = expandedRow === gasto.id;

                  return (
                    <React.Fragment key={gasto.id}>
                      <tr className="hover:bg-dark-900/50 transition-colors">
                        <td className="p-4">
                          {hasItems && (
                            <button onClick={() => setExpandedRow(isExpanded ? null : gasto.id)} className="text-gray-400 hover:text-white">
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-300">{formatDate(gasto.fecha)}</td>
                        <td className="p-4 font-medium text-white">{gasto.descripcion}</td>
                        <td className="p-4 text-sm text-gray-400">{gasto.proveedor || '-'}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 text-xs uppercase rounded bg-dark-base text-gray-400 border border-dark-border">
                            {gasto.categoria}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-red-400">
                          {formatCurrency(gasto.monto)}
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDelete(gasto.id)} className="text-gray-500 hover:text-red-500 transition-colors p-1">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && hasItems && (
                        <tr className="bg-dark-900/30">
                          <td colSpan="7" className="p-4">
                            <div className="ml-10 bg-dark-base border border-dark-border rounded p-4">
                              <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">Detalle de Ítems Extraídos (IA)</h5>
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-gray-500 border-b border-dark-border">
                                    <th className="pb-2 font-medium">Nombre</th>
                                    <th className="pb-2 font-medium text-center">Cant</th>
                                    <th className="pb-2 font-medium text-right">P. Unit</th>
                                    <th className="pb-2 font-medium text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {gasto.items.map((item, idx) => (
                                    <tr key={idx} className="border-b border-dark-border/50 last:border-0">
                                      <td className="py-2 text-gray-300">{item.nombre}</td>
                                      <td className="py-2 text-center text-gray-400 font-mono">{item.cantidad}</td>
                                      <td className="py-2 text-right text-gray-400 font-mono">{formatCurrency(item.precioUnitario)}</td>
                                      <td className="py-2 text-right text-white font-mono">{formatCurrency(item.subtotal)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {gastos.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">No hay gastos registrados en este mes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default GastosAdmin;
