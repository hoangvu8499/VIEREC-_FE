import { lessonVideos, summarizeProgress } from '@/pages/learner/use-watch-progress'
import { LESSON_FIXTURE } from '@/test/fixtures'

/** Bài 1 có video upload; bài 2 chỉ có tài liệu + link YouTube. */
const LESSONS = [
  LESSON_FIXTURE,
  {
    ...LESSON_FIXTURE,
    id: 12,
    videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
    files: LESSON_FIXTURE.files.filter((file) => file.fileType === 'DOCUMENT'),
  },
]

describe('watch progress', () => {
  const videos = LESSONS.flatMap(lessonVideos)
  const [uploaded, youtube] = videos

  it('tracks uploaded videos and YouTube links, not documents', () => {
    expect(videos.map((video) => video.source.kind)).toEqual(['file', 'youtube'])
    expect(youtube?.source).toEqual({ kind: 'youtube', videoId: 'dQw4w9WgXcQ' })
  })

  it('ignores links that cannot be embedded', () => {
    const lesson = {
      ...LESSON_FIXTURE,
      videoUrl: 'https://drive.google.com/file/d/1/view',
      files: [],
    }
    expect(lessonVideos(lesson)).toEqual([])
  })

  it('needs every video opened and 80% of the total duration watched', () => {
    if (!uploaded || !youtube) throw new Error('fixture')

    const halfOpened = summarizeProgress(videos, {
      [uploaded.key]: { duration: 100, ranges: [[0, 100]] },
    })
    expect(halfOpened).toMatchObject({ unknown: 1, ratio: 1, examReady: false })

    const notEnough = summarizeProgress(videos, {
      [uploaded.key]: { duration: 100, ranges: [[0, 100]] },
      [youtube.key]: { duration: 300, ranges: [[0, 200]] },
    })
    expect(notEnough).toMatchObject({ watched: 300, total: 400, examReady: false })

    const enough = summarizeProgress(videos, {
      [uploaded.key]: { duration: 100, ranges: [[0, 100]] },
      [youtube.key]: { duration: 300, ranges: [[0, 220]] },
    })
    expect(enough).toMatchObject({ ratio: 0.8, examReady: true })
  })

  it('does not block a course without videos', () => {
    expect(summarizeProgress([], {}).examReady).toBe(true)
  })
})
