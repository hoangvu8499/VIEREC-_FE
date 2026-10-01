import { ExternalLink } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { loadYouTubeApi, type YouTubePlayer } from '@/pages/learner/components/youtube-api'
import type { TrackedVideo } from '@/pages/learner/use-watch-progress'
import { apiFileUrl } from '@/utils/api-file-url'
import { isPlaybackStep } from '@/utils/watch-ranges'

import styles from './lesson-video.module.css'

interface LessonVideoProps {
  video: TrackedVideo
  title: string
  onDuration: (videoKey: string, seconds: number) => void
  onWatched: (videoKey: string, from: number, to: number) => void
}

/** Đọc vị trí phát mỗi giây khi video đang chạy. */
const SAMPLE_INTERVAL_MS = 1000

/** Gộp các lần đọc sát nhau (`timeupdate` bắn ~4 lần/giây) để không ghi tiến độ quá dày. */
const MIN_REPORT_SECONDS = 1

/**
 * Tính đoạn đã xem từ các lần đọc `currentTime` liên tiếp. Tua (kéo thanh thời gian) không tính là đã xem.
 * `sample` trả đoạn `[from, to]` vừa xem, hoặc `null`.
 */
function createWatchTracker() {
  let last: number | null = null
  return {
    start(time: number) {
      last = time
    },
    sample(time: number, force = false): [number, number] | null {
      if (last === null) return null
      if (time >= last && time - last < MIN_REPORT_SECONDS && !force) return null
      const step: [number, number] | null = isPlaybackStep(last, time) ? [last, time] : null
      last = time
      return step
    },
    stop() {
      last = null
    },
  }
}

export function LessonVideo({ video, title, onDuration, onWatched }: LessonVideoProps) {
  // Gọi callback mới nhất mà không tạo lại player.
  const callbacks = useRef({ onDuration, onWatched })
  useEffect(() => {
    callbacks.current = { onDuration, onWatched }
  })

  const reportDuration = (seconds: number) => callbacks.current.onDuration(video.key, seconds)
  const reportWatched = (from: number, to: number) =>
    callbacks.current.onWatched(video.key, from, to)

  return video.source.kind === 'youtube' ? (
    <YouTubeVideo
      videoId={video.source.videoId}
      title={title}
      onDuration={reportDuration}
      onWatched={reportWatched}
    />
  ) : (
    <FileVideo
      url={video.source.url}
      title={title}
      onDuration={reportDuration}
      onWatched={reportWatched}
    />
  )
}

interface PlayerProps {
  title: string
  onDuration: (seconds: number) => void
  onWatched: (from: number, to: number) => void
}

function YouTubeVideo({
  videoId,
  title,
  onDuration,
  onWatched,
}: PlayerProps & { videoId: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const handlers = useRef({ title, onDuration, onWatched })
  useEffect(() => {
    handlers.current = { title, onDuration, onWatched }
  })

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    let player: YouTubePlayer | undefined
    let timer: number | undefined
    const tracker = createWatchTracker()
    const sample = (time: number, force = false) => {
      const step = tracker.sample(time, force)
      if (step) handlers.current.onWatched(...step)
    }

    const stopSampling = () => {
      if (timer === undefined) return
      window.clearInterval(timer)
      timer = undefined
      if (player) sample(player.getCurrentTime(), true)
      tracker.stop()
    }

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return
        // YouTube thay phần tử được truyền vào bằng iframe → dùng phần tử con, không đụng vào node React quản lý.
        const mount = document.createElement('div')
        host.appendChild(mount)
        const created: YouTubePlayer = new YT.Player(mount, {
          videoId,
          host: 'https://www.youtube-nocookie.com',
          playerVars: { rel: 0, playsinline: 1 },
          events: {
            onReady: () => {
              created.getIframe().title = handlers.current.title
              handlers.current.onDuration(created.getDuration())
            },
            onStateChange: ({ data }) => {
              if (data === YT.PlayerState.PLAYING) {
                handlers.current.onDuration(created.getDuration())
                if (timer !== undefined) return
                tracker.start(created.getCurrentTime())
                timer = window.setInterval(
                  () => sample(created.getCurrentTime()),
                  SAMPLE_INTERVAL_MS,
                )
              } else {
                stopSampling()
              }
            },
            onError: () => setFailed(true),
          },
        })
        player = created
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      stopSampling()
      player?.destroy()
      host.replaceChildren()
    }
  }, [videoId])

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`

  return (
    <div className={styles.video}>
      {failed ? (
        <div className={styles.fallback}>
          <p>Không phát được video trong trang (mạng chặn YouTube hoặc video đã bị gỡ).</p>
          <a href={watchUrl} target="_blank" rel="noreferrer">
            Xem trên YouTube <ExternalLink size={14} aria-hidden />
            <span className="sr-only"> (tab mới, không tính tiến độ)</span>
          </a>
        </div>
      ) : (
        <div ref={hostRef} className={styles.frame} />
      )}
    </div>
  )
}

function FileVideo({ url, title, onDuration, onWatched }: PlayerProps & { url: string }) {
  const [tracker] = useState(createWatchTracker)
  const sample = (time: number, force = false) => {
    const step = tracker.sample(time, force)
    if (step) onWatched(...step)
  }

  return (
    <div className={styles.video}>
      <video
        className={styles.frame}
        src={apiFileUrl(url)}
        controls
        preload="metadata"
        controlsList="nodownload"
        aria-label={title}
        onLoadedMetadata={(event) => onDuration(event.currentTarget.duration)}
        onPlay={(event) => tracker.start(event.currentTarget.currentTime)}
        onTimeUpdate={(event) => {
          const time = event.currentTarget.currentTime
          if (!event.currentTarget.paused) sample(time)
        }}
        onSeeking={() => tracker.stop()}
        onSeeked={(event) => tracker.start(event.currentTarget.currentTime)}
        onPause={(event) => {
          sample(event.currentTarget.currentTime, true)
          tracker.stop()
        }}
      >
        <track kind="captions" />
      </video>
    </div>
  )
}
