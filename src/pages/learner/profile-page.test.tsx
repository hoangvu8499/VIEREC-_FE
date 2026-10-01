import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LEARNER_ROUTES } from '@/constants/routes'
import ProfilePage from '@/pages/learner/profile-page'
import { authService } from '@/services/auth-service'
import { certificateService } from '@/services/certificate-service'
import { useAuthStore } from '@/stores/auth-store'
import { CERTIFICATE_FIXTURE, pageOf, USER_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'

const field = (label: string) =>
  screen.getByLabelText(new RegExp(`^${label}\\s*\\*?$`), { selector: 'input' })

function renderPage() {
  return renderRoutes(
    [{ path: LEARNER_ROUTES.PROFILE, element: <ProfilePage /> }],
    LEARNER_ROUTES.PROFILE,
  )
}

describe('ProfilePage (góc học viên)', () => {
  beforeEach(() => useAuthStore.getState().setUser(USER_FIXTURE))

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearSession()
  })

  it('shows the profile grouped by topic', () => {
    vi.spyOn(certificateService, 'listMine').mockResolvedValue(pageOf([]))
    useAuthStore.getState().setUser({ ...USER_FIXTURE, roles: ['TRAINEE', 'ADMIN'] })
    renderPage()

    const personal = screen.getByRole('region', { name: 'Thông tin cá nhân' })
    expect(within(personal).getByText('Họ và tên đệm').nextSibling).toHaveTextContent('Nguyễn')
    expect(within(personal).getByText('08/04/1999')).toBeInTheDocument()
    const account = screen.getByRole('region', { name: 'Tài khoản' })
    expect(within(account).getByText('Quản trị viên, Học viên')).toBeInTheDocument()
  })

  it('updates the profile and the signed-in user', async () => {
    const user = userEvent.setup()
    vi.spyOn(certificateService, 'listMine').mockResolvedValue(pageOf([]))
    const update = vi
      .spyOn(authService, 'updateProfile')
      .mockResolvedValue({ ...USER_FIXTURE, address: '1 Lê Lợi, Huế' })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Chỉnh sửa hồ sơ' }))
    await user.clear(field('Địa chỉ'))
    await user.type(field('Địa chỉ'), '  1 Lê Lợi, Huế ')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(await screen.findByText('Đã cập nhật hồ sơ.')).toBeInTheDocument()
    expect(update.mock.calls[0]?.[0]).toMatchObject({
      address: '1 Lê Lợi, Huế',
      cccd: '001099012345',
    })
    expect(useAuthStore.getState().user?.address).toBe('1 Lê Lợi, Huế')
  })

  it('locks the identity fields once a certificate was issued', async () => {
    const user = userEvent.setup()
    vi.spyOn(certificateService, 'listMine').mockResolvedValue(pageOf([CERTIFICATE_FIXTURE]))
    const update = vi.spyOn(authService, 'updateProfile').mockResolvedValue(USER_FIXTURE)
    renderPage()

    await vi.waitFor(() => expect(certificateService.listMine).toHaveBeenCalled())
    await user.click(screen.getByRole('button', { name: 'Chỉnh sửa hồ sơ' }))

    expect(
      await screen.findByText(/họ tên, ngày sinh và CCCD không tự sửa được/),
    ).toBeInTheDocument()
    expect(field('Số CCCD')).toHaveAttribute('readonly')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    await vi.waitFor(() => expect(update).toHaveBeenCalled())
    expect(update.mock.calls[0]?.[0]).not.toHaveProperty('cccd')
    expect(update.mock.calls[0]?.[0]).toHaveProperty('email', USER_FIXTURE.email)
  })

  it('shows a wrong current password next to the field and keeps the session', async () => {
    const user = userEvent.setup()
    vi.spyOn(certificateService, 'listMine').mockResolvedValue(pageOf([]))
    vi.spyOn(authService, 'changePassword').mockRejectedValue({
      status: 401,
      code: 'VRC-401-002',
      message: 'Current password is incorrect',
    })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }))
    await user.type(field('Mật khẩu hiện tại'), 'Sai@12345')
    await user.type(field('Mật khẩu mới'), 'Moi@12345')
    await user.type(field('Nhập lại mật khẩu mới'), 'Moi@12345')
    await user.click(
      within(screen.getByRole('form', { name: 'Đổi mật khẩu' })).getByRole('button', {
        name: 'Đổi mật khẩu',
      }),
    )

    expect(await screen.findByText('Mật khẩu hiện tại không đúng')).toBeInTheDocument()
    expect(field('Mật khẩu hiện tại')).toHaveFocus()
    expect(useAuthStore.getState().user).not.toBeNull()
  })
})
