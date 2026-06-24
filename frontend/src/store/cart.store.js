import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existente = items.find(i => 
          i.productId === item.productId && i.kitId === item.kitId
        );
        
        const addedQuantity = item.quantity || 1;

        if (existente) {
          const newQuantity = existente.quantity + addedQuantity;
          const maxStock = item.stock !== undefined ? item.stock : Infinity;
          const finalQuantity = Math.min(newQuantity, maxStock);
          
          set({ items: items.map(i =>
            (i.productId === item.productId && i.kitId === item.kitId)
              ? { ...i, quantity: finalQuantity, stock: item.stock !== undefined ? item.stock : i.stock }
              : i
          )});
        } else {
          const maxStock = item.stock !== undefined ? item.stock : Infinity;
          const finalQuantity = Math.min(addedQuantity, maxStock);
          
          set({ items: [...items, { ...item, quantity: finalQuantity }] });
        }
      },
      removeItem: (id, isKit = false) => set({
        items: get().items.filter(i =>
          isKit ? i.kitId !== id : i.productId !== id
        )
      }),
      updateQuantity: (id, quantity, isKit = false) => set({
        items: get().items.map(i => {
          if (isKit ? i.kitId === id : i.productId === id) {
            const maxStock = i.stock !== undefined ? i.stock : Infinity;
            const finalQty = Math.min(Math.max(1, quantity), maxStock);
            return { ...i, quantity: finalQty };
          }
          return i;
        })
      }),
      clearCart: () => set({ items: [] }),
      getCartTotal: () => get().items.reduce(
        (acc, i) => acc + (Number(i.price) * i.quantity), 0
      ),
      getCartCount: () => get().items.reduce(
        (acc, i) => acc + i.quantity, 0
      ),
    }),
    { name: 'good-shop-cart' }
  )
);

export default useCartStore;
