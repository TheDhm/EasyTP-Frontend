import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/lib/api';
import type { User, LoginRequest, SignupRequest, APIError } from '@/types/api';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  clearError: () => void;

  // Internal actions
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });

          const response = await apiClient.login(credentials);

          set({
            user: response.user,
            accessToken: response.access,
            refreshToken: response.refresh,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store token in localStorage for API client
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);

        } catch (error) {
          const apiError = error as APIError;
          set({
            error: apiError.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          throw error;
        }
      },

      signup: async (userData: SignupRequest) => {
        try {
          set({ isLoading: true, error: null });

          const response = await apiClient.signup(userData);

          set({
            user: response.user,
            accessToken: response.access,
            refreshToken: response.refresh,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);

        } catch (error) {
          const apiError = error as APIError;
          set({
            error: apiError.message || 'Signup failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          throw error;
        }
      },

      continueAsGuest: async () => {
        try {
          set({ isLoading: true, error: null });

          const response = await apiClient.continueAsGuest();

          set({
            user: response.user,
            accessToken: response.access,
            refreshToken: response.refresh,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);

        } catch (error) {
          const apiError = error as APIError;
          set({
            error: apiError.message || 'Guest access failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Call API logout in background (don't await)
        apiClient.logout().catch(console.error);

        // Clear state immediately
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });

        // Clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      },

      refreshAuth: async (): Promise<boolean> => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) return false;

          const response = await apiClient.refreshToken({ refresh: refreshToken });

          set({
            accessToken: response.access,
            // Update refresh token if backend provides a new one (token rotation)
            ...(response.refresh && { refreshToken: response.refresh }),
          });

          localStorage.setItem('access_token', response.access);
          if (response.refresh) {
            localStorage.setItem('refresh_token', response.refresh);
          }
          return true;

        } catch (error) {
          // Refresh failed, logout user
          get().logout();
          return false;
        }
      },

      clearError: () => set({ error: null }),
      setTokens: (access: string, refresh: string) => set({ accessToken: access, refreshToken: refresh }),
      setUser: (user: User) => set({ user }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync localStorage with persisted state on hydration
        if (state?.accessToken) {
          localStorage.setItem('access_token', state.accessToken);
        }
        if (state?.refreshToken) {
          localStorage.setItem('refresh_token', state.refreshToken);
        }
      },
    }
  )
);