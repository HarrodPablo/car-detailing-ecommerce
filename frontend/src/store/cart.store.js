import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(i => 
            (i.productId && i.productId === item.productId) || 
            (i.kitId && i.kitId === item.kitId)
          );
          if (existingItem) {
            return {
              items: state.items.map(i => 
                (i.productId === item.productId || i.kitId === item.kitId)
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            };
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: (id, isKit = false) => {
        set((state) => ({
          items: state.items.filter(i => isKit ? i.kitId !== id : i.productId !== id)
        }));
      },
      updateQuantity: (id, quantity, isKit = false) => {
        set((state) => ({
          items: state.items.map(i => 
            ((isKit && i.kitId === id) || (!isKit && i.productId === id))
              ? { ...i, quantity }
              : i
          )
        }));
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
