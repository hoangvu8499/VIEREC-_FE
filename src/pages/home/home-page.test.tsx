import { screen, within } from '@testing-library/react'

import { ROUTES } from '@/constants/routes'
import HomePage from '@/pages/home/home-page'
import { CATEGORIES, NEWS, PARTNERS, SERVICES } from '@/pages/home/home-data'
import { courseService } from '@/services/course-service'
import { COURSE_FIXTURE, coursePage } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { Course } from '@/types/course'

function renderHome() {
  return renderRoutes([{ path: ROUTES.HOME, element: <HomePage /> }], ROUTES.HOME)
}

function courses(count: number): Course[] {
  return Array.from({ length: count }, (_, index) => ({
    ...COURSE_FIXTURE,
    id: index + 1,
    name: `Khoá học số ${index + 1}`,
  }))
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.spyOn(courseService, 'list').mockResolvedValue(coursePage(courses(8), 0, 8))
  })

  afterEach(() => vi.restoreAllMocks())

  it('shows the 3 newest published courses with a link to all', async () => {
    renderHome()

    const section = await screen.findByRole('region', {
      name: 'Bắt đầu hành trình an toàn của bạn',
    })
    expect(await within(section).findAllByRole('article')).toHaveLength(3)
    expect(courseService.list).toHaveBeenCalledWith({
      page: 0,
      keyword: undefined,
      status: 'PUBLISHED',
    })
    expect(within(section).getByRole('link', { name: 'Khoá học số 1' })).toHaveAttribute(
      'href',
      '/khoa-hoc/1',
    )
    expect(within(section).getByRole('link', { name: /Xem tất cả khoá học/ })).toHaveAttribute(
      'href',
      ROUTES.COURSES,
    )
  })

  it('hides the course section when there is no published course', async () => {
    vi.mocked(courseService.list).mockResolvedValue(coursePage([]))
    renderHome()

    // Đang tải thì khối vẫn hiện (chữ "Đang tải"), có kết quả rỗng thì ẩn hẳn.
    await vi.waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Bắt đầu hành trình an toàn của bạn' }),
      ).not.toBeInTheDocument(),
    )
    expect(courseService.list).toHaveBeenCalled()
  })

  it('renders the hero heading and sets document title', () => {
    renderHome()

    expect(
      screen.getByRole('heading', { level: 1, name: /vì một việt nam an toàn/i }),
    ).toBeInTheDocument()
    expect(document.title).toMatch(/^Trang chủ/)
  })

  it('renders all categories', () => {
    renderHome()

    const section = screen.getByRole('region', { name: 'Lĩnh vực đào tạo' })
    expect(within(section).getAllByRole('link')).toHaveLength(CATEGORIES.length)
  })

  it('renders news with formatted dates', () => {
    renderHome()

    const section = screen.getByRole('region', { name: 'Tin tức & Sự kiện' })
    expect(within(section).getAllByRole('heading', { level: 3 })).toHaveLength(NEWS.length)
    expect(within(section).getByText('20/09/2026')).toBeInTheDocument()
  })

  it('renders the services, the emergency report first', () => {
    renderHome()

    const section = screen.getByRole('region', { name: 'VIEREC đồng hành cùng bạn' })
    const links = within(section).getAllByRole('link')
    expect(links).toHaveLength(SERVICES.length)
    expect(links[0]).toHaveAttribute('href', ROUTES.EMERGENCY_REPORT)
  })

  it('renders partners', () => {
    renderHome()

    const section = screen.getByRole('region', { name: 'Đối tác & Khách hàng' })
    expect(within(section).getAllByRole('listitem')).toHaveLength(PARTNERS.length)
  })
})
