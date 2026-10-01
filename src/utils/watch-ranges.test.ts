import { addWatchRange, isPlaybackStep, watchedSeconds } from '@/utils/watch-ranges'

describe('watch ranges', () => {
  it('merges overlapping and touching ranges', () => {
    let ranges = addWatchRange([], 10, 20)
    ranges = addWatchRange(ranges, 30, 40)
    ranges = addWatchRange(ranges, 0, 5)
    expect(ranges).toEqual([
      [0, 5],
      [10, 20],
      [30, 40],
    ])

    ranges = addWatchRange(ranges, 18, 30)
    expect(ranges).toEqual([
      [0, 5],
      [10, 40],
    ])
    expect(watchedSeconds(ranges)).toBe(35)
  })

  it('does not count a rewatched part twice', () => {
    const ranges = addWatchRange(addWatchRange([], 0, 60), 10, 20)
    expect(watchedSeconds(ranges)).toBe(60)
  })

  it('ignores empty ranges', () => {
    expect(addWatchRange([], 5, 5)).toEqual([])
  })

  it('treats seeking as not watched', () => {
    expect(isPlaybackStep(10, 11)).toBe(true)
    expect(isPlaybackStep(10, 12)).toBe(true)
    expect(isPlaybackStep(10, 300)).toBe(false)
    expect(isPlaybackStep(10, 5)).toBe(false)
  })
})
