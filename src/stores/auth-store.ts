import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import type { User } from '@/types/user'

interface AuthState {
  /** User đang đăng nhập (null = khách). Token nằm trong cookie HttpOnly, JS không đọc được. */
  user: User | null
  setUser: (user: User) => void
  clearSession: () => void
}

/**
 * Phiên đăng nhập phía UI — lưu `user` vào localStorage để header hiện đúng ngay khi tải lại trang.
 * Tính hợp lệ thật do cookie quyết định: `useSessionSync` gọi `/auth/me` để xác nhận lại.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearSession: () => set({ user: null }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
      // v0 lưu accessToken + user snake_case → bỏ, bắt đăng nhập lại.
      version: 1,
      migrate: () => ({ user: null }),
      partialize: ({ user }) => ({ user }),
    },
  ),
)
