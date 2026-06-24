import React, { forwardRef } from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';

const RemitoTemplate = forwardRef(({ 
  numero = '0000', 
  fecha = new Date(), 
  cliente = '', 
  domicilio = '', 
  condicionVenta = 'Contado', 
  items = [], 
  total = 0 
}, ref) => {
  // Ensure we have at least 15 rows for the template design
  const minRows = 15;
  const displayItems = [...items];
  while (displayItems.length < minRows) {
    displayItems.push({ isFiller: true });
  }

  const conditions = ['Contado', 'Efectivo', 'Tarjeta', 'Transferencia'];

  return (
    <div 
      ref={ref} 
      id="remito-template"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        backgroundColor: '#ffffff',
        color: '#000000',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
          
          #remito-template {
            font-family: 'Hanken Grotesk', sans-serif;
          }
          #remito-template * {
            box-sizing: border-box;
          }
          .remito-border {
            border: 1.5px solid #000;
          }
          .mono-font {
            font-family: 'JetBrains Mono', monospace;
          }
        `}
      </style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            Good Shop
          </h1>
          <p style={{ margin: '2px 0', fontSize: '14px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Productos Premium</p>
          <div style={{ marginTop: '15px', fontSize: '13px', lineHeight: '1.5' }}>
            <p style={{ margin: 0 }}>Balcarce 571 - Tafí Viejo</p>
            <p style={{ margin: 0 }}>Tel: 381-3333090</p>
          </div>
        </div>

        {/* Metadatos Documento */}
        <div style={{ width: '250px' }} className="remito-border">
          <div style={{ borderBottom: '1.5px solid #000', padding: '10px', textAlign: 'center', backgroundColor: '#f8f8f8' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>Presupuesto</h2>
          </div>
          <div style={{ display: 'flex', borderBottom: '1.5px solid #000' }}>
            <div style={{ flex: 1, padding: '10px', borderRight: '1.5px solid #000' }}>
              <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#555' }}>Día</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '16px', fontWeight: '600', textAlign: 'center' }} className="mono-font">
                {new Date(fecha).getDate().toString().padStart(2, '0')}
              </p>
            </div>
            <div style={{ flex: 1, padding: '10px', borderRight: '1.5px solid #000' }}>
              <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#555' }}>Mes</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '16px', fontWeight: '600', textAlign: 'center' }} className="mono-font">
                {(new Date(fecha).getMonth() + 1).toString().padStart(2, '0')}
              </p>
            </div>
            <div style={{ flex: 1, padding: '10px' }}>
              <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#555' }}>Año</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '16px', fontWeight: '600', textAlign: 'center' }} className="mono-font">
                {new Date(fecha).getFullYear().toString().slice(-2)}
              </p>
            </div>
          </div>
          <div style={{ padding: '10px' }}>
            <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#555' }}>Nº Documento</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '700', textAlign: 'right' }} className="mono-font">
              {String(numero).padStart(5, '0')}
            </p>
          </div>
        </div>
      </div>

      {/* Cliente y Condiciones */}
      <div className="remito-border" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', borderBottom: '1.5px solid #000' }}>
          <div style={{ flex: 1, padding: '15px', borderRight: '1.5px solid #000' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '15px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', marginRight: '10px', width: '60px' }}>Señor(es):</span>
              <div style={{ flex: 1, borderBottom: '1px dashed #666', paddingBottom: '2px', fontSize: '15px' }}>{cliente}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', marginRight: '10px', width: '60px' }}>Domicilio:</span>
              <div style={{ flex: 1, borderBottom: '1px dashed #666', paddingBottom: '2px', fontSize: '15px' }}>{domicilio}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '10px 15px', backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Condición de Venta:</span>
          <div style={{ display: 'flex', gap: '20px', flex: 1, justifyContent: 'center' }}>
            {conditions.map(cond => (
              <div key={cond} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ 
                  width: '14px', 
                  height: '14px', 
                  border: '1.5px solid #000', 
                  backgroundColor: condicionVenta === cond ? '#000' : 'transparent',
                  position: 'relative'
                }}>
                  {condicionVenta === cond && (
                    <span style={{ color: '#fff', fontSize: '10px', position: 'absolute', top: '-1px', left: '2px' }}>✓</span>
                  )}
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600' }}>{cond}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Items */}
      <div className="remito-border" style={{ marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #000', backgroundColor: '#f8f8f8' }}>
              <th style={{ width: '12%', padding: '10px', borderRight: '1.5px solid #000', fontSize: '12px', textTransform: 'uppercase' }}>Cant.</th>
              <th style={{ width: '60%', padding: '10px', borderRight: '1.5px solid #000', fontSize: '12px', textTransform: 'uppercase', textAlign: 'left' }}>Descripción</th>
              <th style={{ width: '28%', padding: '10px', fontSize: '12px', textTransform: 'uppercase', textAlign: 'right' }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item, index) => (
              <tr key={index} style={{ borderBottom: index < displayItems.length - 1 ? '1px solid #eee' : 'none' }}>
                <td style={{ padding: '8px 10px', borderRight: '1.5px solid #000', textAlign: 'center', fontSize: '14px' }} className="mono-font">
                  {item.isFiller ? '\u00A0' : item.cantidad}
                </td>
                <td style={{ padding: '8px 10px', borderRight: '1.5px solid #000', fontSize: '14px', fontWeight: item.isFiller ? 'normal' : '600' }}>
                  {item.isFiller ? '\u00A0' : item.descripcion}
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '14px' }} className="mono-font">
                  {item.isFiller ? '\u00A0' : formatCurrency(item.importe)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Section */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
        <div className="remito-border" style={{ width: '250px', display: 'flex' }}>
          <div style={{ width: '40%', padding: '12px', backgroundColor: '#f8f8f8', borderRight: '1.5px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase' }}>Total</span>
          </div>
          <div style={{ width: '60%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '20px', fontWeight: '700' }} className="mono-font">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Pie Legal */}
      <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', borderTop: '1px solid #ccc', paddingTop: '15px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Documento No Válido como Factura</p>
        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>Uso exclusivo interno para control de stock, despachos y presupuestos.</p>
      </div>
    </div>
  );
});

RemitoTemplate.displayName = 'RemitoTemplate';

export default RemitoTemplate;
