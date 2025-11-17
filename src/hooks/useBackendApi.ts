/**
 * React Hook for Google Cloud Backend API
 * Provides easy access to API client with React Query integration
 */

import { useState, useCallback } from 'react';
import { apiClient, ApiResponse } from '@/services/apiClient';
import { toast } from 'sonner';

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useBackendApi<T = any>(options?: UseApiOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    onSuccess,
    onError,
  } = options || {};

  const execute = useCallback(
    async (apiCall: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall();

        if (response.success && response.data) {
          setData(response.data);
          if (showSuccessToast) {
            toast.success(successMessage);
          }
          onSuccess?.(response.data);
        } else if (response.error) {
          const errorMessage = response.error.message || 'An error occurred';
          setError(errorMessage);
          if (showErrorToast) {
            toast.error(errorMessage);
          }
          onError?.(response.error);
        }

        return response;
      } catch (err: any) {
        const errorMessage = err.message || 'An unexpected error occurred';
        setError(errorMessage);
        if (showErrorToast) {
          toast.error(errorMessage);
        }
        onError?.(err);
        return {
          success: false,
          error: {
            message: errorMessage,
          },
        };
      } finally {
        setLoading(false);
      }
    },
    [showSuccessToast, showErrorToast, successMessage, onSuccess, onError]
  );

  const get = useCallback(
    (endpoint: string, options?: RequestInit) => {
      return execute(() => apiClient.get<T>(endpoint, options));
    },
    [execute]
  );

  const post = useCallback(
    (endpoint: string, data?: any, options?: RequestInit) => {
      return execute(() => apiClient.post<T>(endpoint, data, options));
    },
    [execute]
  );

  const put = useCallback(
    (endpoint: string, data?: any, options?: RequestInit) => {
      return execute(() => apiClient.put<T>(endpoint, data, options));
    },
    [execute]
  );

  const patch = useCallback(
    (endpoint: string, data?: any, options?: RequestInit) => {
      return execute(() => apiClient.patch<T>(endpoint, data, options));
    },
    [execute]
  );

  const del = useCallback(
    (endpoint: string, options?: RequestInit) => {
      return execute(() => apiClient.delete<T>(endpoint, options));
    },
    [execute]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    patch,
    delete: del,
    execute,
    reset,
  };
}

// Export the API client directly for non-hook usage
export { apiClient };

