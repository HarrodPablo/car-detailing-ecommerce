export const dibujarCombo = (ctx, combo, plantillaImg) => {
  const W = 800, H = 450;
  
  // Fondo plantilla
  if (plantillaImg) {
    ctx.drawImage(plantillaImg, 0, 0, W, H);
  } else { 
    ctx.fillStyle = '#0A0A0A'; 
    ctx.fillRect(0, 0, W, H); 
  }
  
  // Franjas marca
  ctx.fillStyle = '#8B0000';
  ctx.fillRect(0, 0, W, 8);
  ctx.fillRect(0, H-8, W, 8);
  
  // Nombre
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px Rajdhani, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((combo.nombre || 'NUEVO COMBO').toUpperCase(), W/2, 90);
  
  // Línea separadora
  ctx.strokeStyle = '#8B0000';
  ctx.lineWidth = 2;
  ctx.beginPath(); 
  ctx.moveTo(100, 110); 
  ctx.lineTo(700, 110); 
  ctx.stroke();
  
  // Productos
  ctx.font = '22px Inter, sans-serif';
  ctx.fillStyle = '#E5E7EB';
  if (combo.productos && combo.productos.length > 0) {
    combo.productos.forEach((p, i) => {
      ctx.fillText(`• ${p.name || p.nombre}`, W/2, 155 + i * 38);
    });
  } else {
    ctx.fillText('• Selecciona productos para el combo', W/2, 155);
  }
  
  // Precio
  ctx.fillStyle = '#8B0000';
  ctx.font = 'bold 72px "JetBrains Mono", monospace';
  const precio = Number(combo.precio) || 0;
  ctx.fillText(`$${precio.toLocaleString('es-AR')}`, W/2, 370);
  
  // Logo
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'italic bold 20px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText('Good Shop', W-30, H-30);
  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.fillText('PRODUCTOS PREMIUM', W-30, H-14);
};
