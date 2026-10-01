import { pageItems } from '@/components/common/page-items'

describe('pageItems', () => {
  it('shows every page when there are few', () => {
    expect(pageItems(0, 1)).toEqual([0])
    expect(pageItems(2, 5)).toEqual([0, 1, 2, 3, 4])
  })

  it('collapses long gaps into "gap"', () => {
    expect(pageItems(0, 10)).toEqual([0, 1, 'gap', 9])
    expect(pageItems(5, 10)).toEqual([0, 'gap', 4, 5, 6, 'gap', 9])
    expect(pageItems(9, 10)).toEqual([0, 'gap', 8, 9])
  })

  it('shows the single skipped page instead of a gap', () => {
    // 0 … 2 → hiện luôn 1.
    expect(pageItems(3, 10)).toEqual([0, 1, 2, 3, 4, 'gap', 9])
  })
})
