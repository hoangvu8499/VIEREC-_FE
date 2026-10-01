import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { learnPath, LEARNER_ROUTES } from '@/constants/routes'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import LearnPage from '@/pages/learner/learn-page'
import { courseService } from '@/services/course-service'
import { useAuthStore } from '@/stores/auth-store'
import { COURSE_DETAIL_FIXTURE, USER_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { EnrollmentStatus } from '@/types/course'
import { storage } from '@/utils/storage'

const PROGRESS_KEY = `${STORAGE_KEYS.WATCH_PROGRESS}.${USER_FIXTURE.id}.${COURSE_DETAIL_FIXTURE.id}`
/** Video upload của bài 1 (bài 2 chỉ có link YouTube không hợp lệ → mở ở trang ngoài). */
const UPLOADED_VIDEO_KEY = 'lesson-11:file-2'

function renderPage(status: EnrollmentStatus | null, search = '') {
  vi.spyOn(courseService, 'get').mockResolvedValue({
    ...COURSE_DETAIL_FIXTURE,
    myEnrollmentStatus: status,
  })
  return renderRoutes(
    [{ path: LEARNER_ROUTES.LEARN, element: <LearnPage /> }],
    learnPath(COURSE_DETAIL_FIXTURE.id) + search,
  )
}

describe('LearnPage (vào học)', () => {
  beforeEach(() => useAuthStore.getState().setUser(USER_FIXTURE))

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    useAuthStore.getState().clearSession()
  })

  it('keeps the lessons locked while the payment waits for approval', async () => {
    renderPage('PENDING')

    expect(await screen.findByText('Khoá học đang chờ duyệt')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /bai-1\.pdf/ })).not.toBeInTheDocument()
  })

  it('sends learners who have not joined to the course page', async () => {
    renderPage(null)

    expect(await screen.findByText('Bạn chưa tham gia khoá học này')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem khoá học và đăng ký' })).toHaveAttribute(
      'href',
      '/khoa-hoc/7',
    )
  })

  it('lets an approved learner download documents and watch videos', async () => {
    const user = userEvent.setup()
    renderPage('ENROLLED')

    const lesson = await screen.findByRole('article', { name: 'Nhận biết nguy cơ cháy nổ' })
    expect(within(lesson).getByRole('link', { name: /bai-1\.pdf/ })).toHaveAttribute(
      'download',
      'bai-1.pdf',
    )
    expect(within(lesson).getByLabelText('Nhận biết nguy cơ cháy nổ')).toBeInstanceOf(
      HTMLVideoElement,
    )

    await user.click(screen.getByRole('button', { name: /Bài tiếp theo/ }))
    const next = screen.getByRole('article', { name: 'Sử dụng bình chữa cháy' })
    expect(within(next).getByRole('link', { name: /Xem video trên youtube\.com/ })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=abc123',
    )
  })

  it('locks the exam until 80% of the video time is watched', async () => {
    storage.set(PROGRESS_KEY, { [UPLOADED_VIDEO_KEY]: { duration: 100, ranges: [[0, 50]] } })
    renderPage('ENROLLED')

    expect(await screen.findByRole('progressbar')).toHaveValue(50)
    expect(screen.getByRole('button', { name: /Thi chứng chỉ/ })).toBeDisabled()
    expect(screen.getByText(/Xem tối thiểu 80% tổng thời lượng video/)).toBeInTheDocument()
  })

  it('enables the exam once enough was watched', async () => {
    const user = userEvent.setup()
    storage.set(PROGRESS_KEY, { [UPLOADED_VIDEO_KEY]: { duration: 100, ranges: [[0, 85]] } })
    renderPage('ENROLLED')

    const exam = await screen.findByRole('button', { name: /Thi chứng chỉ/ })
    expect(exam).toBeEnabled()
    await user.click(exam)
    expect(screen.getByText(/Bài thi chứng chỉ trực tuyến chưa có/)).toBeInTheDocument()
  })
})
