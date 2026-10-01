import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'

import { RequireRole } from '@/components/shared/require-role'
import { ADMIN_ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth-store'
import { USER_FIXTURE } from '@/test/fixtures'

function LoginProbe() {
  const location = useLocation()
  return <p>Trang đăng nhập, from={(location.state as { from?: string } | null)?.from}</p>
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <RequireRole roles={ADMIN_ROLES}>
              <p>Nội dung quản trị</p>
            </RequireRole>
          }
        />
        <Route path={ROUTES.LOGIN} element={<LoginProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireRole', () => {
  afterEach(() => useAuthStore.getState().clearSession())

  it('sends guests to login and remembers where they were going', () => {
    renderAt('/admin/nguoi-dung?q=an')

    expect(screen.getByText('Trang đăng nhập, from=/admin/nguoi-dung?q=an')).toBeInTheDocument()
  })

  it('blocks users without the role', () => {
    useAuthStore.getState().setUser({ ...USER_FIXTURE, roles: ['TRAINEE'] })
    renderAt('/admin')

    expect(screen.getByText('Bạn không có quyền truy cập trang này')).toBeInTheDocument()
    expect(screen.queryByText('Nội dung quản trị')).not.toBeInTheDocument()
  })

  it.each(['ADMIN', 'SUPER_ADMIN'])('lets %s in', (role) => {
    useAuthStore.getState().setUser({ ...USER_FIXTURE, roles: [role] })
    renderAt('/admin')

    expect(screen.getByText('Nội dung quản trị')).toBeInTheDocument()
  })
})
