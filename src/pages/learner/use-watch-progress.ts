import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { EXAM_WATCH_RATIO, PROGRESS_QUERY_KEYS } from '@/constants/course'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { progressService, type VideoProgress } from '@/services/progress-service'
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

interface VideoProgressEntry {
  /** Giây; 0 khi chưa mở video lần nào (chưa biết thời lượng). */
  duration: number
  ranges: WatchRanges
}

type CourseProgress = Record<string, VideoProgressEntry>

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

/** Khoá lưu của FE `lesson-<id>:<videoKey>` → video trên server. */
function serverVideo(key: string, entry: VideoProgressEntry): VideoProgress | null {
  const match = /^lesson-(\d+):(.+)$/.exec(key)
  if (!match?.[1] || !match[2]) return null
  const duration = Math.round(entry.duration)
  const watched = Math.round(watchedSeconds(entry.ranges))
  return {
    lessonId: Number(match[1]),
    videoKey: match[2],
    durationSeconds: duration,
    watchedSeconds: duration > 0 ? Math.min(watched, duration) : watched,
  }
}

/** Video máy này xem nhiều hơn server biết (cần gửi lên). */
function changedVideos(
  local: CourseProgress,
  server: VideoProgress[] | undefined,
): VideoProgress[] {
  const known = new Map(
    server?.map((video) => [`lesson-${video.lessonId}:${video.videoKey}`, video]),
  )
  return Object.entries(local).flatMap(([key, entry]) => {
    const video = serverVideo(key, entry)
    if (!video) return []
    const stored = known.get(key)
    const ahead =
      !stored ||
      video.watchedSeconds > stored.watchedSeconds ||
      (video.durationSeconds > 0 && stored.durationSeconds === 0)
    return ahead && (video.durationSeconds > 0 || video.watchedSeconds > 0) ? [video] : []
  })
}

/**
 * Tiến độ để hiển thị: lấy phần lớn hơn giữa máy này và server (học trên máy khác vẫn được tính).
 * Server chỉ có tổng số giây → coi như đã xem từ đầu `[0, watched]`.
 */
function mergeProgress(local: CourseProgress, server: VideoProgress[] | undefined): CourseProgress {
  if (!server?.length) return local
  const merged: CourseProgress = { ...local }
  for (const video of server) {
    const key = `lesson-${video.lessonId}:${video.videoKey}`
    const entry = merged[key]
    const localWatched = entry ? watchedSeconds(entry.ranges) : 0
    merged[key] = {
      duration: entry?.duration || video.durationSeconds,
      ranges:
        entry && localWatched >= video.watchedSeconds ? entry.ranges : [[0, video.watchedSeconds]],
    }
  }
  return merged
}

/** Gửi tiến độ lên server tối đa mỗi chừng này (video phát liên tục báo tiến độ mỗi giây). */
const SYNC_INTERVAL_MS = 15_000

/**
 * Tiến độ xem video của một học viên trong một khoá: ghi từng đoạn đã xem ở localStorage (để gộp đoạn xem lại),
 * đồng bộ tổng số giây lên server (`/courses/{id}/my-progress`) — server dùng để mở bài thi (≥ 80%) và cho
 * doanh nghiệp theo dõi.
 */
export function useWatchProgress(userId: number, courseId: number) {
  const key = `${STORAGE_KEYS.WATCH_PROGRESS}.${userId}.${courseId}`
  const [local, setLocal] = useState<CourseProgress>(() => storage.get<CourseProgress>(key) ?? {})
  const queryClient = useQueryClient()
  const server = useQuery({
    queryKey: PROGRESS_QUERY_KEYS.mine(courseId),
    queryFn: () => progressService.get(courseId),
    // Lỗi (mất mạng...) thì vẫn học tiếp với tiến độ trên máy.
    retry: false,
  })

  useEffect(() => {
    storage.set(key, local)
  }, [key, local])

  // Giá trị mới nhất cho các hàm gửi chạy trong timer / lúc rời trang.
  const latest = useRef({ local, server: server.data?.videos })
  useEffect(() => {
    latest.current = { local, server: server.data?.videos }
  }, [local, server.data])
  const sending = useRef<Promise<void> | null>(null)

  const sync = useCallback((): Promise<void> => {
    if (sending.current) return sending.current
    const videos = changedVideos(latest.current.local, latest.current.server)
    if (videos.length === 0 || !latest.current.server) return Promise.resolve()
    sending.current = progressService
      .save(courseId, videos)
      .then((saved) => {
        latest.current.server = saved.videos
        queryClient.setQueryData(PROGRESS_QUERY_KEYS.mine(courseId), saved)
      })
      .catch(() => undefined)
      .finally(() => {
        sending.current = null
      })
    return sending.current
  }, [courseId, queryClient])

  // Tải xong tiến độ server thì gửi ngay phần máy này có thêm (tiến độ cũ chỉ nằm ở localStorage),
  // sau đó gửi định kỳ và khi rời trang.
  const loaded = server.isSuccess
  useEffect(() => {
    if (!loaded) return
    void sync()
    const timer = window.setInterval(() => void sync(), SYNC_INTERVAL_MS)
    const onHide = () => void sync()
    window.addEventListener('pagehide', onHide)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('pagehide', onHide)
      void sync()
    }
  }, [loaded, sync])

  const reportDuration = useCallback((videoKey: string, duration: number) => {
    if (!(duration > 0)) return
    setLocal((previous) => {
      const entry = previous[videoKey]
      if (entry?.duration === duration) return previous
      return { ...previous, [videoKey]: { duration, ranges: entry?.ranges ?? [] } }
    })
  }, [])

  const reportWatched = useCallback((videoKey: string, from: number, to: number) => {
    setLocal((previous) => {
      const entry = previous[videoKey] ?? { duration: 0, ranges: [] }
      return {
        ...previous,
        [videoKey]: { ...entry, ranges: addWatchRange(entry.ranges, from, to) },
      }
    })
  }, [])

  const progress = useMemo(() => mergeProgress(local, server.data?.videos), [local, server.data])

  return { progress, reportDuration, reportWatched, sync }
}
