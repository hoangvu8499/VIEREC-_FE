import { formatDate } from '@/utils/format-date'

describe('formatDate', () => {
  it('formats ISO date as dd/mm/yyyy', () => {
    expect(formatDate('2026-09-20')).toBe('20/09/2026')
  })

  it('accepts ISO datetime', () => {
    expect(formatDate('2026-01-05T10:00:00Z')).toBe('05/01/2026')
  })

  it('returns input when invalid', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})
