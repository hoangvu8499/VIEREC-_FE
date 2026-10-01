export const env = {
  appName: import.meta.env.VITE_APP_NAME || 'VIEREC',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15_000,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
