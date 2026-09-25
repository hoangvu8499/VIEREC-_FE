import axios, { type AxiosError } from 'axios'

import { env } from '@/config/env'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import type { ApiError } from '@/types/api'
import { storage } from '@/utils/storage'

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const apiError: ApiError = {
      status: error.response?.status ?? 0,
      message: error.response?.data?.message ?? error.message,
      details: error.response?.data,
    }

    if (apiError.status === 401) {
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
    }

    return Promise.reject(apiError)
  },
)
