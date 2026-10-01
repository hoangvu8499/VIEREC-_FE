import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ADMIN_ROUTES } from '@/constants/routes'
import { roleService } from '@/services/role-service'
import { userService } from '@/services/user-service'
import { useAuthStore } from '@/stores/auth-store'
import { USER_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { Role, User } from '@/types/user'
import UserCreatePage from '@/pages/admin/users/user-create-page'
import { USER_FIELD_MESSAGES } from '@/schemas/user-schema'

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

function renderPage() {
  return renderRoutes(
    [
      { path: ADMIN_ROUTES.USER_CREATE, element: <UserCreatePage /> },
      { path: ADMIN_ROUTES.USER_DETAIL, element: <p>Trang chi tiết tài khoản</p> },
    ],
    ADMIN_ROUTES.USER_CREATE,
  )
}

const label = (text: string) => new RegExp(`^${text}\\s*\\*?$`)

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(label('Họ và tên đệm')), 'Trần')
  await user.type(screen.getByLabelText(label('Tên')), 'Bình')
  await user.type(screen.getByLabelText(label('Ngày sinh')), '2000-01-02')
  await user.type(screen.getByLabelText(label('Số CCCD')), '001200000001')
  await user.type(screen.getByLabelText(label('Số điện thoại')), '0912000001')
  await user.type(screen.getByLabelText(label('Email')), 'binh@example.com')
  await user.type(screen.getByLabelText(label('Địa chỉ')), 'Hà Nội')
  await user.type(screen.getByLabelText(label('Tên đăng nhập')), 'tranbinh')
  await user.type(screen.getByLabelText(label('Mật khẩu')), 'Abc@1234')
  await user.type(screen.getByLabelText(label('Nhập lại mật khẩu')), 'Abc@1234')
}

describe('UserCreatePage', () => {
  beforeEach(() => {
    vi.spyOn(roleService, 'list').mockResolvedValue(ROLES)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearSession()
  })

  it('creates an account with the chosen roles and status', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(SUPER)
    const create = vi.spyOn(userService, 'create').mockResolvedValue(TRAINEE)
    renderPage()

    await screen.findByLabelText('Quản trị viên')
    await fill(user)
    await user.click(screen.getByLabelText('Quản trị viên'))
    await user.selectOptions(screen.getByLabelText(label('Trạng thái')), 'Ngưng hoạt động')
    await user.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))

    expect(create).toHaveBeenCalledWith({
      lastName: 'Trần',
      firstName: 'Bình',
      dateOfBirth: '2000-01-02',
      cccd: '001200000001',
      phoneNumber: '0912000001',
      email: 'binh@example.com',
      address: 'Hà Nội',
      username: 'tranbinh',
      password: 'Abc@1234',
      roles: ['TRAINEE', 'ADMIN'],
      status: 'INACTIVE',
    })
    expect(await screen.findByText('Trang chi tiết tài khoản')).toBeInTheDocument()
  })

  it('requires at least one role', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(SUPER)
    const create = vi.spyOn(userService, 'create')
    renderPage()

    await user.click(await screen.findByLabelText('Học viên'))
    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))

    expect(await screen.findByText(USER_FIELD_MESSAGES.roles.required)).toBeInTheDocument()
    expect(create).not.toHaveBeenCalled()
  })

  it('does not let an admin grant the super admin role', async () => {
    useAuthStore.getState().setUser(ADMIN)
    renderPage()

    expect(await screen.findByLabelText('Quản trị cấp cao')).toBeDisabled()
    expect(screen.getByLabelText('Quản trị viên')).toBeEnabled()
  })

  it('shows a duplicate email under the email field', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(SUPER)
    vi.spyOn(userService, 'create').mockRejectedValue({
      status: 409,
      code: 'VRC-409-102',
      message: 'Email is already registered',
    })
    renderPage()

    await screen.findByLabelText('Quản trị viên')
    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(USER_FIELD_MESSAGES.email.taken)
    expect(screen.getByLabelText(label('Email'))).toHaveFocus()
  })
})
