import { screen, within } from '@testing-library/react'

import { learnPath, LEARNER_ROUTES } from '@/constants/routes'
import OverviewPage from '@/pages/learner/overview-page'
import { certificateService } from '@/services/certificate-service'
import { courseService } from '@/services/course-service'
import { enrollmentService } from '@/services/enrollment-service'
import { useAuthStore } from '@/stores/auth-store'
import {
  CERTIFICATE_FIXTURE,
  COURSE_FIXTURE,
  coursePage,
  ENROLLMENT_FIXTURE,
  pageOf,
  USER_FIXTURE,
} from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'

function renderPage() {
  return renderRoutes(
    [{ path: LEARNER_ROUTES.OVERVIEW, element: <OverviewPage /> }],
    LEARNER_ROUTES.OVERVIEW,
  )
}

describe('OverviewPage (góc học viên)', () => {
  beforeEach(() => {
    useAuthStore.getState().setUser(USER_FIXTURE)
    vi.spyOn(courseService, 'list').mockResolvedValue(coursePage([COURSE_FIXTURE]))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearSession()
  })

  it('shows real counts on the shortcuts and the courses in progress', async () => {
    const listMine = vi
      .spyOn(enrollmentService, 'listMine')
      .mockImplementation(async ({ status } = {}) => {
        if (status === 'ENROLLED') return pageOf([ENROLLMENT_FIXTURE])
        return status === 'PENDING' ? pageOf([], 0, 1) : pageOf([], 0, 2)
      })
    vi.spyOn(certificateService, 'listMine').mockResolvedValue(pageOf([CERTIFICATE_FIXTURE]))
    renderPage()

    const shortcuts = screen.getByRole('navigation', { name: 'Lối tắt' })
    expect(
      await within(shortcuts).findByText('1 chờ duyệt · 1 đang học · 2 đã hoàn thành'),
    ).toBeInTheDocument()
    expect(await within(shortcuts).findByText('1 chứng chỉ')).toBeInTheDocument()
    expect(listMine).toHaveBeenCalledWith({ status: 'ENROLLED', page: 0, size: 3 })

    const continueLearning = screen.getByRole('region', { name: 'Tiếp tục học' })
    expect(
      within(continueLearning).getByRole('link', { name: ENROLLMENT_FIXTURE.courseName }),
    ).toHaveAttribute('href', learnPath(ENROLLMENT_FIXTURE.courseId))
  })

  it('hides empty blocks and shows the identity printed on certificates', async () => {
    vi.spyOn(enrollmentService, 'listMine').mockResolvedValue(pageOf([]))
    vi.spyOn(certificateService, 'listMine').mockResolvedValue(pageOf([]))
    renderPage()

    const identity = screen.getByRole('region', { name: 'Thông tin in trên chứng chỉ' })
    expect(within(identity).getByText('Nguyễn Văn A')).toBeInTheDocument()
    expect(within(identity).getByText('001099012345')).toBeInTheDocument()

    expect(await screen.findByText('0 đang học · 0 đã hoàn thành')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Tiếp tục học' })).not.toBeInTheDocument()
  })
})
