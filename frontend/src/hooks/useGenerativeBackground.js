import { useState, useEffect, useRef } from 'react';

// Caché en memoria usando Map
const bgCache = new Map();

// Generar un número estable a partir de un string para usar como seed
const getHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const useGenerativeBackground = (comboName) => {
  const [status, setStatus] = useState('idle');
  const [backgroundUrl, setBackgroundUrl] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Limpiar timeout anterior si el usuario sigue escribiendo
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const isEmpty = !comboName || !comboName.trim();
    const baseText = isEmpty ? 'premium dark automotive background' : comboName.trim();
    
    // Construir el prompt específico según requerimientos
    const prompt = `${baseText}, dark moody premium car detailing background, cinematic lighting, deep red and black tones, no text, no people, abstract`;

    // Si ya lo generamos antes en esta sesión, devolvemos del caché inmediatamente
    if (bgCache.has(prompt)) {
      const cached = bgCache.get(prompt);
      setBackgroundUrl(cached.url);
      setStatus(cached.status);
      return;
    }

    // Setear loading mientras corre el debounce (o se prepara)
    setStatus('loading');

    // Debounce de 800ms
    debounceRef.current = setTimeout(() => {
      // Usar hash del prompt como seed para garantizar misma imagen para mismo texto
      const seed = getHash(prompt);
      const rawPollinationsUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=450&nologo=true&seed=${seed}`;
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const url = `https://res.cloudinary.com/${cloudName}/image/fetch/${encodeURIComponent(rawPollinationsUrl)}`;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        bgCache.set(prompt, { url, status: 'ready' });
        setBackgroundUrl(url);
        setStatus('ready');
      };
      img.onerror = () => {
        bgCache.set(prompt, { url: null, status: 'error' });
        setBackgroundUrl(null);
        setStatus('error');
      };
      img.src = url;
    }, 800);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [comboName]);

  return { backgroundUrl, status };
};
