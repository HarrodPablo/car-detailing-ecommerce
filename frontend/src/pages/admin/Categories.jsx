import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2, Search, MoveVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import Modal from '../../components/ui/Modal';

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  sortOrder: z.coerce.number().min(0).optional()
});

const CategoriesAdmin = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
    staleTime: 0,
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      sortOrder: 0
    }
  });

  const nameValue = watch('name');

  useEffect(() => {
    if (!editingCategory && nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setValue('slug', generatedSlug);
    }
  }, [nameValue, editingCategory, setValue]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/categories', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría creada exitosamente');
      closeModal();
    },
    onError: () => toast.error('Error al crear la categoría')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/categories/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría actualizada exitosamente');
      closeModal();
    },
    onError: () => toast.error('Error al actualizar la categoría')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría eliminada exitosamente');
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Error al eliminar la categoría';
      toast.error(msg);
    }
  });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    reset({ name: '', slug: '', sortOrder: categories.length });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder || 0
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const onSubmit = (data) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-white">Categorías</h1>
        <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Nueva Categoría
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-dark-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Buscar categoría por nombre..." 
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
                <th className="p-4 font-medium w-24">Orden</th>
                <th className="p-4 font-medium">Nombre</th>
                <th className="p-4 font-medium">Slug</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {isLoading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No hay categorías encontradas.</td></tr>
              ) : (
                filteredCategories.map(category => (
                  <tr key={category.id} className="hover:bg-dark-900/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <MoveVertical size={16} />
                        <span className="font-mono">{category.sortOrder}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white font-medium">{category.name}</td>
                    <td className="p-4 text-gray-400 text-sm">{category.slug}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleOpenEdit(category)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors mr-2">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(category.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}>
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
                readOnly={!editingCategory}
              />
              {errors.slug && <span className="text-red-500 text-xs mt-1">{errors.slug.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Orden (numérico)</label>
            <input 
              type="number"
              {...register('sortOrder')}
              className="w-full max-w-[200px] bg-dark-900 border border-dark-border rounded px-4 py-2 text-white focus:outline-none focus:border-brand font-mono"
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
              {isSubmitting ? 'Guardando...' : 'Guardar Categoría'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoriesAdmin;
