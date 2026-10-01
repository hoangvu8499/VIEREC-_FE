/** Phần IFrame Player API của YouTube mà trang học dùng (https://developers.google.com/youtube/iframe_api_reference). */
export interface YouTubePlayer {
  getCurrentTime(): number
  getDuration(): number
  getIframe(): HTMLIFrameElement
  destroy(): void
}

interface YouTubePlayerOptions {
  videoId: string
  host?: string
  playerVars?: Record<string, number | string>
  events?: {
    onReady?: () => void
    onStateChange?: (event: { data: number }) => void
    onError?: () => void
  }
}

export interface YouTubeNamespace {
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer
  PlayerState: { PLAYING: number }
}

declare global {
  interface Window {
    YT?: YouTubeNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

const SCRIPT_SRC = 'https://www.youtube.com/iframe_api'
const LOAD_TIMEOUT_MS = 15_000

let loading: Promise<YouTubeNamespace> | undefined

/** Tải script YouTube một lần cho cả trang; bị chặn (mạng, trình chặn quảng cáo) thì reject. */
export function loadYouTubeApi(): Promise<YouTubeNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  loading ??= new Promise<YouTubeNamespace>((resolve, reject) => {
    const fail = () => {
      loading = undefined
      reject(new Error('Không tải được YouTube IFrame API'))
    }
    const timer = window.setTimeout(fail, LOAD_TIMEOUT_MS)
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      window.clearTimeout(timer)
      if (window.YT) resolve(window.YT)
      else fail()
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onerror = () => {
      window.clearTimeout(timer)
      script.remove()
      fail()
    }
    document.head.appendChild(script)
  })
  return loading
}
