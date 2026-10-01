import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ROUTES } from '@/constants/routes'
import CoursesPage from '@/pages/courses/courses-page'
import { courseService } from '@/services/course-service'
import { COURSE_FIXTURE, coursePage } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { Course } from '@/types/course'

function courses(count: number, startId = 1): Course[] {
  return Array.from({ length: count }, (_, index) => ({
    ...COURSE_FIXTURE,
    id: startId + index,
    name: `Khoá học số ${startId + index}`,
  }))
}

function renderPage(path: string = ROUTES.COURSES) {
  return renderRoutes([{ path: ROUTES.COURSES, element: <CoursesPage /> }], path)
}

describe('CoursesPage (người dùng)', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => vi.restoreAllMocks())

  it('lists only published courses with their summary', async () => {
    const list = vi
      .spyOn(courseService, 'list')
      .mockResolvedValue(coursePage([COURSE_FIXTURE], 0, 1))
    renderPage()

    const card = (
      await screen.findByRole('heading', { level: 2, name: COURSE_FIXTURE.name })
    ).closest('article') as HTMLElement
    expect(within(card).getByText(COURSE_FIXTURE.description)).toBeInTheDocument()
    expect(within(card).getByText('Nguyễn Quản Trị')).toBeInTheDocument()
    expect(within(card).getByText('2 bài học')).toBeInTheDocument()
    // Tên "Phòng cháy chữa cháy" → nhãn lĩnh vực PCCC.
    expect(within(card).getByText('PCCC')).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: COURSE_FIXTURE.name })).toHaveAttribute(
      'href',
      '/khoa-hoc/7',
    )
    expect(list).toHaveBeenCalledWith({ page: 0, keyword: undefined, status: 'PUBLISHED' })
    expect(screen.getByText('khoá học đang mở', { exact: false })).toHaveTextContent('1')
  })

  it('searches by name and pages through results', async () => {
    const user = userEvent.setup()
    const list = vi
      .spyOn(courseService, 'list')
      .mockImplementation(async ({ page = 0 } = {}) =>
        coursePage(page === 0 ? courses(10) : courses(2, 11), page, 12),
      )
    const { router } = renderPage()

    await screen.findByText('Khoá học số 1')
    await user.click(screen.getByRole('button', { name: 'Trang 2' }))
    expect(await screen.findByText('Khoá học số 11')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?trang=2')

    await user.type(screen.getByLabelText('Tìm khoá học'), 'pccc{Enter}')
    expect(list).toHaveBeenLastCalledWith({ page: 0, keyword: 'pccc', status: 'PUBLISHED' })
    expect(await screen.findByText(/Tìm thấy 12 khoá học cho “pccc”/)).toBeInTheDocument()
  })

  it('explains an empty search result', async () => {
    vi.spyOn(courseService, 'list').mockResolvedValue(coursePage([]))
    renderPage(`${ROUTES.COURSES}?q=xyz`)

    expect(await screen.findByText('Không tìm thấy khoá học phù hợp')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xem tất cả khoá học' })).toBeInTheDocument()
  })

  it('says courses are coming when none is published yet', async () => {
    vi.spyOn(courseService, 'list').mockResolvedValue(coursePage([]))
    renderPage()

    expect(await screen.findByText('Khoá học sắp ra mắt')).toBeInTheDocument()
  })
})
