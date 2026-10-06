import { describe, expect, it } from 'vitest'

import { learnerOrganization } from '@/utils/learner-organization'

describe('learnerOrganization', () => {
  it('trả tên doanh nghiệp khi học viên thuộc doanh nghiệp', () => {
    expect(learnerOrganization('Công ty Môi trường Xanh')).toBe('Công ty Môi trường Xanh')
  })

  it('mặc định là cá nhân học tập khi không có doanh nghiệp', () => {
    expect(learnerOrganization(null)).toBe('Cá nhân học tập')
    expect(learnerOrganization(undefined)).toBe('Cá nhân học tập')
    expect(learnerOrganization('  ')).toBe('Cá nhân học tập')
  })
})
