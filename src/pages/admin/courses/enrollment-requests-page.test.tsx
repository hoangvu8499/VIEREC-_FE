import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { transferContent } from '@/constants/payment'
import { ADMIN_ROUTES, adminCoursePath } from '@/constants/routes'
import EnrollmentRequestsPage from '@/pages/admin/courses/enrollment-requests-page'
import { enrollmentService } from '@/services/enrollment-service'
import { paymentService } from '@/services/payment-service'
import { ENROLLMENT_FIXTURE, pageOf } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'

const PENDING = { ...ENROLLMENT_FIXTURE, status: 'PENDING' as const }

function renderPage(path: string = ADMIN_ROUTES.ENROLLMENT_REQUESTS) {
  return renderRoutes(
    [{ path: ADMIN_ROUTES.ENROLLMENT_REQUESTS, element: <EnrollmentRequestsPage /> }],
    path,
  )
}

describe('EnrollmentRequestsPage (duyệt đăng ký)', () => {
  beforeEach(() => {
    vi.spyOn(paymentService, 'search').mockResolvedValue(pageOf([]))
  })

  afterEach(() => vi.restoreAllMocks())

  it('lists pending requests of every course with the transfer content to look for', async () => {
    const search = vi.spyOn(enrollmentService, 'search').mockResolvedValue(pageOf([PENDING]))
    renderPage()

    const row = (await screen.findByText('Nguyễn Văn A')).closest('tr') as HTMLElement
    expect(within(row).getByRole('link', { name: PENDING.courseName })).toHaveAttribute(
      'href',
      adminCoursePath('COURSE_ENROLLMENTS', PENDING.courseId),
    )
    expect(
      within(row).getByText(transferContent(PENDING.username, PENDING.courseId)),
    ).toBeInTheDocument()
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PENDING', page: 0, keyword: undefined }),
    )
  })

  it('approves a request so the learner can start the course', async () => {
    const user = userEvent.setup()
    const search = vi
      .spyOn(enrollmentService, 'search')
      .mockResolvedValueOnce(pageOf([PENDING]))
      .mockResolvedValue(pageOf([]))
    const update = vi
      .spyOn(enrollmentService, 'updateStatus')
      .mockResolvedValue({ ...PENDING, status: 'ENROLLED' })
    renderPage()

    await user.click(
      await screen.findByRole('button', {
        name: `Duyệt Nguyễn Văn A vào học ${PENDING.courseName}`,
      }),
    )
    const dialog = screen.getByRole('alertdialog', { name: 'Duyệt học viên vào học?' })
    await user.click(within(dialog).getByRole('button', { name: 'Duyệt vào học' }))

    expect(update).toHaveBeenCalledWith(PENDING.courseId, PENDING.id, 'ENROLLED')
    expect(await screen.findByText(/^Đã duyệt Nguyễn Văn A vào học khoá/)).toBeInTheDocument()
    expect(await screen.findByText('Không có yêu cầu nào chờ duyệt')).toBeInTheDocument()
    expect(search).toHaveBeenCalledTimes(2)
  })

  it('rejects a request', async () => {
    const user = userEvent.setup()
    vi.spyOn(enrollmentService, 'search').mockResolvedValue(pageOf([PENDING]))
    const update = vi
      .spyOn(enrollmentService, 'updateStatus')
      .mockResolvedValue({ ...PENDING, status: 'CANCELLED' })
    renderPage()

    await user.click(
      await screen.findByRole('button', { name: `Từ chối Nguyễn Văn A (${PENDING.courseName})` }),
    )
    const dialog = screen.getByRole('alertdialog', { name: 'Từ chối yêu cầu đăng ký?' })
    await user.click(within(dialog).getByRole('button', { name: 'Từ chối' }))

    expect(update).toHaveBeenCalledWith(PENDING.courseId, PENDING.id, 'CANCELLED')
  })

  it('searches by keyword from the URL', async () => {
    const search = vi.spyOn(enrollmentService, 'search').mockResolvedValue(pageOf([]))
    renderPage(`${ADMIN_ROUTES.ENROLLMENT_REQUESTS}?q=pccc`)

    expect(await screen.findByText('Không có yêu cầu nào khớp “pccc”')).toBeInTheDocument()
    expect(search).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'pccc' }))
  })
})
