import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      retry: (failureCount, error) => {
        // Don't retry on 401 errors
        if (error?.message?.includes('401')) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false
    }
  }
});
