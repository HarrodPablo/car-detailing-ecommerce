import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../../components/ui/Modal';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  sku: z.string().min(1, 'El SKU es requerido'),
  description: z.string().optional(),
  salePrice: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  costPrice: z.coerce.number().min(0).optional().or(z.literal('')),
  stock: z.coerce.number().min(0).optional(),
  minStock: z.coerce.number().min(0).optional(),
  brandId: z.string().min(1, 'La marca es requerida'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
});

const ProductsAdmin = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data;
    }
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await api.get('/brands');
      return res.data;
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      salePrice: '',
      costPrice: '',
      stock: 0,
      minStock: 5,
      brandId: '',
      categoryId: ''
    }
  });

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto creado exitosamente');
      closeModal();
    },
    onError: () => toast.error('Error al crear el producto')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const res = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto actualizado exitosamente');
      closeModal();
    },
    onError: () => toast.error('Error al actualizar el producto')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto eliminado exitosamente');
    },
    onError: () => toast.error('Error al eliminar el producto')
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    reset({
      name: '', sku: '', description: '', salePrice: '', costPrice: '',
      stock: 0, minStock: 5, brandId: '', categoryId: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      salePrice: product.salePrice,
      costPrice: product.costPrice || '',
      stock: product.stock,
      minStock: product.minStock,
      brandId: product.brandId?.toString() || '',
      categoryId: product.categoryId?.toString() || ''
    });
    setImageFile(null);
    setImagePreview(product.images?.[0]?.url || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-white">Productos</h1>
        <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-dark-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Buscar producto por nombre o SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-border rounded-lg text-white focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-900 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Producto</th>
                <th className="p-4 font-medium">Marca</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Precio Venta</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {isLoading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No hay productos encontrados.</td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-dark-900/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0].url} alt={product.name} className="w-12 h-12 rounded object-cover border border-dark-border" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-dark-900 flex items-center justify-center border border-dark-border text-gray-500">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{product.brand?.name || '-'}</td>
                    <td className="p-4">
                      <span className={`badge ${product.stock <= product.minStock ? 'bg-yellow-600/20 text-yellow-500 border border-yellow-600/50' : 'bg-green-600/20 text-green-500 border border-green-600/50'} px-2 py-1 rounded text-xs`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 text-white font-mono">{formatCurrency(product.salePrice)}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleOpenEdit(product)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors mr-2">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? "Editar Producto" : "Nuevo Producto"}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
              <input 
                {...register('name')}
                className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
              />
              {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">SKU *</label>
              <input 
                {...register('sku')}
                className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
              />
              {errors.sku && <span className="text-red-500 text-xs mt-1">{errors.sku.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
            <textarea 
              {...register('description')}
              rows={3}
              className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Precio de Venta *</label>
              <input 
                type="number" step="0.01"
                {...register('salePrice')}
                className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand font-mono"
              />
              {errors.salePrice && <span className="text-red-500 text-xs mt-1">{errors.salePrice.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Precio de Costo</label>
              <input 
                type="number" step="0.01"
                {...register('costPrice')}
                className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stock Inicial</label>
              <input 
                type="number"
                {...register('stock')}
                className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stock Mínimo</label>
              <input 
                type="number"
                {...register('minStock')}
                className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Marca</label>
              <select 
                {...register('brandId')}
                className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
              >
                <option value="">Seleccionar Marca</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
              <select 
                {...register('categoryId')}
                className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
              >
                <option value="">Seleccionar Categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Imagen del Producto</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleImageChange}
                  className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-gray-300 focus:outline-none focus:border-brand file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand file:text-white hover:file:bg-brand/90 cursor-pointer"
                />
              </div>
              {imagePreview && (
                <div className="w-16 h-16 shrink-0 border border-dark-border rounded overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-dark-border mt-6">
            <button 
              onClick={closeModal} 
              disabled={isSubmitting}
              className="px-4 py-2 bg-dark-900 border border-dark-border text-white rounded hover:bg-dark-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit(onSubmit)} 
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsAdmin;
