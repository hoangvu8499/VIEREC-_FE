import { youtubeVideoId } from '@/utils/youtube-video-id'

describe('youtubeVideoId', () => {
  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com/watch?feature=share&v=dQw4w9WgXcQ',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
    'https://youtu.be/dQw4w9WgXcQ?si=abc',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube.com/live/dQw4w9WgXcQ',
  ])('reads the id from %s', (url) => {
    expect(youtubeVideoId(url)).toBe('dQw4w9WgXcQ')
  })

  it.each([
    'https://drive.google.com/file/d/abc/view',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/@kenh',
    'not a url',
  ])('returns null for %s', (url) => {
    expect(youtubeVideoId(url)).toBeNull()
  })
})
