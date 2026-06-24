import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:           1000 * 60 * 5,  // 5 min — no refetch si datos frescos
      gcTime:              1000 * 60 * 10, // 10 min — mantener en caché sin observers
      retry:               1,              // solo 1 reintento en caso de error
      refetchOnWindowFocus: false,         // no refetch al cambiar de tab
      refetchOnReconnect:   true,          // sí refetch al reconectar internet
    },
  },
});
