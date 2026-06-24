import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { formatCurrency } from '../../utils/formatters';

const KitsAdmin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: combos = [], isLoading } = useQuery({
    queryKey: ['combos'],
    queryFn: async () => {
      const res = await api.get('/combos');
      return res.data;
    },
    staleTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/combos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combos'] });
      toast.success('Combo eliminado exitosamente');
    },
    onError: () => toast.error('Error al eliminar el combo')
  });

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este combo?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (combo) => {
    // Navigate to combo creator for editing (if supported, otherwise show toast)
    toast('La edición de combos estará disponible pronto', { icon: '🛠️' });
  };

  const filteredCombos = combos.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-white">Kits y Combos</h1>
        <button onClick={() => navigate('/admin/combos')} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Nuevo Combo
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-dark-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Buscar combo por nombre..." 
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
                <th className="p-4 font-medium">Combo</th>
                <th className="p-4 font-medium">Cant. Productos</th>
                <th className="p-4 font-medium">Stock Disp.</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium">Precio Venta</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {isLoading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filteredCombos.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No hay combos encontrados.</td></tr>
              ) : (
                filteredCombos.map(combo => (
                  <tr key={combo.id} className="hover:bg-dark-900/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {combo.imageUrl ? (
                          <img src={combo.imageUrl} alt={combo.name} className="w-16 h-10 rounded object-cover border border-dark-border" />
                        ) : (
                          <div className="w-16 h-10 rounded bg-dark-900 flex items-center justify-center border border-dark-border text-gray-500">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{combo.name}</p>
                          <p className="text-xs text-gray-500">ID: {combo.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="badge bg-blue-600/20 text-blue-500 border border-blue-600/50 px-2 py-1 rounded text-xs">
                        {combo.items?.length || 0} {combo.items?.length === 1 ? 'producto' : 'productos'}
                      </span>
                    </td>
                    <td className="p-4">
                      {(() => {
                        if (!combo.items || combo.items.length === 0) return <span className="text-gray-500">0</span>;
                        const availableStock = Math.min(
                          ...combo.items.map(item => Math.floor((item.product?.stock || 0) / item.quantity))
                        );
                        return (
                          <div className="flex flex-col">
                            <span className={`badge ${availableStock <= 0 ? 'bg-red-600/20 text-red-500 border-red-600/50' : 'bg-green-600/20 text-green-500 border-green-600/50'} px-2 py-1 rounded text-xs w-fit`}>
                              {availableStock}
                            </span>
                            <span className="text-[10px] text-gray-500 mt-1" title="Calculado en base al stock de los productos que lo componen">
                              (Dinámico)
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-4">
                      <span className={`badge ${combo.isActive ? 'bg-green-600/20 text-green-500 border border-green-600/50' : 'bg-gray-600/20 text-gray-500 border border-gray-600/50'} px-2 py-1 rounded text-xs`}>
                        {combo.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-white font-mono">{formatCurrency(combo.kitPrice || 0)}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEdit(combo)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors mr-2">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(combo.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
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
    </div>
  );
};

export default KitsAdmin;
