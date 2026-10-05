import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { BANK_ACCOUNT, transferContent } from '@/constants/payment'
import { coursePath, learnPath, ROUTES } from '@/constants/routes'
import CourseDetailPage from '@/pages/course-detail/course-detail-page'
import { courseService } from '@/services/course-service'
import { enrollmentService } from '@/services/enrollment-service'
import { useAuthStore } from '@/stores/auth-store'
import { COURSE_DETAIL_FIXTURE, ENROLLMENT_FIXTURE, USER_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'

function renderPage(path = coursePath(COURSE_DETAIL_FIXTURE.id)) {
  return renderRoutes([{ path: ROUTES.COURSE_DETAIL, element: <CourseDetailPage /> }], path)
}

describe('CourseDetailPage (người dùng)', () => {
  beforeEach(() => {
    vi.spyOn(courseService, 'get').mockResolvedValue(COURSE_DETAIL_FIXTURE)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearSession()
  })

  it('introduces the course and its outline', async () => {
    renderPage()

    expect(
      await screen.findByRole('heading', { level: 1, name: COURSE_DETAIL_FIXTURE.name }),
    ).toBeInTheDocument()
    expect(document.title).toMatch(COURSE_DETAIL_FIXTURE.name)
    expect(screen.getByText(COURSE_DETAIL_FIXTURE.description)).toBeInTheDocument()

    const lessons = screen.getAllByRole('heading', { level: 3 })
    expect(lessons.map((heading) => heading.textContent)).toEqual([
      'Nhận biết nguy cơ cháy nổ',
      'Sử dụng bình chữa cháy',
    ])

    const summary = screen.getByRole('complementary', { name: 'Tóm tắt khoá học' })
    expect(within(summary).getByText('2 bài học')).toBeInTheDocument()
    expect(within(summary).getByText('2 tài liệu đọc')).toBeInTheDocument()
    // Bài 1 có file video, bài 3 có link video.
    expect(within(summary).getByText('2 video bài giảng')).toBeInTheDocument()
  })

  it('shows only the outline, never the files or videos', async () => {
    useAuthStore.getState().setUser(USER_FIXTURE)
    renderPage()

    await screen.findByRole('heading', { level: 1 })
    const outline = screen.getByRole('region', { name: /Nội dung khoá học/ })
    expect(within(outline).getByText('Nhận biết nguy cơ cháy nổ')).toBeInTheDocument()
    expect(within(outline).queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByText(/bai-1\.pdf/)).not.toBeInTheDocument()
  })

  it('invites guests to sign in or register', async () => {
    renderPage()

    await screen.findByRole('heading', { level: 1 })
    expect(screen.getByRole('link', { name: 'Tôi đã có tài khoản' })).toHaveAttribute(
      'href',
      ROUTES.LOGIN,
    )
    expect(screen.getByRole('link', { name: 'Đăng ký tài khoản học viên' })).toHaveAttribute(
      'href',
      ROUTES.REGISTER,
    )
  })

  it('shows the transfer QR and waits for approval after paying', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(USER_FIXTURE)
    const enroll = vi.spyOn(enrollmentService, 'enroll').mockImplementation(async () => {
      vi.mocked(courseService.get).mockResolvedValue({
        ...COURSE_DETAIL_FIXTURE,
        myEnrollmentStatus: 'PENDING',
      })
      return { ...ENROLLMENT_FIXTURE, status: 'PENDING' }
    })
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Đăng ký khoá học' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Chuyển khoản học phí' })
    expect(within(dialog).getByRole('img', { name: /Mã QR chuyển khoản/ })).toBeInTheDocument()
    expect(within(dialog).getByText(BANK_ACCOUNT.accountNumber)).toBeInTheDocument()
    // Số tiền là giá khoá, có trong cả mã QR.
    expect(within(dialog).getByText(/^1\.500\.000\s₫$/)).toBeInTheDocument()
    expect(
      within(dialog).getByText(transferContent(COURSE_DETAIL_FIXTURE.id, USER_FIXTURE.id)),
    ).toBeInTheDocument()
    expect(enroll).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Đã thanh toán' }))

    expect(enroll).toHaveBeenCalledWith(COURSE_DETAIL_FIXTURE.id)
    expect(await screen.findByText('Đang chờ duyệt thanh toán')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Vào học/ })).not.toBeInTheDocument()
  })

  it('cancels a pending request after confirmation', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(USER_FIXTURE)
    vi.mocked(courseService.get).mockResolvedValue({
      ...COURSE_DETAIL_FIXTURE,
      myEnrollmentStatus: 'PENDING',
    })
    const cancel = vi.spyOn(enrollmentService, 'cancel').mockImplementation(async () => {
      vi.mocked(courseService.get).mockResolvedValue({
        ...COURSE_DETAIL_FIXTURE,
        myEnrollmentStatus: 'CANCELLED',
      })
    })
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Huỷ yêu cầu đăng ký' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Huỷ yêu cầu đăng ký?' })
    await user.click(within(dialog).getByRole('button', { name: 'Huỷ yêu cầu' }))

    expect(cancel).toHaveBeenCalledWith(COURSE_DETAIL_FIXTURE.id)
    expect(await screen.findByRole('button', { name: 'Đăng ký khoá học' })).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('opens the classroom once the enrollment is approved', async () => {
    useAuthStore.getState().setUser(USER_FIXTURE)
    vi.mocked(courseService.get).mockResolvedValue({
      ...COURSE_DETAIL_FIXTURE,
      myEnrollmentStatus: 'ENROLLED',
    })
    renderPage()

    expect(await screen.findByText('Bạn đang học khoá này')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Vào học' })).toHaveAttribute(
      'href',
      learnPath(COURSE_DETAIL_FIXTURE.id),
    )
    expect(screen.queryByRole('button', { name: /Huỷ/ })).not.toBeInTheDocument()
  })

  it('explains why sending the payment failed', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(USER_FIXTURE)
    vi.spyOn(enrollmentService, 'enroll').mockRejectedValue({
      status: 409,
      code: 'VRC-409-202',
      message: 'Already enrolled in this course',
    })
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Đăng ký khoá học' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Chuyển khoản học phí' })
    await user.click(within(dialog).getByRole('button', { name: 'Đã thanh toán' }))

    expect(await within(dialog).findByText('Bạn đã đăng ký khoá học này rồi.')).toBeInTheDocument()
  })

  it('warns an admin previewing an unpublished course', async () => {
    vi.mocked(courseService.get).mockResolvedValue({ ...COURSE_DETAIL_FIXTURE, status: 'DRAFT' })
    renderPage()

    expect(await screen.findByText('Khoá học chưa xuất bản')).toBeInTheDocument()
  })

  it('shows not found for a missing or unpublished course', async () => {
    vi.mocked(courseService.get).mockRejectedValue({
      status: 404,
      code: 'VRC-404-201',
      message: 'Course not found',
    })
    renderPage()

    expect(await screen.findByText('Không tìm thấy khoá học')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem các khoá học khác' })).toHaveAttribute(
      'href',
      ROUTES.COURSES,
    )
  })
})
