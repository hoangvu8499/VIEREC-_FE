import { screen } from '@testing-library/react'

import { ADMIN_ROUTES } from '@/constants/routes'
import PermissionsPage from '@/pages/admin/permissions/permissions-page'
import { roleService } from '@/services/role-service'
import { renderRoutes } from '@/test/render-routes'

describe('PermissionsPage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('lists the roles from the API, highest first', async () => {
    vi.spyOn(roleService, 'list').mockResolvedValue([
      { id: 3, code: 'TRAINEE', name: 'Trainee', description: 'Học viên' },
      { id: 1, code: 'SUPER_ADMIN', name: 'Super Admin', description: 'Toàn quyền hệ thống' },
      { id: 2, code: 'ADMIN', name: 'Admin', description: 'Quản trị viên' },
    ])
    renderRoutes(
      [{ path: ADMIN_ROUTES.PERMISSIONS, element: <PermissionsPage /> }],
      ADMIN_ROUTES.PERMISSIONS,
    )

    const names = (await screen.findAllByRole('heading', { level: 2 })).map((h) => h.textContent)
    expect(names).toEqual(['Quản trị cấp cao', 'Quản trị viên', 'Học viên', 'Quy tắc gán vai trò'])
    expect(screen.getByText('Toàn quyền hệ thống')).toBeInTheDocument()
  })
})
