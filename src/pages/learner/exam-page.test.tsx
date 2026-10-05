import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { examPath, LEARNER_ROUTES } from '@/constants/routes'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import ExamPage from '@/pages/learner/exam-page'
import { courseService } from '@/services/course-service'
import { myExamService } from '@/services/exam-service'
import { progressService } from '@/services/progress-service'
import { useAuthStore } from '@/stores/auth-store'
import { COURSE_DETAIL_FIXTURE, USER_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { ExamAttemptInProgress, ExamAttemptResult, MyExam } from '@/types/exam'
import { storage } from '@/utils/storage'

const COURSE_ID = COURSE_DETAIL_FIXTURE.id
const PROGRESS_KEY = `${STORAGE_KEYS.WATCH_PROGRESS}.${USER_FIXTURE.id}.${COURSE_ID}`
const WATCHED_ENOUGH = { 'lesson-11:file-2': { duration: 100, ranges: [[0, 85]] } }

const EXAM: MyExam = {
  courseId: COURSE_ID,
  title: 'Bài thi chứng chỉ PCCC',
  durationMinutes: 30,
  passScore: 5,
  questionCount: 2,
  attempt: null,
}

const IN_PROGRESS: ExamAttemptInProgress = {
  id: 5,
  status: 'IN_PROGRESS',
  startedAt: '2026-10-02T09:00:00',
  deadlineAt: '2026-10-02T09:30:00',
  passScore: 5,
  remainingSeconds: 600,
  questions: [
    {
      id: 11,
      content: 'Khi phát hiện rò rỉ khí gas, việc đầu tiên cần làm là gì?',
      optionA: 'Bật đèn để kiểm tra',
      optionB: 'Khoá van gas và mở cửa thông gió',
      optionC: 'Gọi điện thoại ngay trong phòng',
      optionD: 'Tiếp tục nấu ăn',
    },
    {
      id: 12,
      content: 'Bình chữa cháy CO2 dùng cho đám cháy nào?',
      optionA: 'Kim loại',
      optionB: 'Thiết bị điện',
      optionC: 'Gỗ',
      optionD: 'Giấy',
    },
  ],
}

const RESULT: ExamAttemptResult = {
  id: 5,
  status: 'SUBMITTED',
  startedAt: '2026-10-02T09:00:00',
  deadlineAt: '2026-10-02T09:30:00',
  passScore: 5,
  submittedAt: '2026-10-02T09:12:00',
  questionCount: 2,
  correctCount: 1,
  score: 5,
  passed: true,
}

function renderPage(exam: MyExam | { status: number; code: string; message: string }) {
  vi.spyOn(courseService, 'get').mockResolvedValue({
    ...COURSE_DETAIL_FIXTURE,
    myEnrollmentStatus: 'ENROLLED',
  })
  const progress = {
    videoCount: 1,
    unopenedCount: 0,
    totalSeconds: 100,
    watchedSeconds: 0,
    percent: 0,
    examReady: false,
    videos: [],
  }
  vi.spyOn(progressService, 'get').mockResolvedValue(progress)
  vi.spyOn(progressService, 'save').mockResolvedValue(progress)
  const get = vi.spyOn(myExamService, 'get')
  if ('courseId' in exam) get.mockResolvedValue(exam)
  else get.mockRejectedValue(exam)
  return renderRoutes(
    [
      { path: LEARNER_ROUTES.EXAM, element: <ExamPage /> },
      { path: LEARNER_ROUTES.CERTIFICATES, element: <p>Trang chứng chỉ</p> },
    ],
    examPath(COURSE_ID),
  )
}

const question = (number: number) =>
  screen.getByRole('group', { name: new RegExp(`^Câu ${number}\\.`) })

describe('ExamPage (làm bài thi chứng chỉ)', () => {
  beforeEach(() => useAuthStore.getState().setUser(USER_FIXTURE))

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    useAuthStore.getState().clearSession()
  })

  it('shows the rules and starts the exam after a confirmation', async () => {
    const user = userEvent.setup()
    storage.set(PROGRESS_KEY, WATCHED_ENOUGH)
    const start = vi
      .spyOn(myExamService, 'start')
      .mockResolvedValue({ ...EXAM, attempt: IN_PROGRESS })
    renderPage(EXAM)

    expect(await screen.findByRole('heading', { name: 'Bài thi chứng chỉ PCCC' })).toBeVisible()
    expect(screen.getByText('Mỗi học viên chỉ được thi 1 lần.')).toBeInTheDocument()
    expect(screen.getByText('1/2 câu')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Bắt đầu làm bài' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Bắt đầu làm bài?' })
    expect(dialog).toHaveTextContent('Đồng hồ 30 phút sẽ chạy ngay')
    await user.click(within(dialog).getByRole('button', { name: 'Bắt đầu' }))

    expect(start).toHaveBeenCalledWith(COURSE_ID)
    expect(await screen.findByRole('timer', { name: 'Thời gian còn lại' })).toHaveTextContent(
      '10:00',
    )
    expect(question(1)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Về bài học/ })).not.toBeInTheDocument()
  })

  it('keeps the exam locked until enough of the videos was watched', async () => {
    storage.set(PROGRESS_KEY, { 'lesson-11:file-2': { duration: 100, ranges: [[0, 50]] } })
    renderPage(EXAM)

    expect(await screen.findByRole('button', { name: 'Bắt đầu làm bài' })).toBeDisabled()
    expect(screen.getByText(/Bạn cần xem tối thiểu 80% tổng thời lượng video/)).toBeVisible()
  })

  it('submits the chosen answers and shows the score', async () => {
    const user = userEvent.setup()
    const submit = vi.spyOn(myExamService, 'submit').mockResolvedValue({ ...EXAM, attempt: RESULT })
    renderPage({ ...EXAM, attempt: IN_PROGRESS })

    await screen.findByRole('timer')
    await user.click(within(question(1)).getByRole('radio', { name: /^B\. Khoá van gas/ }))
    expect(screen.getByText('1/2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Câu 1, đã trả lời' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Câu 2, chưa trả lời' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Nộp bài' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Nộp bài?' })
    expect(dialog).toHaveTextContent('Bạn còn 1 câu chưa trả lời')
    await user.click(within(dialog).getByRole('button', { name: 'Nộp bài' }))

    expect(submit).toHaveBeenCalledWith(COURSE_ID, { 11: 'B' })
    expect(await screen.findByRole('heading', { name: 'Chúc mừng, bạn đã thi đạt!' })).toBeVisible()
    expect(screen.getByText('Đạt')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Chứng chỉ của tôi/ })).toHaveAttribute(
      'href',
      LEARNER_ROUTES.CERTIFICATES,
    )
    expect(storage.get(`${STORAGE_KEYS.EXAM_ANSWERS}.${IN_PROGRESS.id}`)).toBeNull()
  })

  it('keeps the chosen answers when the page is reloaded', async () => {
    storage.set(`${STORAGE_KEYS.EXAM_ANSWERS}.${IN_PROGRESS.id}`, { 12: 'B' })
    renderPage({ ...EXAM, attempt: IN_PROGRESS })

    await screen.findByRole('timer')
    expect(within(question(2)).getByRole('radio', { name: /^B\./ })).toBeChecked()
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('submits by itself when the time is up', async () => {
    const user = userEvent.setup()
    const submit = vi
      .spyOn(myExamService, 'submit')
      .mockResolvedValue({ ...EXAM, attempt: { ...RESULT, passed: false, score: 0 } })
    renderPage({ ...EXAM, attempt: { ...IN_PROGRESS, remainingSeconds: 2 } })

    await user.click(
      within(await screen.findByRole('group', { name: /^Câu 2\./ })).getByRole('radio', {
        name: /^B\./,
      }),
    )
    await waitFor(() => expect(submit).toHaveBeenCalledWith(COURSE_ID, { 12: 'B' }), {
      timeout: 4000,
    })
    expect(submit).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('heading', { name: 'Bạn chưa đạt bài thi' })).toBeVisible()
    expect(screen.getByText(/Mỗi học viên chỉ được thi 1 lần/)).toBeInTheDocument()
  })

  it('tells the learner when the course has no exam', async () => {
    renderPage({ status: 404, code: 'VRC-404-701', message: 'This course has no exam yet' })

    expect(await screen.findByText('Khoá học chưa có bài thi chứng chỉ')).toBeInTheDocument()
  })
})
