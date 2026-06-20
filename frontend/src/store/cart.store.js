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
        if (existente) {
          set({ items: items.map(i =>
            (i.productId === item.productId && i.kitId === item.kitId)
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )});
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },
      removeItem: (id, isKit = false) => set({
        items: get().items.filter(i =>
          isKit ? i.kitId !== id : i.productId !== id
        )
      }),
      updateQuantity: (id, quantity, isKit = false) => set({
        items: get().items.map(i =>
          (isKit ? i.kitId === id : i.productId === id)
            ? { ...i, quantity }
            : i
        )
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
