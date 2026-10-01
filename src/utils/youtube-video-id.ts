const ID_PATTERN = /^[\w-]{11}$/

/**
 * Mã video YouTube từ link admin nhập: `watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, `/live/`.
 * Không phải link YouTube (Drive, Vimeo...) trả `null`.
 */
export function youtubeVideoId(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  const host = parsed.hostname.replace(/^(www|m|music)\./, '')
  let id: string | undefined
  if (host === 'youtu.be') {
    id = parsed.pathname.split('/')[1]
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const [, section, value] = parsed.pathname.split('/')
    id =
      section === 'watch'
        ? (parsed.searchParams.get('v') ?? undefined)
        : section && ['embed', 'shorts', 'live', 'v'].includes(section)
          ? value
          : undefined
  }
  return id && ID_PATTERN.test(id) ? id : null
}
