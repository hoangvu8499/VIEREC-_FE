import { userApiFieldErrors } from '@/schemas/user-api-errors'
import type { ApiError } from '@/types/api'

const validationError = (fieldErrors: ApiError['fieldErrors']): ApiError => ({
  status: 400,
  code: 'VRC-400-001',
  message: 'Validation failed',
  fieldErrors,
})

describe('userApiFieldErrors', () => {
  it('translates known format errors', () => {
    expect(
      userApiFieldErrors(
        validationError([
          {
            field: 'phoneNumber',
            rejectedValue: '091234567',
            message: 'Phone number must be exactly 10 digits',
          },
          { field: 'email', message: 'Email format is invalid (expected name@domain.com)' },
          { field: 'cccd', message: 'CCCD must be exactly 12 digits' },
          {
            field: 'password',
            rejectedValue: '******',
            message: 'Password must contain at least one special character',
          },
        ]),
      ),
    ).toEqual({
      phoneNumber: 'Số điện thoại phải gồm đúng 10 chữ số',
      email: 'Email không đúng định dạng',
      cccd: 'Số CCCD phải gồm đúng 12 chữ số',
      password: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (vd. ! @ # $ %)',
    })
  })

  it('translates required errors', () => {
    expect(
      userApiFieldErrors(
        validationError([
          { field: 'lastName', message: 'Last name is required' },
          { field: 'dateOfBirth', message: 'Date of birth is required' },
        ]),
      ),
    ).toEqual({ lastName: 'Vui lòng nhập họ', dateOfBirth: 'Vui lòng chọn ngày sinh' })
  })

  it('keeps unknown messages, first error per field, and ignores unknown fields', () => {
    expect(
      userApiFieldErrors(
        validationError([
          { field: 'password', message: 'Password must be at most 72 characters' },
          { field: 'password', message: 'Password is required' },
          { field: 'nickname', message: 'Unknown field' },
        ]),
      ),
    ).toEqual({ password: 'Password must be at most 72 characters' })
  })

  it.each([
    ['VRC-409-101', { username: 'Tên đăng nhập đã được sử dụng' }],
    ['VRC-409-102', { email: 'Email này đã được đăng ký' }],
    ['VRC-409-103', { phoneNumber: 'Số điện thoại này đã được đăng ký' }],
    ['VRC-409-104', { cccd: 'Số CCCD này đã được đăng ký' }],
  ])('maps conflict %s to its field', (code, expected) => {
    expect(userApiFieldErrors({ status: 409, code, message: 'Conflict' })).toEqual(expected)
  })

  it('returns nothing for errors without fields', () => {
    expect(userApiFieldErrors({ status: 500, message: 'Internal error' })).toEqual({})
  })
})
