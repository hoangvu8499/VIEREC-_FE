import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { examPath, learnPath, LEARNER_ROUTES } from '@/constants/routes'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import LearnPage from '@/pages/learner/learn-page'
import { courseService } from '@/services/course-service'
import { myExamService } from '@/services/exam-service'
import { progressService } from '@/services/progress-service'
import { useAuthStore } from '@/stores/auth-store'
import { COURSE_DETAIL_FIXTURE, USER_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { EnrollmentStatus } from '@/types/course'
import type { MyExam } from '@/types/exam'
import { storage } from '@/utils/storage'

const PROGRESS_KEY = `${STORAGE_KEYS.WATCH_PROGRESS}.${USER_FIXTURE.id}.${COURSE_DETAIL_FIXTURE.id}`
/** Video upload của bài 1 (bài 2 chỉ có link YouTube không hợp lệ → mở ở trang ngoài). */
const UPLOADED_VIDEO_KEY = 'lesson-11:file-2'

const NO_PROGRESS = {
  videoCount: 1,
  unopenedCount: 1,
  totalSeconds: 0,
  watchedSeconds: 0,
  percent: 0,
  examReady: false,
  videos: [],
}

const EXAM: MyExam = {
  courseId: COURSE_DETAIL_FIXTURE.id,
  title: 'Bài thi chứng chỉ',
  durationMinutes: 30,
  passScore: 5,
  questionCount: 20,
  attempt: null,
}

function renderPage(status: EnrollmentStatus | null, search = '', exam: MyExam = EXAM) {
  vi.spyOn(courseService, 'get').mockResolvedValue({
    ...COURSE_DETAIL_FIXTURE,
    myEnrollmentStatus: status,
  })
  vi.spyOn(myExamService, 'get').mockResolvedValue(exam)
  vi.spyOn(progressService, 'get').mockResolvedValue(NO_PROGRESS)
  vi.spyOn(progressService, 'save').mockResolvedValue(NO_PROGRESS)
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

  it('opens the exam once enough was watched', async () => {
    storage.set(PROGRESS_KEY, { [UPLOADED_VIDEO_KEY]: { duration: 100, ranges: [[0, 85]] } })
    renderPage('ENROLLED')

    expect(await screen.findByRole('link', { name: /Thi chứng chỉ/ })).toHaveAttribute(
      'href',
      examPath(COURSE_DETAIL_FIXTURE.id),
    )
  })

  it('shows the exam result instead once the exam was taken', async () => {
    renderPage('ENROLLED', '', {
      ...EXAM,
      attempt: {
        id: 5,
        status: 'SUBMITTED',
        startedAt: '2026-10-02T09:00:00',
        deadlineAt: '2026-10-02T09:30:00',
        passScore: 5,
        submittedAt: '2026-10-02T09:20:00',
        questionCount: 20,
        correctCount: 8,
        score: 4,
        passed: false,
      },
    })

    expect(await screen.findByRole('link', { name: /Xem kết quả thi/ })).toBeInTheDocument()
    expect(screen.getByText(/Điểm thi 4\/10 · Không đạt/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Thi chứng chỉ/ })).not.toBeInTheDocument()
  })

  it('tells the learner when the course has no online exam', async () => {
    storage.set(PROGRESS_KEY, { [UPLOADED_VIDEO_KEY]: { duration: 100, ranges: [[0, 85]] } })
    vi.spyOn(courseService, 'get').mockResolvedValue({
      ...COURSE_DETAIL_FIXTURE,
      myEnrollmentStatus: 'ENROLLED',
    })
    vi.spyOn(myExamService, 'get').mockRejectedValue({ status: 404, code: 'VRC-404-701' })
    vi.spyOn(progressService, 'get').mockResolvedValue(NO_PROGRESS)
    vi.spyOn(progressService, 'save').mockResolvedValue(NO_PROGRESS)
    renderRoutes(
      [{ path: LEARNER_ROUTES.LEARN, element: <LearnPage /> }],
      learnPath(COURSE_DETAIL_FIXTURE.id),
    )

    expect(await screen.findByText(/Khoá học chưa có bài thi trực tuyến/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Thi chứng chỉ/ })).toBeDisabled()
  })

  it('counts the videos watched on another device and uploads what this device watched', async () => {
    storage.set(PROGRESS_KEY, { [UPLOADED_VIDEO_KEY]: { duration: 100, ranges: [[0, 30]] } })
    renderPage('ENROLLED')
    vi.mocked(progressService.get).mockResolvedValue({
      ...NO_PROGRESS,
      videos: [{ lessonId: 11, videoKey: 'file-2', durationSeconds: 100, watchedSeconds: 90 }],
    })

    expect(await screen.findByRole('link', { name: /Thi chứng chỉ/ })).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveValue(90)
    // Máy này xem ít hơn server: không gửi lại.
    expect(progressService.save).not.toHaveBeenCalled()
  })

  it('uploads the progress kept only on this device', async () => {
    storage.set(PROGRESS_KEY, { [UPLOADED_VIDEO_KEY]: { duration: 100, ranges: [[0, 85.4]] } })
    renderPage('ENROLLED')

    await waitFor(() =>
      expect(progressService.save).toHaveBeenCalledWith(COURSE_DETAIL_FIXTURE.id, [
        { lessonId: 11, videoKey: 'file-2', durationSeconds: 100, watchedSeconds: 85 },
      ]),
    )
  })
})
