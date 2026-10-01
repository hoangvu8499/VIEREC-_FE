import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'

import { ADMIN_ROUTES, LEARNER_ROUTES, ROUTES } from '@/constants/routes'
import { SiteHeader } from '@/layouts/user/site-header'
import { authService } from '@/services/auth-service'
import { useAuthStore } from '@/stores/auth-store'
import { USER_FIXTURE } from '@/test/fixtures'

function renderHeader() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[ROUTES.COURSES]}>
        <SiteHeader />
        <Routes>
          <Route path={ROUTES.HOME} element={<p>Trang chủ</p>} />
          <Route path={ROUTES.COURSES} element={<p>Trang khóa học</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('SiteHeader', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearSession()
  })

  it('shows login and register links for guests', () => {
    renderHeader()

    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', ROUTES.LOGIN)
    expect(screen.getByRole('link', { name: 'Đăng ký' })).toHaveAttribute('href', ROUTES.REGISTER)
  })

  it('links a signed-in learner to the learner area only', () => {
    useAuthStore.getState().setUser(USER_FIXTURE)
    renderHeader()

    expect(screen.getByRole('link', { name: 'Góc học viên' })).toHaveAttribute(
      'href',
      LEARNER_ROUTES.OVERVIEW,
    )
    expect(screen.queryByRole('link', { name: 'Quản trị' })).not.toBeInTheDocument()
  })

  it('also links admins to the admin area', () => {
    useAuthStore.getState().setUser({ ...USER_FIXTURE, roles: ['ADMIN'] })
    renderHeader()

    expect(screen.getByRole('link', { name: 'Góc học viên' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Quản trị' })).toHaveAttribute(
      'href',
      ADMIN_ROUTES.DASHBOARD,
    )
  })

  it('logs out through the API, clears the session and goes home', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(USER_FIXTURE)
    const logoutSpy = vi.spyOn(authService, 'logout').mockResolvedValue()
    renderHeader()

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Đăng xuất' }))

    expect(await screen.findByText('Trang chủ')).toBeInTheDocument()
    expect(logoutSpy).toHaveBeenCalledOnce()
    expect(useAuthStore.getState().user).toBeNull()
    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toBeInTheDocument()
  })

  it('still clears the local session when the logout request fails', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(USER_FIXTURE)
    vi.spyOn(authService, 'logout').mockRejectedValue({ status: 0, message: 'Network Error' })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    renderHeader()

    await user.click(screen.getByRole('button', { name: 'Đăng xuất' }))

    expect(await screen.findByText('Trang chủ')).toBeInTheDocument()
    expect(useAuthStore.getState().user).toBeNull()
    expect(warn).toHaveBeenCalled()
  })
})
