import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import { ROUTES } from '@/constants/routes'
import ResetPasswordPage from '@/pages/reset-password/reset-password-page'
import { authService } from '@/services/auth-service'

function renderPage(search = '?token=abc123') {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`${ROUTES.RESET_PASSWORD}${search}`]}>
        <ResetPasswordPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const field = (label: string) =>
  screen.getByLabelText(new RegExp(`^${label}\\s*\\*?$`), { selector: 'input' })

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(field('Mật khẩu mới'), 'Matkhau@123')
  await user.type(field('Nhập lại mật khẩu mới'), 'Matkhau@123')
  await user.click(screen.getByRole('button', { name: 'Đặt lại mật khẩu' }))
}

describe('ResetPasswordPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('asks for a new link when the token is missing', () => {
    renderPage('')

    expect(screen.getByText('Liên kết không hợp lệ')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Yêu cầu liên kết mới' })).toHaveAttribute(
      'href',
      ROUTES.FORGOT_PASSWORD,
    )
    expect(screen.queryByRole('button', { name: 'Đặt lại mật khẩu' })).not.toBeInTheDocument()
  })

  it('validates password rules and confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(field('Mật khẩu mới'), 'Matkhau123')
    await user.type(field('Nhập lại mật khẩu mới'), 'Matkhau@124')
    await user.tab()

    expect(await screen.findByText(/ít nhất 1 ký tự đặc biệt \(vd/)).toBeInTheDocument()
    expect(screen.getByText('Mật khẩu nhập lại không khớp')).toBeInTheDocument()
  })

  it('submits token with the new password', async () => {
    const user = userEvent.setup()
    const resetSpy = vi.spyOn(authService, 'resetPassword').mockResolvedValue()
    renderPage()

    await fillAndSubmit(user)

    expect(await screen.findByText('Đặt lại mật khẩu thành công!')).toBeInTheDocument()
    expect(resetSpy.mock.calls[0]?.[0]).toEqual({ token: 'abc123', password: 'Matkhau@123' })
    expect(screen.getByRole('link', { name: 'Đăng nhập ngay' })).toHaveAttribute(
      'href',
      ROUTES.LOGIN,
    )
  })

  it('explains an expired link', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'resetPassword').mockRejectedValue({ status: 410, message: 'Gone' })
    renderPage()

    await fillAndSubmit(user)

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText(/đã hết hạn/)).toBeInTheDocument()
    expect(within(alert).getByRole('link', { name: 'Yêu cầu liên kết mới' })).toBeInTheDocument()
  })
})
