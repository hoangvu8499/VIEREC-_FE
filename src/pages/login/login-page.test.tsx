import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, type InitialEntry } from 'react-router'

import { ADMIN_ROUTES, LEARNER_ROUTES, ROUTES } from '@/constants/routes'
import LoginPage from '@/pages/login/login-page'
import { getRedirectPath } from '@/pages/login/use-login'
import { authService } from '@/services/auth-service'
import { useAuthStore } from '@/stores/auth-store'
import { USER_FIXTURE } from '@/test/fixtures'
import type { ApiError } from '@/types/api'
import type { AuthSession } from '@/types/user'

const LOGIN_RESULT: AuthSession = { expiresIn: 1800, refreshExpiresIn: 2592000, user: USER_FIXTURE }

function renderPage(initialEntry: InitialEntry = ROUTES.LOGIN) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.HOME} element={<p>Trang chủ</p>} />
          <Route path={ROUTES.COURSES} element={<p>Trang khóa học</p>} />
          <Route path={ADMIN_ROUTES.DASHBOARD} element={<p>Trang quản trị</p>} />
          <Route path={LEARNER_ROUTES.OVERVIEW} element={<p>Góc học viên</p>} />
          <Route path={ROUTES.REGISTER} element={<p>Trang đăng ký</p>} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<p>Trang quên mật khẩu</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const field = (label: string) =>
  screen.getByLabelText(new RegExp(`^${label}\\s*\\*?$`), { selector: 'input' })

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(field('Tên đăng nhập hoặc email'), 'nguyenvana')
  await user.type(field('Mật khẩu'), 'Matkhau@123')
  await user.click(screen.getByRole('button', { name: 'Đăng nhập' }))
}

describe('LoginPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearSession()
  })

  it('links to the register page for users without an account', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByText(/Chưa có tài khoản\?/)).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Đăng ký ngay' }))

    expect(screen.getByText('Trang đăng ký')).toBeInTheDocument()
  })

  it('links to the forgot password page', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('link', { name: 'Quên mật khẩu?' }))

    expect(screen.getByText('Trang quên mật khẩu')).toBeInTheDocument()
  })

  it('shows required errors on empty submit', async () => {
    const user = userEvent.setup()
    const loginSpy = vi.spyOn(authService, 'login')
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }))

    expect(await screen.findByText('Vui lòng nhập tên đăng nhập hoặc email')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập mật khẩu')).toBeInTheDocument()
    expect(field('Tên đăng nhập hoặc email')).toHaveFocus()
    expect(loginSpy).not.toHaveBeenCalled()
  })

  it('logs in, stores the session and opens the learner area', async () => {
    const user = userEvent.setup()
    const loginSpy = vi.spyOn(authService, 'login').mockResolvedValue(LOGIN_RESULT)
    renderPage()

    await fillAndSubmit(user)

    expect(await screen.findByText('Góc học viên')).toBeInTheDocument()
    expect(loginSpy.mock.calls[0]?.[0]).toEqual({ username: 'nguyenvana', password: 'Matkhau@123' })
    expect(useAuthStore.getState().user).toEqual(USER_FIXTURE)
  })

  it.each(['ADMIN', 'SUPER_ADMIN'])('sends %s to the admin dashboard', async (role) => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'login').mockResolvedValue({
      ...LOGIN_RESULT,
      user: { ...USER_FIXTURE, roles: [role] },
    })
    renderPage()

    await fillAndSubmit(user)

    expect(await screen.findByText('Trang quản trị')).toBeInTheDocument()
  })

  it('returns to the page that required login', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'login').mockResolvedValue(LOGIN_RESULT)
    renderPage({ pathname: ROUTES.LOGIN, state: { from: ROUTES.COURSES } })

    await fillAndSubmit(user)

    expect(await screen.findByText('Trang khóa học')).toBeInTheDocument()
  })

  it.each([
    ['VRC-401-002', 401, 'Tên đăng nhập/email hoặc mật khẩu không đúng.'],
    ['VRC-403-001', 403, /Tài khoản đã bị vô hiệu hoá\. Vui lòng liên hệ hotline/],
    ['VRC-401-001', 401, /có thể đã bị khoá/],
  ])('explains login error %s', async (code, status, message) => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'login').mockRejectedValue({
      status,
      code,
      message: 'English message',
    } satisfies ApiError)
    renderPage()

    await fillAndSubmit(user)

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText(message)).toBeInTheDocument()
    expect(useAuthStore.getState().user).toBeNull()
  })
})

describe('getRedirectPath', () => {
  it.each([
    [{ from: '/khoa-hoc' }, '/khoa-hoc'],
    [{ from: '//evil.com' }, '/'],
    [{ from: 'https://evil.com' }, '/'],
    [null, '/'],
  ])('%j -> %s', (state, expected) => {
    expect(getRedirectPath(state, '/')).toBe(expected)
  })
})
