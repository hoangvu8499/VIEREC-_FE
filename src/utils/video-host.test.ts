import { videoHost } from '@/utils/video-host'

describe('videoHost', () => {
  it('returns the host without www', () => {
    expect(videoHost('https://www.youtube.com/watch?v=1')).toBe('youtube.com')
    expect(videoHost('https://drive.google.com/file/d/x')).toBe('drive.google.com')
  })

  it('returns an empty string for a broken link', () => {
    expect(videoHost('not a url')).toBe('')
  })
})
