import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LEARNER_ROUTES } from '@/constants/routes'
import EnrollPage from '@/pages/learner/enroll-page'
import { courseService } from '@/services/course-service'
import { COURSE_FIXTURE, coursePage } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'

function renderPage() {
  return renderRoutes(
    [{ path: LEARNER_ROUTES.ENROLL, element: <EnrollPage /> }],
    LEARNER_ROUTES.ENROLL,
  )
}

describe('EnrollPage (góc học viên)', () => {
  afterEach(() => vi.restoreAllMocks())

  it('lists published courses and searches by name', async () => {
    const user = userEvent.setup()
    const list = vi.spyOn(courseService, 'list').mockResolvedValue(coursePage([COURSE_FIXTURE]))
    const { router } = renderPage()

    expect(await screen.findByRole('link', { name: COURSE_FIXTURE.name })).toHaveAttribute(
      'href',
      '/khoa-hoc/7',
    )
    expect(screen.getByText(/1 khoá học đang mở/)).toBeInTheDocument()
    expect(list).toHaveBeenCalledWith({ page: 0, keyword: undefined, status: 'PUBLISHED' })

    await user.type(screen.getByLabelText('Tìm khoá học'), 'pccc{Enter}')

    expect(list).toHaveBeenLastCalledWith({ page: 0, keyword: 'pccc', status: 'PUBLISHED' })
    expect(router.state.location.search).toBe('?q=pccc')
    expect(await screen.findByText(/Tìm thấy 1 khoá học cho “pccc”/)).toBeInTheDocument()
  })

  it('shows a retry action when loading fails', async () => {
    const user = userEvent.setup()
    const list = vi
      .spyOn(courseService, 'list')
      .mockRejectedValueOnce({ status: 0, message: 'Network Error' })
      .mockResolvedValue(coursePage([COURSE_FIXTURE]))
    renderPage()

    expect(await screen.findByText('Không tải được danh sách khoá học')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(await screen.findByRole('link', { name: COURSE_FIXTURE.name })).toBeInTheDocument()
    expect(list).toHaveBeenCalledTimes(2)
  })
})
