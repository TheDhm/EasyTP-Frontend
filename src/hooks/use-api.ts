import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { queryKeys } from '@/lib/react-query';
import { useAuthStore } from '@/store/auth';
import type {
  DashboardResponse,
  AppsResponse,
  FilesResponse,
  UsageStatsResponse,
  APIError
} from '@/types/api';

// Dashboard hook
export const useDashboard = (): UseQueryResult<DashboardResponse> => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiClient.getDashboard(),
    enabled: isAuthenticated,
  });
};

// Apps hooks
export const useApps = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.apps,
    queryFn: () => apiClient.getApps(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time status
    select: (data: AppsResponse) => {
      // Transform the apps object to an array
      return Object.entries(data.apps).map(([appName, appData]) => ({
        ...appData,
        id: appName,
        name: appName,
        description: undefined, // Backend doesn't provide description yet
        status: appData.deployment_status ? 'running' : 'stopped',
      }));
    },
  });
};

export const useStartApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appName: string) => apiClient.startApp(appName),
    onSuccess: (data: any, appName) => {
      // Optimistically update the app status immediately
      queryClient.setQueryData(queryKeys.apps, (oldData: any) => {
        // Ensure oldData exists and is an array (transformed data)
        if (!oldData || !Array.isArray(oldData)) {
          return oldData;
        }

        const updatedApps = oldData.map((app: any) => {
          if (app.id === appName) {
            return {
              ...app,
              status: 'starting',
              deployment_status: true,
              is_deployed: true,
              novnc_url: data?.novnc_url || app.novnc_url
            };
          }
          return app;
        });

        return updatedApps;
      });

      // Also invalidate to ensure fresh data after optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.apps });
    },
  });
};

export const useStopApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appName: string) => apiClient.stopApp(appName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apps });
    },
  });
};

// Files hooks
export const useFiles = (path?: string): UseQueryResult<FilesResponse> => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.files.list(path),
    queryFn: () => apiClient.getFiles(path),
    enabled: isAuthenticated,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ path, file }: { path: string; file: File }) =>
      apiClient.uploadFile(path, file),
    onSuccess: (_, variables) => {
      // Invalidate the specific files query
      queryClient.invalidateQueries({
        queryKey: queryKeys.files.list(variables.path)
      });
    },
  });
};

export const useDownloadFile = () => {
  return useMutation({
    mutationFn: ({ path }: { path: string; filename: string }) => apiClient.downloadFile(path),
    onSuccess: (blob, { filename }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Use the provided filename instead of extracting from path
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ path }: { path: string; currentPath?: string }) => apiClient.deleteFile(path),
    onSuccess: (_, { currentPath }) => {
      // Invalidate the files query to refresh the list
      if (currentPath !== undefined) {
        // Invalidate only the specific directory's query
        queryClient.invalidateQueries({
          queryKey: queryKeys.files.list(currentPath)
        });
      } else {
        // Fallback: invalidate all file queries if currentPath not provided
        queryClient.invalidateQueries({
          queryKey: queryKeys.files.all
        });
      }
    },
  });
};

// Usage statistics hook (admin only)
export const useUsageStats = (filters?: Record<string, string>): UseQueryResult<UsageStatsResponse> => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'A';

  return useQuery({
    queryKey: queryKeys.usageStats.list(filters),
    queryFn: () => apiClient.getUsageStatistics(filters),
    enabled: isAdmin,
  });
};

// Generic error handler hook
export const useApiError = () => {
  const logout = useAuthStore((state) => state.logout);

  const handleError = (error: APIError) => {
    // Handle 401 Unauthorized - token expired
    if (error.status === 401) {
      logout();
      return;
    }

    // Log other errors for debugging
    console.error('API Error:', error);
  };

  return { handleError };
};

// Auth status hook with auto-refresh
export const useAuthStatus = () => {
  const { isAuthenticated, refreshAuth } = useAuthStore();

  // Auto-refresh token every 50 minutes (tokens expire in 60 minutes)
  useQuery({
    queryKey: ['auth', 'refresh'],
    queryFn: refreshAuth,
    enabled: isAuthenticated,
    refetchInterval: 50 * 60 * 1000, // 50 minutes
    refetchIntervalInBackground: true,
  });

  return { isAuthenticated };
};