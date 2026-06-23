import logoSvg from '../assets/goodshop_pre.svg';

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.crossOrigin = 'anonymous'; 
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

const splitText = (text) => {
  if (text.length <= 12) return [text];
  const middle = Math.floor(text.length / 2);
  let splitIndex = -1;
  let minDistance = text.length;
  
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ') {
      const dist = Math.abs(i - middle);
      if (dist < minDistance) {
        minDistance = dist;
        splitIndex = i;
      }
    }
  }
  
  if (splitIndex === -1) return [text];
  return [text.substring(0, splitIndex), text.substring(splitIndex + 1)];
};

export const dibujarCombo = async (ctx, combo, backgroundImg, cutouts = {}, bgStatus = 'ready') => {
  const W = 800, H = 450;
  
  // WARMUP DE FUENTES
  await document.fonts.ready;
  ctx.font = 'bold 1px Rajdhani, sans-serif';
  ctx.fillText('', 0, 0);
  ctx.font = 'bold 1px "JetBrains Mono", monospace';
  ctx.fillText('', 0, 0);

  // FONDO IA
  if (backgroundImg && bgStatus === 'ready') {
    const imgRatio = backgroundImg.width / backgroundImg.height;
    const canvasRatio = W / H;
    let drawW, drawH, drawX, drawY;
    
    if (imgRatio > canvasRatio) {
      drawH = H;
      drawW = backgroundImg.width * (H / backgroundImg.height);
      drawX = (W - drawW) / 2;
      drawY = 0;
    } else {
      drawW = W;
      drawH = backgroundImg.height * (W / backgroundImg.width);
      drawX = 0;
      drawY = (H - drawH) / 2;
    }
    
    ctx.drawImage(backgroundImg, drawX, drawY, drawW, drawH);
    
    // OVERLAY GRADIENTE LINEAL (Oscuro izq -> Claro der)
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0.85)');
    grad.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  } else { 
    // Fallback sólido
    ctx.fillStyle = '#0A0A0A'; 
    ctx.fillRect(0, 0, W, H); 
  }
  
  // FRANJAS ROJAS (Top/Bottom)
  ctx.fillStyle = '#8B0000';
  ctx.fillRect(0, 0, W, 8);
  ctx.fillRect(0, H-8, W, 8);
  
  // ZONA IZQUIERDA: NOMBRE DEL COMBO
  const comboName = (combo.nombre || 'NUEVO COMBO').toUpperCase();
  const lines = splitText(comboName);
  
  ctx.font = 'bold 64px Rajdhani, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  let currentY = 60; 
  lines.forEach(line => {
    // Outline rojo
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 4;
    ctx.strokeText(line, 20, currentY);
    // Texto blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(line, 20, currentY);
    currentY += 64; 
  });
  
  // LÍNEA ROJA SEPARADORA (Solo mitad izquierda)
  ctx.strokeStyle = '#8B0000';
  ctx.lineWidth = 3;
  ctx.beginPath(); 
  ctx.moveTo(20, currentY + 15); 
  ctx.lineTo(380, currentY + 15); 
  ctx.stroke();
  
  // ZONA IZQUIERDA: PRECIO
  const precioVal = Number(combo.precio) || 0;
  const precioStr = precioVal.toLocaleString('es-AR');
  
  let priceFontSize = 68; 
  ctx.font = `bold ${priceFontSize}px "JetBrains Mono", monospace`;
  let priceW = ctx.measureText(precioStr).width;
  
  if (priceW > 250) {
    priceFontSize = 56;
    ctx.font = `bold ${priceFontSize}px "JetBrains Mono", monospace`;
    priceW = ctx.measureText(precioStr).width;
  }
  
  const symbolFont = 'bold 50px "JetBrains Mono", monospace';
  ctx.font = symbolFont;
  const symbolW = ctx.measureText('$').width;
  
  const gap = 8;
  const totalW = symbolW + gap + priceW;
  const priceX = 20 + totalW/2; // Anclado a la izquierda (x=20)
  const priceY = 400; // Forzado a y=400 máximo como indicó el fix
  
  // Badge pill oscuro detrás del precio
  ctx.fillStyle = 'rgba(10, 10, 10, 0.6)'; 
  const padX = 20;
  const padY = 15;
  const badgeH = priceFontSize + padY * 2;
  ctx.beginPath();
  ctx.roundRect(priceX - totalW/2 - padX + 5, priceY - priceFontSize + 10 - padY, totalW + padX*2, badgeH, badgeH/2);
  ctx.fill();
  
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 2;
  
  // Símbolo $ en superíndice
  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = symbolFont;
  ctx.fillText('$', priceX - totalW/2 + symbolW, priceY - (priceFontSize * 0.25));
  
  // Número del precio rojo
  ctx.textAlign = 'left';
  ctx.fillStyle = '#CC0000';
  ctx.font = `bold ${priceFontSize}px "JetBrains Mono", monospace`;
  ctx.fillText(precioStr, priceX - totalW/2 + symbolW + gap, priceY);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // ZONA DERECHA: LOGO (Movido de izquierda a derecha)
  try {
    const logoImg = await loadImage(logoSvg);
    const maxLogoW = 100;
    const scale = Math.min(maxLogoW / logoImg.width, 1);
    const logoW = logoImg.width * scale;
    const logoH = logoImg.height * scale;
    // Anclado en bottom-right: x: W - 20 - logoW, y: H - 20 - logoH
    ctx.drawImage(logoImg, W - 20 - logoW, H - 20 - logoH, logoW, logoH);
  } catch (e) {
    console.error("Error loading logo for canvas", e);
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 1;
    ctx.font = 'italic bold 20px Georgia, serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right'; // Fallback a texto alineado a la derecha
    ctx.fillText('Good Shop', W - 20, H - 20);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
  
  // ZONA DERECHA: PRODUCTOS
  if (combo.productos && combo.productos.length > 0) {
    const products = combo.productos;
    const num = products.length; // max 4
    const zoneX = 380, zoneY = 80, zoneW = 390, zoneH = 290;
    
    // Configuración de layouts dinámicos (x: 380-770)
    let itemsLayout = [];
    if (num === 1) {
      itemsLayout.push({ cx: zoneX + zoneW/2, cy: zoneY + zoneH/2, maxW: 280, maxH: 280 });
    } else if (num === 2) {
      // Dos productos lado a lado. cellW = 195. padding 8px = maxW 195-16 = 179.
      // Pero para permitir "hasta 200" como pidieron, usamos maxW 185 (queda ~10px entre ellos)
      itemsLayout.push({ cx: zoneX + zoneW/4, cy: zoneY + zoneH/2, maxW: 185, maxH: 200 });
      itemsLayout.push({ cx: zoneX + (zoneW/4)*3, cy: zoneY + zoneH/2, maxW: 185, maxH: 200 });
    } else if (num === 3) {
      // Triángulo. padding estricto 8px por lado.
      itemsLayout.push({ cx: zoneX + zoneW/2, cy: zoneY + zoneH/4, maxW: 180, maxH: 140 }); 
      itemsLayout.push({ cx: zoneX + zoneW/4, cy: zoneY + (zoneH/4)*3, maxW: 180, maxH: 140 }); 
      itemsLayout.push({ cx: zoneX + (zoneW/4)*3, cy: zoneY + (zoneH/4)*3, maxW: 180, maxH: 140 }); 
    } else {
      // Grilla 2x2. cellW = 195, cellH = 145. Padding 8px -> maxW=179, maxH=129 (prácticamente 130px)
      itemsLayout.push({ cx: zoneX + zoneW/4, cy: zoneY + zoneH/4, maxW: 179, maxH: 130 });
      itemsLayout.push({ cx: zoneX + (zoneW/4)*3, cy: zoneY + zoneH/4, maxW: 179, maxH: 130 });
      itemsLayout.push({ cx: zoneX + zoneW/4, cy: zoneY + (zoneH/4)*3, maxW: 179, maxH: 130 });
      itemsLayout.push({ cx: zoneX + (zoneW/4)*3, cy: zoneY + (zoneH/4)*3, maxW: 179, maxH: 130 });
    }

    for (let i = 0; i < num; i++) {
      const p = products[i];
      const cutout = cutouts[p.id];
      const layout = itemsLayout[i];
      
      if (cutout && cutout.status === 'success' && cutout.base64) {
        try {
          const img = await loadImage(cutout.base64);
          
          const scale = Math.min(layout.maxW / img.width, layout.maxH / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          
          // Sombra de piso / drop shadow requerida
          ctx.shadowColor = 'rgba(0,0,0,0.85)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetY = 8;
          
          ctx.drawImage(img, layout.cx - drawW/2, layout.cy - drawH/2, drawW, drawH);
          
          // reset shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
        } catch (e) {
          drawFallback(ctx, p, layout.cx, layout.cy);
        }
      } else {
        drawFallback(ctx, p, layout.cx, layout.cy, cutout?.status === 'loading');
      }
    }
  } else {
    // Placeholder si no hay productos
    ctx.font = '22px Inter, sans-serif';
    ctx.fillStyle = '#E5E7EB';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 12;
    ctx.fillText('• Selecciona productos', 380 + 390/2, 450/2);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
};

// Helper function
function drawFallback(ctx, p, cx, cy, isLoading = false) {
  ctx.fillStyle = isLoading ? '#374151' : '#1F2937';
  const boxW = 80, boxH = 80;
  ctx.fillRect(cx - boxW/2, cy - boxH/2, boxW, boxH);
  
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isLoading ? 'Cargando...' : 'Sin imagen', cx, cy - 10);
  
  ctx.fillStyle = '#E5E7EB';
  ctx.font = 'bold 10px Inter, sans-serif';
  const name = p.name || p.nombre || '';
  const shortName = name.length > 12 ? name.substring(0, 12) + '...' : name;
  ctx.fillText(shortName, cx, cy + 15);
}
