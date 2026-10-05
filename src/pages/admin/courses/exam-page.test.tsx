import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ADMIN_ROUTES, adminCoursePath } from '@/constants/routes'
import ExamPage from '@/pages/admin/courses/exam-page'
import { courseService } from '@/services/course-service'
import { examService } from '@/services/exam-service'
import { COURSE_DETAIL_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { Exam, ExamQuestion } from '@/types/exam'

const QUESTION: ExamQuestion = {
  id: 11,
  content: 'Khi phát hiện rò rỉ khí gas, việc đầu tiên cần làm là gì?',
  optionA: 'Bật đèn để kiểm tra',
  optionB: 'Khoá van gas và mở cửa thông gió',
  optionC: 'Gọi điện thoại ngay trong phòng',
  optionD: 'Tiếp tục nấu ăn',
  correctOption: 'B',
  sortOrder: 1,
}

const EXAM: Exam = {
  id: 3,
  courseId: COURSE_DETAIL_FIXTURE.id,
  title: 'Bài thi chứng chỉ',
  durationMinutes: 30,
  passScore: 5,
  questionCount: 2,
  questions: [
    QUESTION,
    { ...QUESTION, id: 12, content: 'Bình chữa cháy CO2 dùng cho đám cháy nào?', sortOrder: 2 },
  ],
  createdAt: '2026-10-02T09:00:00',
  updatedAt: '2026-10-02T09:00:00',
}

const NO_EXAM = { status: 404, code: 'VRC-404-701', message: 'This course has no exam yet' }

function renderPage() {
  return renderRoutes(
    [{ path: ADMIN_ROUTES.COURSE_EXAM, element: <ExamPage /> }],
    adminCoursePath('COURSE_EXAM', COURSE_DETAIL_FIXTURE.id),
  )
}

const label = (text: string) => new RegExp(`^${text}\\s*\\*?$`)

describe('ExamPage (bài thi chứng chỉ)', () => {
  beforeEach(() => {
    vi.spyOn(courseService, 'get').mockResolvedValue(COURSE_DETAIL_FIXTURE)
  })

  afterEach(() => vi.restoreAllMocks())

  it('creates the exam of a course that has none', async () => {
    const user = userEvent.setup()
    vi.spyOn(examService, 'get').mockRejectedValue(NO_EXAM)
    const save = vi
      .spyOn(examService, 'save')
      .mockResolvedValue({ ...EXAM, passScore: 7.5, questionCount: 0, questions: [] })
    renderPage()

    expect(
      await screen.findByRole('heading', { name: 'Khoá học chưa có bài thi chứng chỉ' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: label('Tên bài thi') })).toHaveValue(
      `Bài thi chứng chỉ – ${COURSE_DETAIL_FIXTURE.name}`,
    )
    const passScore = screen.getByRole('textbox', { name: label('Điểm đạt \\(thang 10\\)') })
    await user.clear(passScore)
    await user.type(passScore, '7,5')
    await user.click(screen.getByRole('button', { name: 'Tạo bài thi' }))

    expect(save).toHaveBeenCalledWith(COURSE_DETAIL_FIXTURE.id, {
      title: `Bài thi chứng chỉ – ${COURSE_DETAIL_FIXTURE.name}`,
      durationMinutes: 30,
      passScore: 7.5,
    })
    expect(await screen.findByText(/^Đã tạo bài thi/)).toBeInTheDocument()
    expect(await screen.findByText('Bài thi chưa có câu hỏi')).toBeVisible()
  })

  it('rejects a pass score above 10', async () => {
    const user = userEvent.setup()
    vi.spyOn(examService, 'get').mockRejectedValue(NO_EXAM)
    const save = vi.spyOn(examService, 'save')
    renderPage()

    const passScore = await screen.findByRole('textbox', { name: label('Điểm đạt \\(thang 10\\)') })
    await user.clear(passScore)
    await user.type(passScore, '11')
    await user.click(screen.getByRole('button', { name: 'Tạo bài thi' }))

    expect(screen.getByText(/^Điểm đạt lớn hơn 0, tối đa 10/)).toBeInTheDocument()
    expect(save).not.toHaveBeenCalled()
  })

  it('lists the questions with the correct answer and how the score is counted', async () => {
    vi.spyOn(examService, 'get').mockResolvedValue(EXAM)
    renderPage()

    const answers = await screen.findByRole('list', { name: 'Đáp án câu 1' })
    expect(within(answers).getAllByRole('listitem')).toHaveLength(4)
    expect(within(answers).getByText(/\(đáp án đúng\)/).parentElement).toHaveTextContent(
      'B. Khoá van gas và mở cửa thông gió (đáp án đúng)',
    )
    expect(screen.getByText('Mỗi câu đúng 5 điểm')).toBeInTheDocument()
    expect(screen.getByText('Cần đúng ít nhất 1/2 câu để đạt')).toBeInTheDocument()
    expect(screen.getByText('30 phút')).toBeInTheDocument()
  })

  it('adds a question by hand', async () => {
    const user = userEvent.setup()
    vi.spyOn(examService, 'get').mockResolvedValue(EXAM)
    const add = vi.spyOn(examService, 'addQuestion').mockResolvedValue({ ...QUESTION, id: 13 })
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Thêm câu hỏi' }))
    const dialog = screen.getByRole('dialog', { name: 'Thêm câu hỏi' })
    await user.type(within(dialog).getByRole('textbox', { name: label('Câu hỏi') }), 'Số cứu hoả?')
    for (const [option, text] of [
      ['A', '113'],
      ['B', '114'],
      ['C', '115'],
      ['D', '116'],
    ] as const) {
      await user.type(
        within(dialog).getByRole('textbox', { name: label(`Đáp án ${option}`) }),
        text,
      )
    }
    await user.click(within(dialog).getByRole('button', { name: 'Thêm câu hỏi' }))
    expect(within(dialog).getByText('Vui lòng chọn đáp án đúng')).toBeInTheDocument()
    expect(add).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('radio', { name: 'B' }))
    await user.click(within(dialog).getByRole('button', { name: 'Thêm câu hỏi' }))

    expect(add).toHaveBeenCalledWith(COURSE_DETAIL_FIXTURE.id, {
      content: 'Số cứu hoả?',
      optionA: '113',
      optionB: '114',
      optionC: '115',
      optionD: '116',
      correctOption: 'B',
    })
    expect(await screen.findByText('Đã thêm câu hỏi vào cuối bài thi.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('edits and deletes a question', async () => {
    const user = userEvent.setup()
    vi.spyOn(examService, 'get').mockResolvedValue(EXAM)
    const update = vi.spyOn(examService, 'updateQuestion').mockResolvedValue(QUESTION)
    const remove = vi.spyOn(examService, 'removeQuestion').mockResolvedValue()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Sửa câu 1' }))
    const dialog = screen.getByRole('dialog', { name: 'Sửa câu 1' })
    expect(within(dialog).getByRole('radio', { name: 'B' })).toBeChecked()
    await user.click(within(dialog).getByRole('radio', { name: 'D' }))
    await user.click(within(dialog).getByRole('button', { name: 'Lưu câu hỏi' }))
    expect(update).toHaveBeenCalledWith(
      COURSE_DETAIL_FIXTURE.id,
      QUESTION.id,
      expect.objectContaining({ content: QUESTION.content, correctOption: 'D' }),
    )

    await user.click(await screen.findByRole('button', { name: 'Xoá câu 2' }))
    const confirm = screen.getByRole('alertdialog', { name: 'Xoá câu 2?' })
    await user.click(within(confirm).getByRole('button', { name: 'Xoá câu hỏi' }))
    expect(remove).toHaveBeenCalledWith(COURSE_DETAIL_FIXTURE.id, 12)
    expect(await screen.findByText('Đã xoá câu 2.')).toBeInTheDocument()
  })

  it('imports questions from Excel and lists the rows to fix', async () => {
    const user = userEvent.setup()
    vi.spyOn(examService, 'get').mockResolvedValue(EXAM)
    const importQuestions = vi
      .spyOn(examService, 'importQuestions')
      .mockRejectedValueOnce({
        status: 400,
        code: 'VRC-400-701',
        message: 'Some rows of the file are invalid; nothing was imported',
        fieldErrors: [
          { field: 'rows[5].content', rejectedValue: '', message: 'Question is required' },
          { field: 'rows[3].optionC', rejectedValue: '', message: 'Option is required' },
          { field: 'rows[3].correctOption', rejectedValue: 'E', message: 'Correct option ...' },
        ],
      })
      .mockResolvedValue({ importedCount: 20, exam: { ...EXAM, questionCount: 20 } })
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Import Excel' }))
    const dialog = screen.getByRole('dialog', { name: 'Import câu hỏi từ Excel' })
    expect(within(dialog).getByRole('link', { name: /Tải file mẫu/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/\/api\/v1\/exams\/question-template$/),
    )
    await user.click(within(dialog).getByRole('button', { name: 'Import' }))
    expect(within(dialog).getByText('Vui lòng chọn file Excel câu hỏi')).toBeInTheDocument()

    const file = new File(['xlsx'], 'cau-hoi.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    await user.upload(within(dialog).getByLabelText(label('File câu hỏi')), file)
    await user.click(within(dialog).getByRole('radio', { name: /Thay toàn bộ/ }))
    expect(within(dialog).getByText(/2 câu đang có sẽ bị xoá/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Import' }))

    expect(importQuestions).toHaveBeenCalledWith(COURSE_DETAIL_FIXTURE.id, file, 'REPLACE')
    const rows = await within(dialog).findByRole('list', { name: 'Các dòng cần sửa' })
    expect(
      within(rows)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual([
      'Dòng 3: Đáp án C đang để trống; Đáp án đúng “E” không hợp lệ (chỉ nhận A, B, C, D)',
      'Dòng 5: Câu hỏi đang để trống',
    ])

    await user.click(within(dialog).getByRole('button', { name: 'Import' }))
    expect(
      await screen.findByText('Đã thay toàn bộ câu hỏi bằng 20 câu trong file.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
