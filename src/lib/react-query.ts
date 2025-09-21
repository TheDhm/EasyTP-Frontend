import { QueryClient } from '@tanstack/react-query';
import type { APIError } from '@/types/api';

// React Query configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        const apiError = error as unknown as APIError;
        // Don't retry on auth errors
        if (apiError?.status === 401 || apiError?.status === 403) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error) => {
        const apiError = error as unknown as APIError;
        // Don't retry auth errors or client errors (4xx)
        if (apiError?.status >= 400 && apiError?.status < 500) {
          return false;
        }
        // Retry server errors up to 2 times
        return failureCount < 2;
      },
    },
  },
});

// Query keys factory for consistency
export const queryKeys = {
  // Authentication
  auth: ['auth'] as const,

  // Dashboard
  dashboard: ['dashboard'] as const,

  // Apps
  apps: ['apps'] as const,

  // Files
  files: {
    all: ['files'] as const,
    list: (path?: string) => [...queryKeys.files.all, 'list', path] as const,
  },

  // Usage statistics
  usageStats: {
    all: ['usageStats'] as const,
    list: (filters?: Record<string, string>) =>
      [...queryKeys.usageStats.all, 'list', filters] as const,
  },
} as const;