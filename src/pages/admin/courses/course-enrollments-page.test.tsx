import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { transferContent } from '@/constants/payment'
import { ADMIN_ROUTES, adminCoursePath } from '@/constants/routes'
import CourseEnrollmentsPage from '@/pages/admin/courses/course-enrollments-page'
import { courseService } from '@/services/course-service'
import { enrollmentService } from '@/services/enrollment-service'
import { paymentService } from '@/services/payment-service'
import { COURSE_DETAIL_FIXTURE, ENROLLMENT_FIXTURE, pageOf, PAYMENT_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'

const PENDING = { ...ENROLLMENT_FIXTURE, status: 'PENDING' as const }

function renderPage() {
  return renderRoutes(
    [{ path: ADMIN_ROUTES.COURSE_ENROLLMENTS, element: <CourseEnrollmentsPage /> }],
    adminCoursePath('COURSE_ENROLLMENTS', COURSE_DETAIL_FIXTURE.id),
  )
}

describe('CourseEnrollmentsPage', () => {
  beforeEach(() => {
    vi.spyOn(courseService, 'get').mockResolvedValue(COURSE_DETAIL_FIXTURE)
    vi.spyOn(enrollmentService, 'listByCourse').mockResolvedValue(pageOf([PENDING]))
  })

  afterEach(() => vi.restoreAllMocks())

  it('approves a learner after checking the transfer', async () => {
    const user = userEvent.setup()
    const search = vi.spyOn(paymentService, 'search').mockResolvedValue(pageOf([PAYMENT_FIXTURE]))
    const update = vi
      .spyOn(enrollmentService, 'updateStatus')
      .mockResolvedValue({ ...PENDING, status: 'ENROLLED' })
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Duyệt Nguyễn Văn A vào học' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Duyệt học viên vào học?' })
    expect(
      within(dialog).getByText(transferContent(PENDING.courseId, PENDING.userId)),
    ).toBeInTheDocument()
    expect(await within(dialog).findByText('FT26269123456', { exact: false })).toBeInTheDocument()
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ courseId: PENDING.courseId, userId: PENDING.userId }),
    )

    await user.click(within(dialog).getByRole('button', { name: 'Duyệt vào học' }))

    expect(update).toHaveBeenCalledWith(COURSE_DETAIL_FIXTURE.id, PENDING.id, 'ENROLLED')
    expect(await screen.findByText(/^Đã duyệt Nguyễn Văn A vào học khoá/)).toBeInTheDocument()
  })

  it('rejects a request by cancelling it', async () => {
    const user = userEvent.setup()
    const update = vi
      .spyOn(enrollmentService, 'updateStatus')
      .mockResolvedValue({ ...PENDING, status: 'CANCELLED' })
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Từ chối Nguyễn Văn A' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Từ chối yêu cầu đăng ký?' })
    await user.click(within(dialog).getByRole('button', { name: 'Từ chối' }))

    expect(update).toHaveBeenCalledWith(COURSE_DETAIL_FIXTURE.id, PENDING.id, 'CANCELLED')
  })
})
