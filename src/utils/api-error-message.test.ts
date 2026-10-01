import { apiErrorMessage } from '@/utils/api-error-message'

const options = { fallback: 'Có lỗi xảy ra', byStatus: { 401: 'Sai thông tin' } }

describe('apiErrorMessage', () => {
  it('prefers the per-status override', () => {
    expect(apiErrorMessage({ status: 401, message: 'Unauthorized' }, options)).toBe('Sai thông tin')
  })

  it('handles network and server errors', () => {
    expect(apiErrorMessage({ status: 0, message: 'timeout' }, options)).toMatch(/kết nối/)
    expect(apiErrorMessage({ status: 503, message: 'Unavailable' }, options)).toMatch(/sự cố/)
  })

  it('never shows the (English) backend message', () => {
    expect(apiErrorMessage({ status: 409, message: 'Username is already taken' }, options)).toBe(
      'Có lỗi xảy ra',
    )
    expect(apiErrorMessage({ status: 404, message: 'No static resource' }, options)).toMatch(
      /chưa sẵn sàng/,
    )
  })
})
