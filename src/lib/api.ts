import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  TokenRefreshRequest,
  TokenRefreshResponse,
  DashboardResponse,
  AppsResponse,
  FilesResponse,
  UsageStatsResponse,
  APIError
} from '@/types/api';
import config from './config';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = config.api.baseUrl) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Get token from localStorage
    const token = localStorage.getItem('access_token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: APIError = {
          message: errorData.message || response.statusText || 'An error occurred',
          status: response.status,
          details: errorData,
        };
        throw error;
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw {
          message: error.message,
          status: 0,
          details: { originalError: error },
        } as APIError;
      }
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: TokenRefreshRequest): Promise<TokenRefreshResponse> {
    return this.request<TokenRefreshResponse>('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify(refreshToken),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout/', {
      method: 'POST',
    });
  }

  async continueAsGuest(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/continue-as-guest/', {
      method: 'POST',
    });
  }

  // Core endpoints
  async getLanding(): Promise<any> {
    return this.request<any>('/');
  }

  async getDashboard(): Promise<DashboardResponse> {
    return this.request<DashboardResponse>('/dashboard/');
  }

  async getApps(): Promise<AppsResponse> {
    return this.request<AppsResponse>('/apps/');
  }

  async startApp(appName: string): Promise<void> {
    return this.request<void>(`/start/${appName}/`, {
      method: 'POST',
    });
  }

  async stopApp(appName: string): Promise<void> {
    return this.request<void>(`/stop/${appName}/`, {
      method: 'POST',
    });
  }

  // File management
  async getFiles(path?: string): Promise<FilesResponse> {
    const endpoint = path ? `/files/${encodeURIComponent(path)}/` : '/files/';
    return this.request<FilesResponse>(endpoint);
  }

  async uploadFile(path: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = path ? `/files/${encodeURIComponent(path)}/` : '/files/';

    // Get token for multipart form data request
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || 'Upload failed',
        status: response.status,
        details: errorData,
      } as APIError;
    }
  }

  async downloadFile(path: string): Promise<Blob> {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${this.baseURL}/download/${path}/`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw {
        message: 'Download failed',
        status: response.status,
      } as APIError;
    }

    return response.blob();
  }

  async deleteFile(path: string): Promise<void> {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${this.baseURL}/files/${path}/`, {
      method: 'DELETE',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || 'Delete failed',
        status: response.status,
        details: errorData,
      } as APIError;
    }
  }

  // Admin endpoints
  async getUsageStatistics(params?: Record<string, string>): Promise<UsageStatsResponse> {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<UsageStatsResponse>(`/usage_statistics/${queryString}`);
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;