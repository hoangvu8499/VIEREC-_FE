import { useCallback, useEffect, useState } from 'react'

import { EXAM_WATCH_RATIO } from '@/constants/course'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import type { Lesson } from '@/types/course'
import { storage } from '@/utils/storage'
import { addWatchRange, watchedSeconds, type WatchRanges } from '@/utils/watch-ranges'
import { youtubeVideoId } from '@/utils/youtube-video-id'

/** Video theo dõi được tiến độ: YouTube nhúng, hoặc file video upload. */
export interface TrackedVideo {
  /** Khoá lưu tiến độ, ổn định giữa các lần tải trang. */
  key: string
  lessonId: number
  source: { kind: 'youtube'; videoId: string } | { kind: 'file'; url: string; name: string }
}

interface VideoProgress {
  /** Giây; 0 khi chưa mở video lần nào (chưa biết thời lượng). */
  duration: number
  ranges: WatchRanges
}

type CourseProgress = Record<string, VideoProgress>

export function lessonVideos(lesson: Lesson): TrackedVideo[] {
  const videos: TrackedVideo[] = []
  const youtubeId = lesson.videoUrl ? youtubeVideoId(lesson.videoUrl) : null
  if (youtubeId) {
    videos.push({
      key: `lesson-${lesson.id}:youtube-${youtubeId}`,
      lessonId: lesson.id,
      source: { kind: 'youtube', videoId: youtubeId },
    })
  }
  for (const file of lesson.files) {
    if (file.fileType !== 'VIDEO') continue
    videos.push({
      key: `lesson-${lesson.id}:file-${file.fileId}`,
      lessonId: lesson.id,
      source: { kind: 'file', url: file.url, name: file.originalName },
    })
  }
  return videos
}

export interface ProgressSummary {
  watched: number
  /** Tổng thời lượng các video đã biết thời lượng. */
  total: number
  /** Số video chưa mở lần nào nên chưa biết thời lượng. */
  unknown: number
  /** 0–1, tính trên các video đã biết thời lượng. */
  ratio: number
  /** Đủ điều kiện thi: mọi video đã biết thời lượng và đã xem ≥ `EXAM_WATCH_RATIO` tổng thời lượng. */
  examReady: boolean
}

export function summarizeProgress(
  videos: TrackedVideo[],
  progress: CourseProgress,
): ProgressSummary {
  let watched = 0
  let total = 0
  let unknown = 0
  for (const video of videos) {
    const entry = progress[video.key]
    if (!entry?.duration) {
      unknown += 1
      continue
    }
    total += entry.duration
    watched += Math.min(watchedSeconds(entry.ranges), entry.duration)
  }
  const ratio = total > 0 ? watched / total : 0
  return {
    watched,
    total,
    unknown,
    ratio,
    // Khoá không có video nào để xem thì không chặn.
    examReady: videos.length === 0 || (unknown === 0 && ratio >= EXAM_WATCH_RATIO),
  }
}

/**
 * Tiến độ xem video của một học viên trong một khoá.
 * ⚠️ Tạm lưu ở localStorage (mất khi đổi trình duyệt, sửa được bằng tay) cho tới khi backend có API tiến độ.
 */
export function useWatchProgress(userId: number, courseId: number) {
  const key = `${STORAGE_KEYS.WATCH_PROGRESS}.${userId}.${courseId}`
  const [progress, setProgress] = useState<CourseProgress>(
    () => storage.get<CourseProgress>(key) ?? {},
  )

  useEffect(() => {
    storage.set(key, progress)
  }, [key, progress])

  const reportDuration = useCallback((videoKey: string, duration: number) => {
    if (!(duration > 0)) return
    setProgress((previous) => {
      const entry = previous[videoKey]
      if (entry?.duration === duration) return previous
      return { ...previous, [videoKey]: { duration, ranges: entry?.ranges ?? [] } }
    })
  }, [])

  const reportWatched = useCallback((videoKey: string, from: number, to: number) => {
    setProgress((previous) => {
      const entry = previous[videoKey] ?? { duration: 0, ranges: [] }
      return {
        ...previous,
        [videoKey]: { ...entry, ranges: addWatchRange(entry.ranges, from, to) },
      }
    })
  }, [])

  return { progress, reportDuration, reportWatched }
}
