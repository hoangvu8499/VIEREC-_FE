import { hasAnyRole, isAdmin, primaryRoleLabel } from '@/utils/user-roles'

describe('user roles', () => {
  it('detects admin roles', () => {
    expect(isAdmin({ roles: ['SUPER_ADMIN'] })).toBe(true)
    expect(isAdmin({ roles: ['TRAINEE', 'ADMIN'] })).toBe(true)
    expect(isAdmin({ roles: ['TRAINEE'] })).toBe(false)
    expect(isAdmin(null)).toBe(false)
  })

  it('checks any of the given roles', () => {
    expect(hasAnyRole({ roles: ['ADMIN'] }, ['SUPER_ADMIN'])).toBe(false)
  })

  it('labels the highest role', () => {
    expect(primaryRoleLabel({ roles: ['TRAINEE', 'SUPER_ADMIN'] })).toBe('Quản trị cấp cao')
    expect(primaryRoleLabel({ roles: ['TRAINEE'] })).toBe('Học viên')
  })
})
