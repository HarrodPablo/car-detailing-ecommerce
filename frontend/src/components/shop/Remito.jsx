import React, { useMemo } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import logoSvg from '../../assets/goodshop_logo.svg';
import { printRemito } from '../../utils/printRemito';
import { formatCurrency } from '../../utils/formatters';

const Remito = ({ items, customerName, notes, paymentMethod, total, onClose, onConfirm, orderId, showDownload = false }) => {
  const remitoNumber = useMemo(() => orderId ? `#${orderId}` : '#' + String(Date.now()).slice(-6), [orderId]);
  const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (!items || items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-[794px] my-auto mt-8 mb-8">
        
        {/* ZONA 1: BOTONES (no imprimible) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111] border border-[#2D2D2D] p-4 rounded-t-xl">
          <button onClick={onClose} className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
            <X size={20} /> <span className="font-bold">Cerrar</span>
          </button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {showDownload && (
              <button onClick={printRemito} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#2D2D2D] border border-[#2D2D2D] text-white px-4 py-2 rounded-lg font-bold transition-colors">
                <Download size={18} /> Descargar PDF
              </button>
            )}
            {onConfirm && (
              <button 
                onClick={onConfirm}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-[#25D366]/20"
              >
                <Smartphone size={18} /> Confirmar y enviar por WhatsApp
              </button>
            )}
          </div>
        </div>

        {/* ZONA 2: REMITO IMPRIMIBLE */}
        <div id="remito-print" className="bg-white text-black w-full shadow-2xl rounded-b-xl overflow-hidden" style={{ minHeight: 'auto' }}>
          
          {/* Header */}
          <div className="bg-[#8B0000] text-white p-8 flex justify-between items-center">
            <div>
              <img src={logoSvg} alt="Good Shop" style={{ width: 160 }} crossOrigin="anonymous" className="mb-2 brightness-0 invert" />
              <p className="font-bold text-lg">Good Shop Premium</p>
              <p className="text-sm opacity-90">Productos de detailing</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black tracking-wider mb-2">REMITO {remitoNumber}</h2>
              <p className="font-mono text-sm opacity-90">Fecha: {today}</p>
            </div>
          </div>

          <div className="p-8">
            {/* Cliente */}
            <div className="mb-8 border-b pb-6 border-gray-200">
              <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-4">Datos del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <p className="text-gray-500 text-sm">Nombre / Razón Social</p>
                    <p className="font-bold text-lg text-gray-900">{customerName || 'No especificado'}</p>
                  </div>
                  {paymentMethod && (
                    <div>
                      <p className="text-gray-500 text-sm">Forma de Pago</p>
                      <span className={`inline-block px-3 py-1 mt-1 rounded text-sm font-bold uppercase ${paymentMethod.toLowerCase() === 'efectivo' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                        {paymentMethod}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Notas / Datos de Envío</p>
                  <div className="bg-[#f9f9f9] p-4 rounded border border-gray-100 min-h-[80px]">
                    <p className="font-medium text-gray-800 whitespace-pre-wrap">{notes || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla */}
            <div className="mb-8">
              <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-4">Productos</h3>
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-[#8B0000] text-white text-left">
                    <th className="p-3 border border-gray-200 uppercase text-sm font-bold w-[50%]">Producto</th>
                    <th className="p-3 border border-gray-200 uppercase text-sm font-bold text-center">Cant.</th>
                    <th className="p-3 border border-gray-200 uppercase text-sm font-bold text-right">P.Unit.</th>
                    <th className="p-3 border border-gray-200 uppercase text-sm font-bold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]'}>
                      <td className="p-3 border border-gray-200 font-bold text-gray-800">{item.name}</td>
                      <td className="p-3 border border-gray-200 text-center font-mono">{item.quantity}</td>
                      <td className="p-3 border border-gray-200 text-right font-mono text-gray-600">{formatCurrency(item.price)}</td>
                      <td className="p-3 border border-gray-200 text-right font-mono font-bold text-[#8B0000]">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end pt-4 border-t-2 border-[#8B0000]">
              <div className="text-right">
                <p className="text-gray-500 font-bold uppercase mb-1">Total a Pagar</p>
                <p className="text-[28px] font-black text-[#8B0000] font-mono">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#111] text-white text-center py-4 mt-auto">
            <p className="text-sm font-medium tracking-widest">Good Shop Premium | Gracias por tu compra 🚗</p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Remito;
