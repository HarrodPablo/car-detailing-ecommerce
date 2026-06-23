import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Tag, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import Modal from '../../components/ui/Modal';

const CategoriesAdmin = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('categories'); 
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const { register: registerCat, handleSubmit: handleSubmitCat, reset: resetCat } = useForm();
  const { register: registerBrand, handleSubmit: handleSubmitBrand, reset: resetBrand } = useForm();

  
  const { data: categories, isLoading: loadingCat } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data
  });

  const { data: brands, isLoading: loadingBrand } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => (await api.get('/brands')).data
  });

  
  const createCategory = useMutation({
    mutationFn: (data) => api.post('/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Categoría creada');
      closeCategoryModal();
    }
  });

  const updateCategory = useMutation({
    mutationFn: (data) => api.put(`/categories/${editingCategory.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Categoría actualizada');
      closeCategoryModal();
    }
  });

  const deleteCategory = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Categoría eliminada');
    }
  });

  // Brand Mutations
  const createBrand = useMutation({
    mutationFn: (data) => api.post('/brands', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['brands']);
      toast.success('Marca creada');
      closeBrandModal();
    }
  });

  const updateBrand = useMutation({
    mutationFn: (data) => api.put(`/brands/${editingBrand.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['brands']);
      toast.success('Marca actualizada');
      closeBrandModal();
    }
  });

  const deleteBrand = useMutation({
    mutationFn: (id) => api.delete(`/brands/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['brands']);
      toast.success('Marca eliminada');
    }
  });

  // Modal handlers
  const openCategoryModal = (cat = null) => {
    setEditingCategory(cat);
    if (cat) resetCat({ name: cat.name, slug: cat.slug });
    else resetCat({});
    setIsCategoryModalOpen(true);
  };
  const closeCategoryModal = () => { setIsCategoryModalOpen(false); setEditingCategory(null); resetCat(); };

  const openBrandModal = (brand = null) => {
    setEditingBrand(brand);
    if (brand) resetBrand({ name: brand.name, slug: brand.slug, description: brand.description });
    else resetBrand({});
    setIsBrandModalOpen(true);
  };
  const closeBrandModal = () => { setIsBrandModalOpen(false); setEditingBrand(null); resetBrand(); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold dark:text-white">Gestión de Categorías y Marcas</h2>
        <div className="flex space-x-2 bg-gray-200 dark:bg-dark-800 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'categories' ? 'bg-white dark:bg-dark-900 shadow text-primary-light' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Categorías
          </button>
          <button 
            onClick={() => setActiveTab('brands')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'brands' ? 'bg-white dark:bg-dark-900 shadow text-primary-light' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Marcas
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center space-x-2 dark:text-white">
                <Tag size={20} className="text-primary-light" /> <span>Categorías</span>
              </h3>
              <button onClick={() => openCategoryModal()} className="btn-primary flex items-center space-x-2 text-sm">
                <Plus size={16} /> <span>Nueva Categoría</span>
              </button>
            </div>
            
            {loadingCat ? <p className="dark:text-gray-300">Cargando...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Nombre</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories?.map(c => (
                      <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">
                        <td className="p-4 font-medium dark:text-white">{c.name}</td>
                        <td className="p-4 text-sm text-gray-500">{c.slug}</td>
                        <td className="p-4 flex items-center justify-end space-x-2">
                          <button onClick={() => openCategoryModal(c)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit size={18} /></button>
                          <button onClick={() => { if(window.confirm('¿Eliminar categoría?')) deleteCategory.mutate(c.id) }} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'brands' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center space-x-2 dark:text-white">
                <Bookmark size={20} className="text-primary-light" /> <span>Marcas</span>
              </h3>
              <button onClick={() => openBrandModal()} className="btn-primary flex items-center space-x-2 text-sm">
                <Plus size={16} /> <span>Nueva Marca</span>
              </button>
            </div>

            {loadingBrand ? <p className="dark:text-gray-300">Cargando...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Nombre</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4">Descripción</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands?.map(b => (
                      <tr key={b.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">
                        <td className="p-4 font-medium dark:text-white">{b.name}</td>
                        <td className="p-4 text-sm text-gray-500">{b.slug}</td>
                        <td className="p-4 text-sm text-gray-500 truncate max-w-xs">{b.description || '-'}</td>
                        <td className="p-4 flex items-center justify-end space-x-2">
                          <button onClick={() => openBrandModal(b)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit size={18} /></button>
                          <button onClick={() => { if(window.confirm('¿Eliminar marca?')) deleteBrand.mutate(b.id) }} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={closeCategoryModal} title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}>
        <form onSubmit={handleSubmitCat(data => editingCategory ? updateCategory.mutate(data) : createCategory.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre</label>
            <input {...registerCat('name', { required: true })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-950 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Slug</label>
            <input {...registerCat('slug', { required: true })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-950 dark:text-white" />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={closeCategoryModal} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:text-gray-300">Cancelar</button>
            <button type="submit" disabled={createCategory.isPending || updateCategory.isPending} className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* Brand Modal */}
      <Modal isOpen={isBrandModalOpen} onClose={closeBrandModal} title={editingBrand ? 'Editar Marca' : 'Nueva Marca'}>
        <form onSubmit={handleSubmitBrand(data => editingBrand ? updateBrand.mutate(data) : createBrand.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre</label>
            <input {...registerBrand('name', { required: true })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-950 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Slug</label>
            <input {...registerBrand('slug', { required: true })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-950 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción</label>
            <textarea {...registerBrand('description')} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-950 dark:text-white"></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={closeBrandModal} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:text-gray-300">Cancelar</button>
            <button type="submit" disabled={createBrand.isPending || updateBrand.isPending} className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesAdmin;
