import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useGenerativeBackground } from '../../hooks/useGenerativeBackground';
import { useProductCutouts } from '../../hooks/useProductCutouts';
import api from '../../lib/axios';
import { dibujarCombo } from '../../utils/canvasCombo';

const Combos = () => {
  const canvasRef = useRef(null);
  const [combo, setCombo] = useState({
    nombre: '',
    precio: '',
    productos: []
  });
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const { cutouts, isProcessing } = useProductCutouts(combo.productos);
  const { backgroundUrl, status: bgStatus } = useGenerativeBackground(combo.nombre);

  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

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

    const render = async () => {
      if (backgroundUrl && bgStatus === 'ready') {
        const img = new Image();
        // IMPORTANTE: Esto es lo que previene el error "Tainted Canvas"
        // ya que Pollinations envía el header Access-Control-Allow-Origin: *
        img.crossOrigin = 'anonymous';
        img.onload = async () => {
          await dibujarCombo(ctx, combo, img, cutouts, 'ready');
        };
        img.onerror = async () => {
          await dibujarCombo(ctx, combo, null, cutouts, 'error');
        };
        img.src = backgroundUrl;
      } else {
        await dibujarCombo(ctx, combo, null, cutouts, bgStatus);
      }
    };

    render();
  }, [combo, cutouts, backgroundUrl, bgStatus]);

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

      if (!blob) {
        throw new Error('Tainted Canvas o Blob vacío. Revisa CORS.');
      }

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

      if (!cloudRes.ok) {
        const errData = await cloudRes.json().catch(() => ({}));
        console.error("Cloudinary error devuelto:", errData);
        throw new Error(`Cloudinary: ${errData.error?.message || 'Bad Request'}`);
      }
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
      setCombo({ nombre: '', precio: '', productos: [] });

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
              onChange={e => setCombo({ ...combo, nombre: e.target.value })}
              placeholder="EJ: COMBO LAVADO PREMIUM"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Precio Total ($)</label>
            <input
              type="number"
              className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
              value={combo.precio}
              onChange={e => setCombo({ ...combo, precio: e.target.value })}
              placeholder="95000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Productos (máx 4)</label>

            {/* Chips de seleccionados */}
            {combo.productos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {combo.productos.map(p => (
                  <span key={`chip-${p.id}`} className="bg-brand/20 text-brand text-xs px-2 py-1 rounded flex items-center gap-1 border border-brand/50">
                    {p.name}
                    <button type="button" onClick={() => toggleProduct(p)} className="hover:text-white ml-1 font-bold">×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Buscador */}
            <input
              type="text"
              placeholder="Buscar productos por nombre..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand mb-2 text-sm"
            />

            {/* Lista */}
            <div className="max-h-60 overflow-y-auto border border-dark-border rounded bg-dark-900 p-2 space-y-1">
              {filteredProducts.map(p => {
                const isSelected = combo.productos.some(x => x.id === p.id);
                const isMaxReached = combo.productos.length >= 4 && !isSelected;

                let thumbUrl = null;
                if (p.images && p.images.length > 0) {
                  const primary = p.images.find(img => img.isPrimary) || p.images[0];
                  thumbUrl = primary.url;
                }

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!isMaxReached) toggleProduct(p);
                      else if (isSelected) toggleProduct(p);
                      else toast.error('Máximo 4 productos por combo');
                    }}
                    className={`p-2 rounded transition-colors text-sm flex items-center gap-3
                      ${isSelected ? 'bg-brand/20 border border-brand text-brand font-medium' : 'hover:bg-dark-border text-gray-400 border border-transparent'}
                      ${isMaxReached ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {thumbUrl ? (
                      <img src={thumbUrl} alt="" className="w-8 h-8 object-cover rounded bg-dark-800" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-dark-800 flex items-center justify-center text-[10px] text-gray-500">Sin img</div>
                    )}
                    <span className="flex-1 truncate">{p.name}</span>
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">No hay productos que coincidan</div>
              )}
            </div>
          </div>

          <button
            onClick={handlePublish}
            disabled={loading || isProcessing}
            className="w-full btn-primary"
          >
            {loading ? 'Publicando...' : isProcessing ? 'Procesando fotos...' : 'Publicar Combo'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Vista Previa</h2>
            {bgStatus === 'loading' && (
              <div className="text-brand text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-brand rounded-full animate-pulse"></span>
                Generando fondo IA...
              </div>
            )}
          </div>
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
