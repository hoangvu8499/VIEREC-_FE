import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import RegisterPage from '@/pages/register/register-page'
import { authService } from '@/services/auth-service'
import { USER_FIXTURE } from '@/test/fixtures'
import type { ApiError } from '@/types/api'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

/** Input theo nhãn chính xác (label có thêm dấu `*` với field bắt buộc). */
const field = (label: string) =>
  screen.getByLabelText(new RegExp(`^${label}\\s*\\*?$`), { selector: 'input' })

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(field('Họ và tên đệm'), 'Nguyễn Văn')
  await user.type(field('Tên'), 'An')
  await user.type(field('Ngày sinh'), '1995-06-15')
  await user.type(field('Số CCCD'), '001099012345')
  await user.type(field('Số điện thoại'), '0912345678')
  await user.type(field('Email'), 'an@example.com')
  await user.type(field('Địa chỉ'), '12 Láng Hạ, Hà Nội')
  await user.type(field('Tên đăng nhập'), 'nguyenvana')
  await user.type(field('Mật khẩu'), 'Matkhau@123')
  await user.type(field('Nhập lại mật khẩu'), 'Matkhau@123')
}

describe('RegisterPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the certificate notice', () => {
    renderPage()

    expect(screen.getByText(/chứng chỉ cho mỗi học viên là duy nhất/i)).toBeInTheDocument()
  })

  it('shows required errors for every field on empty submit', async () => {
    const user = userEvent.setup()
    const registerSpy = vi.spyOn(authService, 'register')
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Đăng ký' }))

    expect(await screen.findByText('Vui lòng nhập tên đăng nhập')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập số CCCD')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập lại mật khẩu')).toBeInTheDocument()
    expect(document.querySelectorAll('input[aria-invalid="true"]')).toHaveLength(10)
    expect(registerSpy).not.toHaveBeenCalled()
  })

  it('validates a field on blur', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(field('Số CCCD'), '12345')
    await user.tab()

    expect(await screen.findByText('Số CCCD phải gồm đúng 12 chữ số')).toBeInTheDocument()
    expect(field('Số CCCD')).toHaveAttribute('aria-invalid', 'true')
  })

  it('reports mismatched password confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(field('Mật khẩu'), 'Matkhau@123')
    await user.type(field('Nhập lại mật khẩu'), 'Matkhau@124')
    await user.tab()

    expect(await screen.findByText('Mật khẩu nhập lại không khớp')).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderPage()

    const password = field('Mật khẩu')
    expect(password).toHaveAttribute('type', 'password')

    const [toggle] = screen.getAllByRole('button', { name: 'Hiện mật khẩu' })
    await user.click(toggle!)

    expect(password).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ẩn mật khẩu' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('submits camelCase payload and shows success', async () => {
    const user = userEvent.setup()
    const registerSpy = vi.spyOn(authService, 'register').mockResolvedValue(USER_FIXTURE)
    renderPage()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }))

    expect(await screen.findByText('Đăng ký thành công!')).toBeInTheDocument()
    expect(screen.getByText(/Nguyễn Văn A/)).toBeInTheDocument()
    expect(registerSpy.mock.calls[0]?.[0]).toEqual({
      username: 'nguyenvana',
      password: 'Matkhau@123',
      firstName: 'An',
      lastName: 'Nguyễn Văn',
      cccd: '001099012345',
      dateOfBirth: '1995-06-15',
      address: '12 Láng Hạ, Hà Nội',
      phoneNumber: '0912345678',
      email: 'an@example.com',
    })
  })

  it('shows a duplicate (409) error under the matching field and focuses it', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'register').mockRejectedValue({
      status: 409,
      code: 'VRC-409-104',
      message: 'CCCD is already registered',
    } satisfies ApiError)
    renderPage()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }))

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText(/Số CCCD này đã được đăng ký\./)).toBeInTheDocument()
    expect(field('Số CCCD')).toHaveAttribute('aria-invalid', 'true')
    expect(field('Số CCCD')).toHaveAccessibleDescription('Số CCCD này đã được đăng ký')
    expect(field('Số CCCD')).toHaveFocus()
  })

  it('shows backend validation (400) errors under each field', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'register').mockRejectedValue({
      status: 400,
      code: 'VRC-400-001',
      message: 'Validation failed',
      fieldErrors: [
        { field: 'email', message: 'Email format is invalid (expected name@domain.com)' },
        { field: 'phoneNumber', message: 'Phone number must be exactly 10 digits' },
      ],
    } satisfies ApiError)
    renderPage()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }))

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText(/kiểm tra lại các ô được đánh dấu/)).toBeInTheDocument()
    expect(field('Email')).toHaveAccessibleDescription('Email không đúng định dạng')
    expect(field('Số điện thoại')).toHaveAccessibleDescription(
      'Số điện thoại phải gồm đúng 10 chữ số',
    )
    // Focus ô lỗi đầu tiên theo thứ tự trên form, không theo thứ tự backend trả về.
    expect(field('Số điện thoại')).toHaveFocus()
  })

  it('clears a server error once the field is edited', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'register').mockRejectedValue({
      status: 409,
      code: 'VRC-409-101',
      message: 'Username is already taken',
    } satisfies ApiError)
    renderPage()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }))
    await screen.findByRole('alert')
    expect(field('Tên đăng nhập')).toHaveAttribute('aria-invalid', 'true')

    await user.type(field('Tên đăng nhập'), '2')
    await user.tab()

    expect(field('Tên đăng nhập')).not.toHaveAttribute('aria-invalid')
  })

  it('shows a generic message when the server is unreachable', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'register').mockRejectedValue({
      status: 0,
      message: 'Network Error',
    } satisfies ApiError)
    renderPage()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }))

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText(/Không kết nối được máy chủ/)).toBeInTheDocument()
  })
})
