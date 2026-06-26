import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, SearchX, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ComboCard from '../../components/shop/ComboCard';
import ProductCard from '../../components/shop/ProductCard';
import { SkeletonComboCard, SkeletonProductCard } from '../../components/ui/SkeletonCard';
import api from '../../lib/axios';

const EMPTY_ARRAY = [];

const Catalog = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [categoriesOpen, setCategoriesOpen] = useState(window.innerWidth >= 1024);
  const [brandsOpen, setBrandsOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setCategoriesOpen(true);
        setBrandsOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentCategory = searchParams.get('category');
  const currentBrand = searchParams.get('brand');
  const currentSort = searchParams.get('sort') || 'newest';

  const isCombosView = currentCategory === 'combo';

  // Fetch Categories for Sidebar
  const { data: categories = EMPTY_ARRAY, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['sidebar-categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });
  const normalCategories = categories.filter(c => c.name.toLowerCase() !== 'combos');

  // Fetch Brands for Sidebar
  const { data: brands = EMPTY_ARRAY, isLoading: isLoadingBrands } = useQuery({
    queryKey: ['sidebar-brands'],
    queryFn: async () => {
      const res = await api.get('/brands');
      return res.data;
    }
  });

  // Fetch Products/Combos for Grid
  useEffect(() => {
    // Wait until filter lookups are ready before fetching products
    if (isLoadingCategories || isLoadingBrands) return;

    const fetchItems = async () => {
      setLoading(true);
      try {
        let url = '';
        if (isCombosView) {
          url = '/combos';
        } else {
          const params = new URLSearchParams();
          if (currentCategory) {
            const catObj = normalCategories.find(c => c.name === currentCategory);
            if (catObj) params.append('categoryId', catObj.id);
          }
          if (currentBrand) {
            const brandObj = brands.find(b => b.name === currentBrand);
            if (brandObj) params.append('brandId', brandObj.id);
          }
          url = `/products?${params.toString()}`;
        }

        const res = await api.get(url);
        setItems(Array.isArray(res.data) ? res.data : [res.data]);
      } catch (error) {
        console.error('Error fetching catalog', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [currentCategory, currentBrand, isCombosView, categories, brands, isLoadingCategories, isLoadingBrands]);

  // Handlers
  const handleClearAllCategories = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('category');
      newParams.delete('brand');
      return newParams;
    });
  };

  const handleSetCategory = (categoryName) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('category', categoryName);
      newParams.delete('brand');
      return newParams;
    });
  };

  const handleSetBrand = (brandName) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('brand', brandName);
      if (newParams.get('category') === 'combo') {
        newParams.delete('category');
      }
      return newParams;
    });
  };

  const handleClearBrand = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('brand');
      return newParams;
    });
  };

  const handleSortChange = (e) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('sort', e.target.value);
      return newParams;
    });
  };

  const sortedItems = [...items].sort((a, b) => {
    const priceA = Number(a.salePrice || a.kitPrice || 0);
    const priceB = Number(b.salePrice || b.kitPrice || 0);

    if (currentSort === 'price_asc') {
      return priceA - priceB;
    }
    if (currentSort === 'price_desc') {
      return priceB - priceA;
    }
    // newest (default)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="bg-dark-base min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 bg-[#111] md:border-r md:border-b-0 border-b border-[#2D2D2D] md:sticky md:top-24 h-fit p-6 rounded-xl md:rounded-r-none z-10">

            {/* SECCIÓN CATEGORÍAS */}
            <div>
              <div
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className={`flex items-center justify-between cursor-pointer group ${categoriesOpen ? 'mb-4' : ''}`}
              >
                <h3 className="font-heading font-black text-white text-sm tracking-widest uppercase transition-colors group-hover:text-[#8B0000]">
                  Categorías
                </h3>
                {categoriesOpen ? <ChevronUp size={14} className="text-[#666] group-hover:text-[#8B0000]" /> : <ChevronDown size={14} className="text-[#666] group-hover:text-[#8B0000]" />}
              </div>
              {categoriesOpen && <div className="h-px bg-[#2D2D2D] mb-4" />}

              <div className={`space-y-1 overflow-hidden transition-all duration-300 ${categoriesOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                <div
                  onClick={handleClearAllCategories}
                  className={`block py-1.5 text-sm transition-colors cursor-pointer border-l-2 ${!currentCategory && !currentBrand ? 'text-[#8B0000] font-bold border-[#8B0000] pl-2' : 'text-[#666] hover:text-white border-transparent hover:border-[#2D2D2D] pl-3'}`}
                >
                  Todas
                </div>

                {isLoadingCategories ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-6 bg-[#2D2D2D] rounded animate-pulse w-3/4 my-2 ml-3"></div>
                  ))
                ) : (
                  normalCategories.map(cat => (
                    <div
                      key={cat.id}
                      onClick={() => handleSetCategory(cat.name)}
                      className={`block py-1.5 text-sm transition-colors cursor-pointer border-l-2 ${currentCategory === cat.name ? 'text-[#8B0000] font-bold border-[#8B0000] pl-2' : 'text-[#666] hover:text-white border-transparent hover:border-[#2D2D2D] pl-3'}`}
                    >
                      {cat.name}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="h-px bg-[#2D2D2D] my-6" />

            {/* SECCIÓN COMBOS */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-black text-white text-sm tracking-widest uppercase">
                  Combos
                </h3>
                <span className="bg-[#8B0000]/20 border border-[#8B0000]/40 text-[#8B0000] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  PREMIUM
                </span>
              </div>
              <div className="h-px bg-[#2D2D2D] mb-4" />

              <div className="space-y-1">
                <div
                  onClick={() => handleSetCategory('combo')}
                  className={`block py-1.5 text-sm transition-colors cursor-pointer border-l-2 ${currentCategory === 'combo' ? 'text-[#8B0000] font-bold border-[#8B0000] pl-2' : 'text-[#666] hover:text-white border-transparent hover:border-[#2D2D2D] pl-3'}`}
                >
                  Todos los combos
                </div>
              </div>
            </div>

            <div className="h-px bg-[#2D2D2D] my-6" />

            {/* SECCIÓN MARCAS */}
            <div>
              <div
                onClick={() => setBrandsOpen(!brandsOpen)}
                className={`flex items-center justify-between cursor-pointer group ${brandsOpen ? 'mb-4' : ''}`}
              >
                <h3 className="font-heading font-black text-white text-sm tracking-widest uppercase transition-colors group-hover:text-[#8B0000]">
                  Marcas
                </h3>
                {brandsOpen ? <ChevronUp size={14} className="text-[#666] group-hover:text-[#8B0000]" /> : <ChevronDown size={14} className="text-[#666] group-hover:text-[#8B0000]" />}
              </div>
              {brandsOpen && <div className="h-px bg-[#2D2D2D] mb-4" />}

              <div className={`space-y-1 overflow-hidden transition-all duration-300 ${brandsOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                <div
                  onClick={handleClearBrand}
                  className={`block py-1.5 text-sm transition-colors cursor-pointer border-l-2 ${!currentBrand && !isCombosView && currentCategory ? 'text-[#8B0000] font-bold border-[#8B0000] pl-2' : 'text-[#666] hover:text-white border-transparent hover:border-[#2D2D2D] pl-3'}`}
                >
                  Todas las marcas
                </div>

                {isLoadingBrands ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-6 bg-[#2D2D2D] rounded animate-pulse w-3/4 my-2 ml-3"></div>
                  ))
                ) : (
                  brands.map(brand => (
                    <div
                      key={brand.id}
                      onClick={() => handleSetBrand(brand.name)}
                      className={`block py-1.5 text-sm transition-colors cursor-pointer border-l-2 ${currentBrand === brand.name ? 'text-[#8B0000] font-bold border-[#8B0000] pl-2' : 'text-[#666] hover:text-white border-transparent hover:border-[#2D2D2D] pl-3'}`}
                    >
                      {brand.name}
                    </div>
                  ))
                )}
              </div>
            </div>

          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Grid Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4 border-b border-[#2D2D2D] pb-6">
              <div>
                <h1 className="font-heading font-black text-white text-3xl uppercase tracking-wider mb-2">
                  {isCombosView ? 'Catálogo de Combos' : 'Catálogo de Productos'}
                </h1>
                <p className="text-[#666] text-sm mb-4">
                  {items.length} {isCombosView ? 'combos encontrados' : 'productos encontrados'}
                </p>

                {/* Active Filter Chips */}
                {((currentCategory && !isCombosView) || currentBrand || isCombosView) && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {currentCategory && !isCombosView && (
                      <span className="flex items-center gap-1 bg-[#8B0000]/20 border border-[#8B0000]/40 text-[#8B0000] text-xs px-2 py-1 rounded-full">
                        {currentCategory}
                        <X size={10} className="cursor-pointer ml-1" onClick={() => handleClearAllCategories()} />
                      </span>
                    )}
                    {currentBrand && (
                      <span className="flex items-center gap-1 bg-[#8B0000]/20 border border-[#8B0000]/40 text-[#8B0000] text-xs px-2 py-1 rounded-full">
                        {currentBrand}
                        <X size={10} className="cursor-pointer ml-1" onClick={() => handleClearBrand()} />
                      </span>
                    )}
                    {isCombosView && (
                      <span className="flex items-center gap-1 bg-[#8B0000]/20 border border-[#8B0000]/40 text-[#8B0000] text-xs px-2 py-1 rounded-full">
                        Combos
                        <X size={10} className="cursor-pointer ml-1" onClick={() => handleClearAllCategories()} />
                      </span>
                    )}
                  </div>
                )}
              </div>

              <select
                value={currentSort}
                onChange={handleSortChange}
                className="bg-[#111] border border-[#2D2D2D] text-white text-sm rounded px-3 py-2 outline-none focus:border-brand cursor-pointer mt-1"
              >
                <option value="newest">Más nuevo</option>
                <option value="price_asc">Precio ↑</option>
                <option value="price_desc">Precio ↓</option>
              </select>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  isCombosView ? (
                    <SkeletonComboCard key={idx} />
                  ) : (
                    <SkeletonProductCard key={idx} />
                  )
                ))}
              </div>
            ) : sortedItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedItems.map(item => (
                  isCombosView ? (
                    <ComboCard key={item.id} combo={item} />
                  ) : (
                    <ProductCard key={item.id} product={item} />
                  )
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-24 px-4 bg-[#111] rounded-xl border border-[#2D2D2D]">
                <SearchX className="w-24 h-24 text-[#2D2D2D] mb-6" strokeWidth={1.5} />
                <p className="text-[#666] text-lg mb-8 text-center font-sans">
                  No encontramos resultados con ese filtro
                </p>
                <button
                  onClick={handleClearAllCategories}
                  className="px-6 py-2.5 border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white rounded transition-colors font-sans font-medium uppercase tracking-wider text-sm"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};

export default Catalog;
