import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2, Search, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import Modal from '../../components/ui/Modal';

const brandSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  country: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional()
});

const BrandsAdmin = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await api.get('/brands');
      return res.data;
    },
    staleTime: 0,
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      slug: '',
      country: '',
      website: '',
      description: ''
    }
  });

  const nameValue = watch('name');

  useEffect(() => {
    if (!editingBrand && nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setValue('slug', generatedSlug);
    }
  }, [nameValue, editingBrand, setValue]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/brands', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Marca creada exitosamente');
      closeModal();
    },
    onError: () => toast.error('Error al crear la marca')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/brands/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Marca actualizada exitosamente');
      closeModal();
    },
    onError: () => toast.error('Error al actualizar la marca')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/brands/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Marca eliminada exitosamente');
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Error al eliminar la marca';
      toast.error(msg);
    }
  });

  const handleOpenCreate = () => {
    setEditingBrand(null);
    reset({ name: '', slug: '', country: '', website: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    reset({
      name: brand.name,
      slug: brand.slug,
      country: brand.country || '',
      website: brand.website || '',
      description: brand.description || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  const onSubmit = (data) => {
    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta marca?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-white">Marcas</h1>
        <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Nueva Marca
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-dark-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Buscar marca por nombre..." 
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
                <th className="p-4 font-medium">Nombre</th>
                <th className="p-4 font-medium">País</th>
                <th className="p-4 font-medium">Sitio Web</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {isLoading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filteredBrands.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No hay marcas encontradas.</td></tr>
              ) : (
                filteredBrands.map(brand => (
                  <tr key={brand.id} className="hover:bg-dark-900/50 transition-colors">
                    <td className="p-4 text-white font-medium">{brand.name}</td>
                    <td className="p-4 text-gray-300">{brand.country || '-'}</td>
                    <td className="p-4">
                      {brand.website ? (
                        <a href={brand.website} target="_blank" rel="noreferrer" className="text-brand hover:underline flex items-center gap-1">
                          {brand.website} <ExternalLink size={14} />
                        </a>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleOpenEdit(brand)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors mr-2">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(brand.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingBrand ? "Editar Marca" : "Nueva Marca"}>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Slug *</label>
              <input 
                {...register('slug')}
                className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
                readOnly={!editingBrand}
              />
              {errors.slug && <span className="text-red-500 text-xs mt-1">{errors.slug.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">País</label>
              <input 
                {...register('country')}
                className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sitio Web</label>
              <input 
                {...register('website')}
                placeholder="https://..."
                className="w-full bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand"
              />
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
              {isSubmitting ? 'Guardando...' : 'Guardar Marca'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BrandsAdmin;
