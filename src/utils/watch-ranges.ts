/** Các đoạn đã xem `[giây bắt đầu, giây kết thúc]`, đã sắp xếp và không chồng nhau. */
export type WatchRanges = [number, number][]

/** Thêm một đoạn rồi gộp các đoạn chồng / liền nhau: xem lại một đoạn không làm tăng thời lượng đã xem. */
export function addWatchRange(ranges: WatchRanges, start: number, end: number): WatchRanges {
  if (!(end > start)) return ranges
  const merged: WatchRanges = []
  let next: [number, number] = [start, end]
  for (const range of ranges) {
    if (range[1] < next[0]) merged.push(range)
    else if (range[0] > next[1]) {
      merged.push(next)
      next = range
    } else next = [Math.min(range[0], next[0]), Math.max(range[1], next[1])]
  }
  merged.push(next)
  return merged
}

export function watchedSeconds(ranges: WatchRanges): number {
  return ranges.reduce((total, [start, end]) => total + (end - start), 0)
}

/**
 * Hai lần đọc `currentTime` liên tiếp chỉ tính là đã xem khi video chạy tới bình thường (kể cả tua nhanh 2x giữa hai
 * lần đọc cách nhau ~1 giây). Kéo thanh tua thì bỏ qua.
 */
export const MAX_PLAYBACK_STEP_SECONDS = 2.5

export function isPlaybackStep(from: number, to: number): boolean {
  return to > from && to - from <= MAX_PLAYBACK_STEP_SECONDS
}
