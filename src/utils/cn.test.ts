import { cn } from '@/utils/cn'

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', false, 'b', null, undefined, 'c')).toBe('a b c')
  })
})
