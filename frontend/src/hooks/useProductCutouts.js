import { useState, useEffect } from 'react';
import api from '../lib/axios';

// Mantenemos una caché en memoria (no en localStorage)
// Estructura: { [productId]: { status: 'loading'|'success'|'error', base64: string|null } }
const cutoutCache = {};

export const useProductCutouts = (products) => {
  const [cutouts, setCutouts] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Usamos un string con los IDs para evitar re-renders por cambios de referencia del array
  const productIdsString = products.map(p => p.id).join(',');

  useEffect(() => {
    if (products.length === 0) {
      setCutouts({});
      setIsProcessing(false);
      return;
    }

    let mounted = true;

    const processProducts = async () => {
      // 1. Reflejar estado actual (o inicializar en loading) en la caché
      let needsProcessing = false;
      const currentCutouts = {};

      for (const p of products) {
        if (!cutoutCache[p.id]) {
          cutoutCache[p.id] = { status: 'loading', base64: null };
          needsProcessing = true;
        } else if (cutoutCache[p.id].status === 'loading') {
          needsProcessing = true;
        }
        currentCutouts[p.id] = cutoutCache[p.id];
      }

      setCutouts(currentCutouts);

      if (!needsProcessing) {
        setIsProcessing(false);
        return;
      }

      setIsProcessing(true);

      // Filtrar los que realmente necesitamos descargar y procesar
      const toProcess = products.filter(p => 
        cutoutCache[p.id].status === 'loading' && !cutoutCache[p.id].base64
      );

      // Procesar en paralelo
      await Promise.all(toProcess.map(async (p) => {
        try {
          // Buscar imagen principal o la primera
          let imgObj = null;
          if (p.images && p.images.length > 0) {
            imgObj = p.images.find(img => img.isPrimary) || p.images[0];
          }

          if (!imgObj || !imgObj.url) {
            cutoutCache[p.id] = { status: 'error', base64: null };
            return;
          }

          // Descargar blob de Cloudinary
          const response = await fetch(imgObj.url);
          if (!response.ok) throw new Error('Error al descargar la imagen de Cloudinary');
          const blob = await response.blob();

          // Enviar al endpoint de Node
          const formData = new FormData();
          formData.append('image', blob, `product-${p.id}.jpg`);

          const bgRes = await api.post('/remove-bg', formData);

          if (bgRes.data.success) {
            cutoutCache[p.id] = { status: 'success', base64: bgRes.data.imageBase64 };
          } else {
            cutoutCache[p.id] = { status: 'error', base64: null };
          }
        } catch (err) {
          console.error(`Error procesando recorte para producto ${p.id}:`, err);
          cutoutCache[p.id] = { status: 'error', base64: null };
        }
      }));

      // 3. Sincronizar estado si sigue montado
      if (mounted) {
        const updatedCutouts = {};
        for (const p of products) {
          updatedCutouts[p.id] = cutoutCache[p.id];
        }
        setCutouts(updatedCutouts);
        setIsProcessing(false);
      }
    };

    processProducts();

    return () => {
      mounted = false;
    };
  }, [productIdsString]); // Dependencia en el string de IDs

  return { cutouts, isProcessing };
};
