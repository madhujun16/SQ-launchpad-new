import { useState, useEffect, useRef, useCallback } from 'react';

interface UseDataFetchingOptions<T> {
  fetchFn: () => Promise<T>;
  dependencies?: any[];
  enabled?: boolean;
  cacheKey?: string;
  cacheDuration?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseDataFetchingResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

// Simple in-memory cache
const dataCache = new Map<string, { data: any; timestamp: number }>();

export function useDataFetching<T>({
  fetchFn,
  dependencies = [],
  enabled = true,
  cacheKey,
  cacheDuration = 5 * 60 * 1000, // 5 minutes default
  onSuccess,
  onError
}: UseDataFetchingOptions<T>): UseDataFetchingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check cache first
  const getCachedData = useCallback((): T | null => {
    if (!cacheKey) return null;
    
    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data;
    }
    
    return null;
  }, [cacheKey, cacheDuration]);

  // Set cache data
  const setCachedData = useCallback((newData: T) => {
    if (cacheKey) {
      dataCache.set(cacheKey, {
        data: newData,
        timestamp: Date.now()
      });
    }
  }, [cacheKey]);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Check cache first
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      setError(null);
      onSuccess?.(cachedData);
      return;
    }

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const result = await fetchFn();
      
      if (!mountedRef.current) return;
      
      if (abortControllerRef.current.signal.aborted) return;

      setData(result);
      setCachedData(result);
      onSuccess?.(result);
    } catch (err) {
      if (!mountedRef.current) return;
      
      if (abortControllerRef.current.signal.aborted) return;

      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError?.(error);
    } finally {
      if (mountedRef.current && !abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [enabled, fetchFn, getCachedData, setCachedData, onSuccess, onError]);

  // Refetch function
  const refetch = useCallback(async () => {
    if (cacheKey) {
      dataCache.delete(cacheKey);
    }
    await fetchData();
  }, [cacheKey, fetchData]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    clearError
  };
}

// Hook for paginated data
export function usePaginatedData<T>({
  fetchFn,
  pageSize = 10,
  dependencies = [],
  enabled = true,
  cacheKey,
  cacheDuration = 5 * 60 * 1000
}: {
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>;
  pageSize?: number;
  dependencies?: any[];
  enabled?: boolean;
  cacheKey?: string;
  cacheDuration?: number;
}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(async (page: number) => {
    if (!enabled) return;

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const result = await fetchFn(page, pageSize);
      
      if (!mountedRef.current) return;
      
      if (abortControllerRef.current.signal.aborted) return;

      setData(result.data);
      setTotalItems(result.total);
      setTotalPages(Math.ceil(result.total / pageSize));
      setCurrentPage(page);
    } catch (err) {
      if (!mountedRef.current) return;
      
      if (abortControllerRef.current.signal.aborted) return;

      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
    } finally {
      if (mountedRef.current && !abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [enabled, fetchFn, pageSize]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchPage(page);
    }
  }, [fetchPage, totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Effect to fetch first page when dependencies change
  useEffect(() => {
    setCurrentPage(1);
    fetchPage(1);
  }, [fetchPage, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}

// Hook for infinite scroll data
export function useInfiniteData<T>({
  fetchFn,
  pageSize = 20,
  dependencies = [],
  enabled = true
}: {
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>;
  pageSize?: number;
  dependencies?: any[];
  enabled?: boolean;
}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNextPage = useCallback(async () => {
    if (!enabled || loading || !hasMore) return;

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const result = await fetchFn(currentPage, pageSize);
      
      if (!mountedRef.current) return;
      
      if (abortControllerRef.current.signal.aborted) return;

      setData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setCurrentPage(prev => prev + 1);
    } catch (err) {
      if (!mountedRef.current) return;
      
      if (abortControllerRef.current.signal.aborted) return;

      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
    } finally {
      if (mountedRef.current && !abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [enabled, loading, hasMore, fetchFn, currentPage, pageSize]);

  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  // Effect to reset and fetch first page when dependencies change
  useEffect(() => {
    reset();
    fetchNextPage();
  }, [reset, fetchNextPage, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    fetchNextPage,
    reset
  };
}
