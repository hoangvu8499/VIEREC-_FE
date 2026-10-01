import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import { ROUTES } from '@/constants/routes'
import ForgotPasswordPage from '@/pages/forgot-password/forgot-password-page'
import { authService } from '@/services/auth-service'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const emailInput = () => screen.getByLabelText(/^Email\s*\*?$/, { selector: 'input' })

describe('ForgotPasswordPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates the email', async () => {
    const user = userEvent.setup()
    const forgotSpy = vi.spyOn(authService, 'forgotPassword')
    renderPage()

    await user.type(emailInput(), 'an@')
    await user.click(screen.getByRole('button', { name: /Gửi liên kết/ }))

    expect(await screen.findByText('Email không đúng định dạng')).toBeInTheDocument()
    expect(forgotSpy).not.toHaveBeenCalled()
  })

  it('sends the request and shows a generic confirmation', async () => {
    const user = userEvent.setup()
    const forgotSpy = vi.spyOn(authService, 'forgotPassword').mockResolvedValue()
    renderPage()

    await user.type(emailInput(), ' an@example.com ')
    await user.click(screen.getByRole('button', { name: /Gửi liên kết/ }))

    expect(await screen.findByText('Đã gửi yêu cầu')).toBeInTheDocument()
    expect(screen.getByText('an@example.com')).toBeInTheDocument()
    expect(forgotSpy.mock.calls[0]?.[0]).toEqual({ email: 'an@example.com' })
    expect(screen.getByRole('link', { name: 'Quay lại đăng nhập' })).toHaveAttribute(
      'href',
      ROUTES.LOGIN,
    )

    await user.click(screen.getByRole('button', { name: /Gửi lại/ }))
    expect(emailInput()).toBeInTheDocument()
  })

  it('shows server errors', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'forgotPassword').mockRejectedValue({ status: 0, message: 'timeout' })
    renderPage()

    await user.type(emailInput(), 'an@example.com')
    await user.click(screen.getByRole('button', { name: /Gửi liên kết/ }))

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText(/Không kết nối được máy chủ/)).toBeInTheDocument()
  })

  it('links back to login and to register', () => {
    renderPage()

    expect(screen.getByRole('link', { name: 'Quay lại đăng nhập' })).toHaveAttribute(
      'href',
      ROUTES.LOGIN,
    )
    expect(screen.getByRole('link', { name: 'Đăng ký ngay' })).toHaveAttribute(
      'href',
      ROUTES.REGISTER,
    )
  })
})
