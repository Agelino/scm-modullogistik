import { useState, useEffect, useCallback } from 'react';
import type { AxiosResponse } from 'axios';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(apiCall: () => Promise<AxiosResponse>, autoFetch = true) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: autoFetch,
    error: null
  });

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiCall();
      setState({ data: response.data.data, loading: false, error: null });
      return response.data.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setState(prev => ({ ...prev, loading: false, error: message }));
      return null;
    }
  }, [apiCall]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, refetch: fetch };
}
