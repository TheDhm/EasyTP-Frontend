// Centralized, type-safe configuration
const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  },
} as const;

// Validate critical config at startup (dev only)
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  console.warn('[Config] VITE_API_URL not set, using default:', config.api.baseUrl);
}

export default config;