import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';

export const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
};

export const createQueryClient = (config?: QueryClientConfig): QueryClient => {
  return new QueryClient({
    ...defaultQueryClientConfig,
    ...config,
  });
};

export const queryClient = createQueryClient();
