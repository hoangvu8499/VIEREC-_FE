import { userFullName, userInitials } from '@/utils/user-full-name'

describe('userFullName', () => {
  it('puts the family name first', () => {
    expect(userFullName({ lastName: 'Nguyễn', firstName: 'Văn A' })).toBe('Nguyễn Văn A')
  })

  it('trims when a part is empty', () => {
    expect(userFullName({ lastName: '', firstName: 'An' })).toBe('An')
  })
})

describe('userInitials', () => {
  it('takes the first letters of the family and given name', () => {
    expect(userInitials({ lastName: 'Nguyễn', firstName: 'Văn an', username: 'x' })).toBe('NA')
  })

  it('uses one letter for a single-word name', () => {
    expect(userInitials({ lastName: '', firstName: 'Đức', username: 'x' })).toBe('Đ')
  })

  it('falls back to the username', () => {
    expect(userInitials({ lastName: ' ', firstName: '', username: 'hoa' })).toBe('HO')
  })
})
