import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ADMIN_ROUTES, adminUserPath } from '@/constants/routes'
import { userService } from '@/services/user-service'
import { useAuthStore } from '@/stores/auth-store'
import { USER_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { User } from '@/types/user'
import UserEditPage from '@/pages/admin/users/user-edit-page'

const SUPER: User = {
  ...USER_FIXTURE,
  id: 100,
  username: 'boss',
  firstName: 'Tổng',
  lastName: 'Quản Trị',
  roles: ['SUPER_ADMIN'],
}
const TRAINEE: User = {
  ...USER_FIXTURE,
  id: 5,
  username: 'hocvien',
  firstName: 'Bình',
  lastName: 'Trần',
}

function renderPage(id = TRAINEE.id) {
  return renderRoutes(
    [
      { path: ADMIN_ROUTES.USER_EDIT, element: <UserEditPage /> },
      { path: ADMIN_ROUTES.USER_DETAIL, element: <p>Trang chi tiết tài khoản</p> },
    ],
    adminUserPath('USER_EDIT', id),
  )
}

describe('UserEditPage', () => {
  beforeEach(() => {
    vi.spyOn(userService, 'get').mockImplementation(
      async (id) => [SUPER, TRAINEE].find((item) => item.id === id) ?? TRAINEE,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearSession()
  })

  it('updates the profile and locks the account', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(SUPER)
    const update = vi.spyOn(userService, 'update').mockResolvedValue(TRAINEE)
    renderPage()

    const address = await screen.findByLabelText(/^Địa chỉ\s*\*?$/)
    await user.clear(address)
    await user.type(address, 'Đà Nẵng')
    await user.selectOptions(screen.getByLabelText(/^Trạng thái\s*\*?$/), 'Bị khoá')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(update).toHaveBeenCalledWith(5, {
      firstName: TRAINEE.firstName,
      lastName: TRAINEE.lastName,
      cccd: TRAINEE.cccd,
      dateOfBirth: TRAINEE.dateOfBirth,
      address: 'Đà Nẵng',
      phoneNumber: TRAINEE.phoneNumber,
      email: TRAINEE.email,
      status: 'LOCKED',
    })
    expect(await screen.findByText('Trang chi tiết tài khoản')).toBeInTheDocument()
  })

  it('keeps the own status when editing oneself', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(SUPER)
    const update = vi.spyOn(userService, 'update').mockResolvedValue(SUPER)
    renderPage(SUPER.id)

    expect(
      await screen.findByText(/Bạn không thể tự đổi trạng thái tài khoản của mình/),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText(/^Trạng thái/)).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
    expect(update.mock.calls[0]?.[1]).toMatchObject({ status: 'ACTIVE' })
  })
})
