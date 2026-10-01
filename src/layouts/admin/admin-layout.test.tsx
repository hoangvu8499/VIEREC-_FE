import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'

import { ADMIN_ROUTES, ROUTES } from '@/constants/routes'
import { AdminLayout } from '@/layouts/admin/admin-layout'
import DashboardPage from '@/pages/admin/dashboard/dashboard-page'
import { authService } from '@/services/auth-service'
import { userService } from '@/services/user-service'
import { useAdminUiStore } from '@/stores/admin-ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { USER_FIXTURE } from '@/test/fixtures'
import type { PageResponse } from '@/types/api'
import type { User } from '@/types/user'

const ADMIN: User = { ...USER_FIXTURE, roles: ['SUPER_ADMIN'] }

function page(totalElements: number): PageResponse<User> {
  return {
    content: [],
    page: 0,
    size: 1,
    totalElements,
    totalPages: totalElements,
    first: true,
    last: false,
    empty: false,
  }
}

function renderAdmin(path: string = ADMIN_ROUTES.DASHBOARD) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(
    [
      {
        path: ADMIN_ROUTES.DASHBOARD,
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: ADMIN_ROUTES.COURSES, element: <p>Trang khoá học admin</p> },
        ],
      },
      { path: ROUTES.LOGIN, element: <p>Trang đăng nhập</p> },
    ],
    { initialEntries: [path] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('AdminLayout', () => {
  beforeEach(() => {
    useAuthStore.getState().setUser(ADMIN)
    vi.spyOn(authService, 'me').mockResolvedValue(ADMIN)
    vi.spyOn(userService, 'search').mockImplementation(async (params) =>
      page(params?.status === 'ACTIVE' ? 1180 : 1250),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearSession()
    useAdminUiStore.setState({ sidebarCollapsed: false })
  })

  it('shows the admin menu', () => {
    renderAdmin()

    const menu = screen.getByRole('navigation', { name: 'Quản trị' })
    const labels = within(menu)
      .getAllByRole('link')
      .map((link) => link.textContent)
    expect(labels).toEqual([
      'Tổng quan',
      'Khoá học',
      'Duyệt đăng ký',
      'Điểm hỗ trợ sự cố',
      'Người dùng',
      'Phân quyền',
    ])
    expect(within(menu).getByRole('link', { name: 'Tổng quan' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('shows every menu item, including Phân quyền, to ADMIN as well', () => {
    useAuthStore.getState().setUser({ ...USER_FIXTURE, roles: ['ADMIN'] })
    renderAdmin()

    const menu = screen.getByRole('navigation', { name: 'Quản trị' })
    expect(within(menu).getAllByRole('link')).toHaveLength(6)
    expect(within(menu).getByRole('link', { name: 'Phân quyền' })).toBeInTheDocument()
    expect(screen.getAllByText('Quản trị viên').length).toBeGreaterThan(0)
  })

  it('shows the greeting, role and real account counts', async () => {
    renderAdmin()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Xin chào, Nguyễn Văn A' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Quản trị cấp cao').length).toBeGreaterThan(0)
    expect(await screen.findByText('1.250')).toBeInTheDocument()
    expect(screen.getByText('1.180')).toBeInTheDocument()
  })

  it('navigates from a module card and updates the breadcrumb', async () => {
    const user = userEvent.setup()
    renderAdmin()

    const modules = screen.getByRole('region', { name: 'Phân hệ quản lý' })
    await user.click(within(modules).getByRole('link', { name: /Khoá học/ }))

    expect(screen.getByText('Trang khoá học admin')).toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByText('Khoá học')).toBeInTheDocument()
  })

  it('collapses the sidebar and remembers it', async () => {
    const user = userEvent.setup()
    renderAdmin()

    // Nút thu gọn chỉ hiện ở desktop (jsdom coi như màn hẹp → display: none).
    await user.click(screen.getByLabelText('Thu gọn menu'))

    expect(useAdminUiStore.getState().sidebarCollapsed).toBe(true)
    expect(screen.getByLabelText('Mở rộng menu')).toHaveAttribute('aria-expanded', 'false')
  })

  it('logs out to the login page', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'logout').mockResolvedValue()
    renderAdmin()

    await user.click(screen.getByRole('button', { name: 'Đăng xuất' }))

    expect(await screen.findByText('Trang đăng nhập')).toBeInTheDocument()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('shows a dash when the counts cannot be loaded', async () => {
    vi.mocked(userService.search).mockRejectedValue({ status: 500, message: 'boom' })
    renderAdmin()

    expect(
      await screen.findByText('Không tải được số liệu. Vui lòng tải lại trang sau ít phút.'),
    ).toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(2)
  })
})
