import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { dibujarCombo } from '../../utils/canvasCombo';
import api from '../../lib/axios';

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
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      // In a real scenario, we'd load an Image object for 'plantillaImg' based on combo.plantilla
      // For now, passing null will use the dark fallback in dibujarCombo
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
      toast.error('Completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const canvas = canvasRef.current;
      
      canvas.toBlob(async (blob) => {
        // Upload to Cloudinary Unsigned Preset
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('upload_preset', 'good_shop_combos');
        
        // This should hit Cloudinary directly. 
        // We'll mock the upload for now since we don't have the Cloudinary keys in frontend env
        // In a real scenario:
        /*
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        }).then(r => r.json());
        const imageUrl = uploadRes.secure_url;
        */
        const imageUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg'; // Mock URL

        // Save combo to database
        await api.post('/combos', {
          nombre: combo.nombre,
          precio: combo.precio,
          productos: combo.productos.map(p => p.id),
          imagen_url: imageUrl,
          isActive: true
        });

        toast.success('✅ Combo publicado en el carrusel');
        setCombo({ nombre: '', precio: '', productos: [], plantilla: 'dark' });
      }, 'image/jpeg', 0.9);

    } catch (error) {
      toast.error('Error al publicar combo');
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
