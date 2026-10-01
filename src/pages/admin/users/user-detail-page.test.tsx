import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ADMIN_ROUTES, adminUserPath } from '@/constants/routes'
import { roleService } from '@/services/role-service'
import { userService } from '@/services/user-service'
import { useAuthStore } from '@/stores/auth-store'
import { USER_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { Role, User } from '@/types/user'
import UserDetailPage from '@/pages/admin/users/user-detail-page'

const ROLES: Role[] = [
  { id: 3, code: 'TRAINEE', name: 'Trainee', description: 'Học viên' },
  { id: 1, code: 'SUPER_ADMIN', name: 'Super Admin', description: 'Toàn quyền hệ thống' },
  { id: 2, code: 'ADMIN', name: 'Admin', description: 'Quản trị viên' },
]

const SUPER: User = {
  ...USER_FIXTURE,
  id: 100,
  username: 'boss',
  firstName: 'Tổng',
  lastName: 'Quản Trị',
  roles: ['SUPER_ADMIN'],
}
const ADMIN: User = { ...USER_FIXTURE, id: 101, username: 'admin1', roles: ['ADMIN'] }
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
      { path: ADMIN_ROUTES.USER_DETAIL, element: <UserDetailPage /> },
      { path: ADMIN_ROUTES.USERS, element: <p>Danh sách người dùng</p> },
    ],
    adminUserPath('USER_DETAIL', id),
  )
}

describe('UserDetailPage', () => {
  beforeEach(() => {
    vi.spyOn(roleService, 'list').mockResolvedValue(ROLES)
    vi.spyOn(userService, 'get').mockImplementation(
      async (id) => [SUPER, ADMIN, TRAINEE].find((item) => item.id === id) ?? TRAINEE,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearSession()
  })

  it('shows the profile and saves new roles', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(SUPER)
    const assign = vi
      .spyOn(userService, 'assignRoles')
      .mockResolvedValue({ ...TRAINEE, roles: ['TRAINEE', 'ADMIN'] })
    renderPage()

    expect(await screen.findByRole('heading', { level: 1, name: 'Trần Bình' })).toBeInTheDocument()
    expect(screen.getByText(TRAINEE.email)).toBeInTheDocument()

    const save = screen.getByRole('button', { name: 'Lưu vai trò' })
    expect(save).toBeDisabled()
    await user.click(await screen.findByLabelText('Quản trị viên'))
    vi.mocked(userService.get).mockResolvedValue({ ...TRAINEE, roles: ['TRAINEE', 'ADMIN'] })
    await user.click(save)

    expect(assign).toHaveBeenCalledWith(5, ['TRAINEE', 'ADMIN'])
  })

  it('does not let users change their own roles', async () => {
    useAuthStore.getState().setUser(TRAINEE)
    renderPage()

    expect(
      await screen.findByText('Bạn không thể tự thay đổi vai trò của chính mình.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Lưu vai trò' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Xoá' })).toBeNull()
  })

  it('explains a role change refused by the server', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(SUPER)
    vi.spyOn(userService, 'assignRoles').mockRejectedValue({
      status: 403,
      code: 'VRC-403-101',
      message: 'Only a SUPER_ADMIN can grant',
    })
    renderPage()

    await user.click(await screen.findByLabelText('Quản trị viên'))
    await user.click(screen.getByRole('button', { name: 'Lưu vai trò' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Chỉ Quản trị cấp cao mới được cấp, gỡ hoặc thay đổi quyền Quản trị cấp cao.',
    )
  })

  it('deletes the account and returns to the list', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(SUPER)
    const remove = vi.spyOn(userService, 'remove').mockResolvedValue()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Xoá' }))
    await user.click(screen.getByRole('button', { name: 'Xoá tài khoản' }))

    expect(remove).toHaveBeenCalledWith(5)
    expect(await screen.findByText('Danh sách người dùng')).toBeInTheDocument()
  })

  it('reports a missing account', async () => {
    useAuthStore.getState().setUser(SUPER)
    vi.mocked(userService.get).mockRejectedValue({
      status: 404,
      code: 'VRC-404-101',
      message: 'User not found',
    })
    renderPage(999)

    expect(await screen.findByText('Tài khoản không tồn tại hoặc đã bị xoá.')).toBeInTheDocument()
  })
})
