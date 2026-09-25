import {
  REGISTER_DEFAULT_VALUES,
  registerSchema,
  toRegisterPayload,
  type RegisterFormInput,
} from '@/schemas/user-schema'

const VALID: RegisterFormInput = {
  username: 'nguyenvana',
  firstName: 'An',
  lastName: 'Nguyễn Văn',
  cccd: '001099012345',
  dateOfBirth: '1995-06-15',
  address: '12 Láng Hạ, Đống Đa, Hà Nội',
  phoneNumber: '0912345678',
  email: 'an.nguyen@example.com',
  password: 'Matkhau@123',
  confirmPassword: 'Matkhau@123',
}

/** Lỗi đầu tiên của từng field (giống cách react-hook-form hiển thị). */
function firstErrors(input: RegisterFormInput): Record<string, string> {
  const result = registerSchema.safeParse(input)
  if (result.success) return {}
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.')
    errors[key] ??= issue.message
  }
  return errors
}

describe('registerSchema', () => {
  it('accepts valid input', () => {
    expect(registerSchema.safeParse(VALID).success).toBe(true)
  })

  it('requires every field', () => {
    const errors = firstErrors(REGISTER_DEFAULT_VALUES)

    expect(Object.keys(errors).sort()).toEqual(Object.keys(REGISTER_DEFAULT_VALUES).sort())
    expect(errors.username).toBe('Vui lòng nhập tên đăng nhập')
    expect(errors.cccd).toBe('Vui lòng nhập số CCCD')
    expect(errors.email).toBe('Vui lòng nhập email')
    expect(errors.password).toBe('Vui lòng nhập mật khẩu')
    expect(errors.confirmPassword).toBe('Vui lòng nhập lại mật khẩu')
  })

  it('treats whitespace-only text as empty', () => {
    expect(firstErrors({ ...VALID, address: '   ' }).address).toBe('Vui lòng nhập địa chỉ')
  })

  it.each(['00109901234', '0010990123456', '00109901234a', '001 99012345'])(
    'rejects CCCD %s',
    (cccd) => {
      expect(firstErrors({ ...VALID, cccd }).cccd).toBe('Số CCCD phải gồm đúng 12 chữ số')
    },
  )

  it.each(['091234567', '09123456789', '09123-45678', '+84912345'])('rejects phone %s', (phone) => {
    expect(firstErrors({ ...VALID, phoneNumber: phone }).phoneNumber).toBe(
      'Số điện thoại phải gồm đúng 10 chữ số',
    )
  })

  it.each(['an.nguyen', 'an@', '@example.com', 'an nguyen@example.com'])(
    'rejects email %s',
    (email) => {
      expect(firstErrors({ ...VALID, email }).email).toBe('Email không đúng định dạng')
    },
  )

  it('rejects short password', () => {
    expect(firstErrors({ ...VALID, password: 'Ab@1', confirmPassword: 'Ab@1' }).password).toBe(
      'Mật khẩu phải có ít nhất 8 ký tự',
    )
  })

  it('rejects password without special character', () => {
    const password = 'Matkhau123'
    expect(firstErrors({ ...VALID, password, confirmPassword: password }).password).toMatch(
      /ký tự đặc biệt/,
    )
  })

  it('rejects mismatched confirmation even when other fields are invalid', () => {
    const errors = firstErrors({ ...VALID, username: '', confirmPassword: 'Khac@1234' })

    expect(errors.confirmPassword).toBe('Mật khẩu nhập lại không khớp')
    expect(errors.username).toBeDefined()
  })

  it('rejects future or impossible birth dates', () => {
    expect(firstErrors({ ...VALID, dateOfBirth: '2999-01-01' }).dateOfBirth).toBe(
      'Ngày sinh không hợp lệ',
    )
    expect(firstErrors({ ...VALID, dateOfBirth: '2001-02-30' }).dateOfBirth).toBe(
      'Ngày sinh không hợp lệ',
    )
  })

  it('maps form values to snake_case payload with trimmed text', () => {
    const values = registerSchema.parse({ ...VALID, username: '  nguyenvana  ' })

    expect(toRegisterPayload(values)).toEqual({
      username: 'nguyenvana',
      password: 'Matkhau@123',
      first_name: 'An',
      last_name: 'Nguyễn Văn',
      cccd: '001099012345',
      date_of_birth: '1995-06-15',
      address: '12 Láng Hạ, Đống Đa, Hà Nội',
      phone_number: '0912345678',
      email: 'an.nguyen@example.com',
    })
  })
})
