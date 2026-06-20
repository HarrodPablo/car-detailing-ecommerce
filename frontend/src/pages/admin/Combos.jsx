import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { dibujarCombo } from '../../utils/canvasCombo';
import api from '../../lib/axios';
import { PLANTILLAS } from '../../utils/plantillas';

const Combos = () => {
  const canvasRef = useRef(null);
  const [combo, setCombo] = useState({
    nombre: '',
    precio: '',
    productos: [],
    plantilla: 'dark' // dark, sport, premium
  });
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setAvailableProducts(res.data);
      } catch (error) {
        toast.error('Error cargando productos');
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const plantillaUrl = PLANTILLAS[combo.plantilla];
    
    if (plantillaUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => dibujarCombo(ctx, combo, img);
      img.onerror = () => dibujarCombo(ctx, combo, null);
      img.src = plantillaUrl;
    } else {
      dibujarCombo(ctx, combo, null);
    }
  }, [combo]);

  const toggleProduct = (prod) => {
    setCombo(prev => {
      const isSelected = prev.productos.find(p => p.id === prod.id);
      if (isSelected) {
        return { ...prev, productos: prev.productos.filter(p => p.id !== prod.id) };
      } else {
        if (prev.productos.length >= 4) {
          toast.error('Máximo 4 productos por combo para que entre en la imagen');
          return prev;
        }
        return { ...prev, productos: [...prev.productos, prod] };
      }
    });
  };

  const handlePublish = async () => {
    if (!combo.nombre || !combo.precio || combo.productos.length === 0) {
      toast.error('Completá nombre, precio y al menos 1 producto');
      return;
    }

    setLoading(true);
    try {
      const canvas = canvasRef.current;
      
      // 1. Canvas → Blob
      const blob = await new Promise(resolve => 
        canvas.toBlob(resolve, 'image/jpeg', 0.92)
      );

      // 2. Subir a Cloudinary (unsigned preset)
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      
      const formData = new FormData();
      formData.append('file', blob, `combo-${Date.now()}.jpg`);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'good_shop/combos');

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      
      if (!cloudRes.ok) throw new Error('Error subiendo imagen a Cloudinary');
      const cloudData = await cloudRes.json();

      // 3. Guardar en DB con URL real
      await api.post('/combos', {
        nombre: combo.nombre,
        precio: parseFloat(combo.precio),
        productos: combo.productos.map(p => p.id),
        imagen_url: cloudData.secure_url,
        isActive: true
      });

      toast.success('✅ Combo publicado en el carrusel');
      setCombo({ nombre: '', precio: '', productos: [], plantilla: 'dark' });

    } catch (error) {
      console.error(error);
      toast.error('Error al publicar combo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white">Creador de Combos</h1>
        <p className="text-gray-400">Genera imágenes promocionales para publicar en el Home</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-dark-border pb-2">Datos del Combo</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Combo</label>
            <input 
              type="text" 
              className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
              value={combo.nombre}
              onChange={e => setCombo({...combo, nombre: e.target.value})}
              placeholder="EJ: COMBO LAVADO PREMIUM"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Precio Total ($)</label>
            <input 
              type="number" 
              className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
              value={combo.precio}
              onChange={e => setCombo({...combo, precio: e.target.value})}
              placeholder="95000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Productos (máx 4)</label>
            <div className="max-h-60 overflow-y-auto border border-dark-border rounded bg-dark-900 p-2 space-y-1">
              {availableProducts.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => toggleProduct(p)}
                  className={`p-2 rounded cursor-pointer transition-colors text-sm ${combo.productos.find(x => x.id === p.id) ? 'bg-brand/20 border border-brand text-brand font-medium' : 'hover:bg-dark-border text-gray-400'}`}
                >
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Plantilla Visual
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['dark', 'sport', 'premium'].map(pl => (
                <button
                  key={pl}
                  type="button"
                  onClick={() => setCombo(prev => ({ ...prev, plantilla: pl }))}
                  className={`py-2 rounded text-sm font-bold uppercase tracking-wider 
                    border transition-all ${
                    combo.plantilla === pl
                      ? 'bg-brand border-brand text-white'
                      : 'bg-dark-900 border-dark-border text-gray-400 hover:border-brand'
                  }`}
                >
                  {pl}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handlePublish}
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Publicando...' : 'Publicar Combo'}
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Vista Previa</h2>
          <div className="border border-dark-border rounded-lg overflow-hidden bg-dark-card shadow-2xl">
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={450} 
              className="w-full h-auto"
            />
          </div>
          <p className="text-sm text-gray-500 text-center">
            Esta imagen se generará y subirá automáticamente. Resolución: 800x450
          </p>
        </div>
      </div>
    </div>
  );
};

export default Combos;
