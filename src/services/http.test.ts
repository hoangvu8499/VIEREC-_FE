import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'

import { http, toApiError } from '@/services/http'
import { useAuthStore } from '@/stores/auth-store'
import { USER_FIXTURE } from '@/test/fixtures'
import type { ApiErrorBody } from '@/types/api'

function axiosError(status: number, data: Partial<ApiErrorBody>) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data,
  })
}

describe('toApiError', () => {
  it('maps the backend error body', () => {
    const error = toApiError(
      axiosError(400, {
        success: false,
        code: 'VRC-400-001',
        message: 'Validation failed',
        status: 400,
        traceId: 'c73c2be7691f4c51',
        errors: [
          { field: 'cccd', rejectedValue: '0791', message: 'CCCD must be exactly 12 digits' },
        ],
      }),
    )

    expect(error).toMatchObject({
      status: 400,
      code: 'VRC-400-001',
      message: 'Validation failed',
      traceId: 'c73c2be7691f4c51',
      fieldErrors: [{ field: 'cccd', message: 'CCCD must be exactly 12 digits' }],
    })
  })

  it('treats a missing response as a network error', () => {
    const error = toApiError(new AxiosError('timeout of 15000ms exceeded', 'ECONNABORTED'))

    expect(error).toMatchObject({ status: 0, message: 'timeout of 15000ms exceeded' })
    expect(error.fieldErrors).toBeUndefined()
  })
})

describe('http 401 handling', () => {
  const originalAdapter = http.defaults.adapter
  let calls: string[]

  /** Adapter giả: `handler(url, lầnGọiThứ)` trả `[status, body]`. */
  function mockServer(handler: (url: string, attempt: number) => [number, unknown]) {
    const attempts: Record<string, number> = {}
    http.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      const url = config.url ?? ''
      calls.push(url)
      attempts[url] = (attempts[url] ?? 0) + 1
      const [status, data] = handler(url, attempts[url])
      const response = { status, statusText: '', headers: {}, config, data }
      if (status >= 400) {
        throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, response)
      }
      return response
    }
  }

  beforeEach(() => {
    calls = []
    useAuthStore.getState().setUser(USER_FIXTURE)
  })

  afterEach(() => {
    http.defaults.adapter = originalAdapter
    useAuthStore.getState().clearSession()
  })

  it('refreshes once and retries when the access cookie expired', async () => {
    const refreshedUser = { ...USER_FIXTURE, firstName: 'Mới' }
    mockServer((url, attempt) => {
      if (url === '/auth/refresh') return [200, { data: { user: refreshedUser } }]
      return attempt === 1 ? [401, { code: 'VRC-401-001' }] : [200, { data: 'ok' }]
    })

    const [a, b] = await Promise.all([http.get('/courses'), http.get('/auth/me')])

    expect(a.data).toEqual({ data: 'ok' })
    expect(b.data).toEqual({ data: 'ok' })
    // Hai request 401 đồng thời chỉ gây ra một lần refresh.
    expect(calls.filter((url) => url === '/auth/refresh')).toHaveLength(1)
    expect(useAuthStore.getState().user).toEqual(refreshedUser)
  })

  it('clears the session when refresh fails', async () => {
    mockServer((url) =>
      url === '/auth/refresh' ? [401, { code: 'VRC-401-004' }] : [401, { code: 'VRC-401-001' }],
    )

    await expect(http.get('/auth/me')).rejects.toMatchObject({ status: 401, code: 'VRC-401-001' })
    expect(calls).toEqual(['/auth/me', '/auth/refresh'])
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('does not refresh on a failed login', async () => {
    mockServer(() => [401, { code: 'VRC-401-002' }])

    await expect(http.post('/auth/login', {})).rejects.toMatchObject({ code: 'VRC-401-002' })
    expect(calls).toEqual(['/auth/login'])
  })

  it('keeps the session when the current password is wrong', async () => {
    mockServer(() => [401, { code: 'VRC-401-002' }])

    await expect(http.put('/auth/me/password', {})).rejects.toMatchObject({
      status: 401,
      code: 'VRC-401-002',
    })
    // Không refresh, không đăng xuất.
    expect(calls).toEqual(['/auth/me/password'])
    expect(useAuthStore.getState().user).toEqual(USER_FIXTURE)
  })
})
