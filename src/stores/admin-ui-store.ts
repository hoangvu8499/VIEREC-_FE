import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '@/constants/storage-keys'

interface AdminUiState {
  /** Sidebar thu gọn chỉ còn icon (desktop). */
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useAdminUiStore = create<AdminUiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: STORAGE_KEYS.ADMIN_UI },
  ),
)
