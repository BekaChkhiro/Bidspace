import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function useAuctions(params = {}) {
  return useQuery({
    queryKey: ['auctions', params],
    queryFn: () => apiClient.get('/auction', params),
    retry: (failureCount, error) => {
      if (error.message === 'Authentication required') return false;
      return failureCount < 2;
    }
  });
}
