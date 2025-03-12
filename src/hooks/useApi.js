import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../components/core/context/AuthContext';

export function useApi() {
  const { refreshAuth } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleAuthRequired = async () => {
      if (isRefreshing) return;
      
      setIsRefreshing(true);
      try {
        await refreshAuth();
      } finally {
        setIsRefreshing(false);
      }
    };

    window.addEventListener('auth:required', handleAuthRequired);
    return () => window.removeEventListener('auth:required', handleAuthRequired);
  }, [refreshAuth, isRefreshing]);

  return { apiClient };
}
