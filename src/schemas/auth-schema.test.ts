import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from '@/schemas/auth-schema'

function messages(result: { error?: { issues: { message: string }[] } }) {
  return result.error?.issues.map((issue) => issue.message) ?? []
}

describe('loginSchema', () => {
  it('requires username and password', () => {
    expect(messages(loginSchema.safeParse({ username: '  ', password: '' }))).toEqual([
      'Vui lòng nhập tên đăng nhập hoặc email',
      'Vui lòng nhập mật khẩu',
    ])
  })

  it('does not apply password strength rules and keeps password untrimmed', () => {
    const result = loginSchema.parse({ username: ' an ', password: ' short ' })

    expect(result).toEqual({ username: 'an', password: ' short ' })
  })
})

describe('forgotPasswordSchema', () => {
  it('validates email', () => {
    expect(messages(forgotPasswordSchema.safeParse({ email: '' }))).toEqual(['Vui lòng nhập email'])
    expect(messages(forgotPasswordSchema.safeParse({ email: 'an@' }))).toEqual([
      'Email không đúng định dạng',
    ])
    expect(forgotPasswordSchema.safeParse({ email: ' an@example.com ' }).data).toEqual({
      email: 'an@example.com',
    })
  })
})

describe('resetPasswordSchema', () => {
  it('uses registration password rules', () => {
    expect(
      messages(resetPasswordSchema.safeParse({ password: 'Matkhau123', confirmPassword: 'x' })),
    ).toContain('Mật khẩu phải có ít nhất 1 ký tự đặc biệt (vd. ! @ # $ %)')
  })

  it('requires matching confirmation', () => {
    expect(
      messages(
        resetPasswordSchema.safeParse({ password: 'Matkhau@123', confirmPassword: 'Matkhau@124' }),
      ),
    ).toEqual(['Mật khẩu nhập lại không khớp'])
    expect(
      resetPasswordSchema.safeParse({ password: 'Matkhau@123', confirmPassword: 'Matkhau@123' })
        .success,
    ).toBe(true)
  })
})
