import html2pdf from 'html2pdf.js';
import { FileDown, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import RemitoTemplate from '../../components/RemitoTemplate';
import { formatCurrency } from '../../utils/formatters';
import { generateWhatsAppLink } from '../../utils/whatsapp';

const PresupuestosAdmin = () => {
  const [numero, setNumero] = useState('00001');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [condicionVenta, setCondicionVenta] = useState('Contado');
  const [items, setItems] = useState([{ descripcion: '', cantidad: 1, importe: 0 }]);

  const templateRef = useRef();

  useEffect(() => {
    // Initialize counter from localStorage
    const savedCounter = localStorage.getItem('presupuesto_contador');
    if (savedCounter) {
      setNumero(String(Number(savedCounter) + 1).padStart(5, '0'));
    } else {
      setNumero('00001');
    }
  }, []);

  const handleAddItem = () => {
    setItems([...items, { descripcion: '', cantidad: 1, importe: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length > 0 ? newItems : [{ descripcion: '', cantidad: 1, importe: 0 }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'cantidad' || field === 'importe') {
      newItems[index][field] = Number(value);
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const total = items.reduce((acc, item) => acc + (item.cantidad * item.importe), 0);

  const incrementCounter = () => {
    localStorage.setItem('presupuesto_contador', Number(numero));
    setNumero(String(Number(numero) + 1).padStart(5, '0'));
  };

  const handleDownloadPDF = async () => {
    if (!cliente) {
      toast.error('El nombre del cliente es requerido');
      return;
    }

    const element = templateRef.current;

    // Configuración para html2pdf
    const opt = {
      margin: 0,
      filename: `presupuesto-${numero}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      toast.success('Presupuesto descargado');
      incrementCounter();
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el PDF');
    }
  };

  const handleWhatsApp = () => {
    if (!telefono) {
      toast.error('Se requiere un teléfono para enviar por WhatsApp');
      return;
    }
    if (!cliente) {
      toast.error('El nombre del cliente es requerido');
      return;
    }

    const message = `Hola ${cliente}, te enviamos tu presupuesto #${numero} de Good Shop. ¡Cualquier consulta estamos disponibles!`;
    const link = generateWhatsAppLink(telefono, message);

    window.open(link, '_blank');
    toast.success('Abriendo WhatsApp...');
  };

  const conditions = ['Contado', 'Efectivo', 'Tarjeta', 'Transferencia'];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-white">Presupuestos</h1>
      </div>

      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-heading font-bold text-white mb-6 border-b border-dark-border pb-4">Datos del Cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Presupuesto Nº</label>
            <input
              type="text"
              value={numero}
              readOnly
              className="w-full bg-dark-base border border-dark-border rounded px-4 py-2 text-white font-mono opacity-70 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Cliente</label>
            <input
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nombre del cliente"
              className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 3811234567"
              className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
            />
          </div>
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Domicilio (Opcional)</label>
            <input
              type="text"
              value={domicilio}
              onChange={(e) => setDomicilio(e.target.value)}
              placeholder="Dirección del cliente"
              className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-dark-border">
          <label className="block text-sm font-medium text-gray-400 mb-4">Condición de Venta</label>
          <div className="flex flex-wrap gap-4">
            {conditions.map(cond => (
              <button
                key={cond}
                onClick={() => setCondicionVenta(cond)}
                className={`px-4 py-2 rounded-lg border transition-colors ${condicionVenta === cond
                    ? 'border-brand bg-brand/20 text-brand font-bold'
                    : 'border-dark-border bg-dark-900 text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden mb-8">
        <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-900/50">
          <h2 className="text-lg font-heading font-bold text-white">Ítems</h2>
          <button onClick={handleAddItem} className="btn-primary flex items-center gap-2 py-1.5 px-3 text-sm">
            <Plus size={16} /> Agregar Fila
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-900 text-gray-400 text-sm tracking-wider">
                <th className="p-4 font-medium w-24">Cant.</th>
                <th className="p-4 font-medium">Descripción</th>
                <th className="p-4 font-medium w-48">P. Unitario ($)</th>
                <th className="p-4 font-medium text-right w-48">Subtotal ($)</th>
                <th className="p-4 font-medium w-16 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-dark-900/30 transition-colors">
                  <td className="p-2">
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                      className="w-full bg-dark-base border border-dark-border rounded px-3 py-2 text-white text-center focus:outline-none focus:border-brand font-mono"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.descripcion}
                      onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                      placeholder="Descripción del producto o servicio"
                      className="w-full bg-dark-base border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={item.importe}
                      onChange={(e) => handleItemChange(index, 'importe', e.target.value)}
                      className="w-full bg-dark-base border border-dark-border rounded px-4 py-2 text-white text-right focus:outline-none focus:border-brand font-mono"
                    />
                  </td>
                  <td className="p-4 text-right text-white font-mono font-bold">
                    {formatCurrency(item.cantidad * item.importe)}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Eliminar fila"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-dark-border bg-dark-900/50 flex justify-end">
          <div className="text-right">
            <span className="text-gray-400 text-sm uppercase tracking-wider mr-4">Total</span>
            <span className="text-3xl font-mono font-bold text-brand">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6 pb-20 md:pb-0">
        {/*<button 
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20 font-bold rounded-lg transition-colors w-full sm:w-auto"
        >
          <MessageCircle size={20} />
          Enviar por WhatsApp
        </button>*/}
        <button
          onClick={handleDownloadPDF}
          className="btn-primary flex items-center justify-center gap-2 py-3 w-full sm:w-auto"
        >
          <FileDown size={20} />
          Descargar PDF
        </button>
      </div>

      {/* Hidden Template for PDF Generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <RemitoTemplate
          ref={templateRef}
          numero={numero}
          fecha={fecha}
          cliente={cliente}
          domicilio={domicilio}
          condicionVenta={condicionVenta}
          items={items.filter(i => i.descripcion.trim() !== '')}
          total={total}
        />
      </div>
    </div>
  );
};

export default PresupuestosAdmin;
