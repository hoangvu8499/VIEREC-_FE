import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ADMIN_ROUTES } from '@/constants/routes'
import { roleService } from '@/services/role-service'
import { userService } from '@/services/user-service'
import { useAuthStore } from '@/stores/auth-store'
import { USER_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { PageResponse } from '@/types/api'
import type { Role, User } from '@/types/user'
import UsersPage from '@/pages/admin/users/users-page'

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

function page(content: User[]): PageResponse<User> {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  }
}

function renderPage() {
  return renderRoutes(
    [
      { path: ADMIN_ROUTES.USERS, element: <UsersPage /> },
      { path: ADMIN_ROUTES.USER_DETAIL, element: <p>Chi tiết</p> },
    ],
    ADMIN_ROUTES.USERS,
  )
}

function rowOf(name: string): HTMLElement {
  return screen.getByRole('link', { name }).closest('tr') as HTMLElement
}

describe('UsersPage', () => {
  beforeEach(() => {
    vi.spyOn(userService, 'search').mockResolvedValue(page([SUPER, ADMIN, TRAINEE]))
    vi.spyOn(roleService, 'list').mockResolvedValue(ROLES)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearSession()
  })

  it('lists accounts newest first with roles and status', async () => {
    useAuthStore.getState().setUser(SUPER)
    renderPage()

    expect(await screen.findByRole('link', { name: 'Trần Bình' })).toHaveAttribute(
      'href',
      '/admin/nguoi-dung/5',
    )
    expect(userService.search).toHaveBeenCalledWith({
      page: 0,
      keyword: undefined,
      status: undefined,
      size: 10,
      sort: 'createdAt,desc',
    })
    const row = rowOf('Trần Bình')
    expect(within(row).getByText('Học viên')).toBeInTheDocument()
    expect(within(row).getByText('Đang hoạt động')).toBeInTheDocument()
    // Không tự xoá chính mình.
    expect(within(rowOf('Quản Trị Tổng')).queryByRole('button', { name: /^Xoá/ })).toBeNull()
  })

  it('filters by status', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(SUPER)
    renderPage()

    await screen.findByRole('link', { name: 'Trần Bình' })
    await user.selectOptions(screen.getByLabelText('Trạng thái'), 'Bị khoá')
    expect(userService.search).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'LOCKED' }),
    )
  })

  it('hides edit and delete of a super admin from an admin', async () => {
    useAuthStore.getState().setUser(ADMIN)
    vi.mocked(userService.search).mockResolvedValue(
      page([{ ...SUPER, firstName: 'Cấp Cao', lastName: 'Sếp' }, TRAINEE]),
    )
    renderPage()

    await screen.findByRole('link', { name: 'Sếp Cấp Cao' })
    const superRow = rowOf('Sếp Cấp Cao')
    expect(within(superRow).queryByRole('link', { name: /^Sửa/ })).toBeNull()
    expect(within(superRow).queryByRole('button', { name: /^Xoá/ })).toBeNull()
    expect(within(rowOf('Trần Bình')).getByRole('button', { name: /^Xoá/ })).toBeInTheDocument()
  })

  it('deletes an account after confirmation', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(SUPER)
    const remove = vi.spyOn(userService, 'remove').mockResolvedValue()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Xoá tài khoản Trần Bình' }))
    vi.mocked(userService.search).mockResolvedValue(page([SUPER, ADMIN]))
    await user.click(screen.getByRole('button', { name: 'Xoá tài khoản' }))

    expect(remove).toHaveBeenCalledWith(5)
    expect(await screen.findByText('Đã xoá tài khoản Trần Bình.')).toBeInTheDocument()
  })
})
