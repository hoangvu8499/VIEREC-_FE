import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router'

import { ADMIN_ROUTES, adminCoursePath } from '@/constants/routes'
import CourseEditPage from '@/pages/admin/courses/course-edit-page'
import { courseService } from '@/services/course-service'
import { COURSE_DETAIL_FIXTURE, COURSE_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { CourseFlashState } from '@/types/course'

function DetailProbe() {
  const state = useLocation().state as CourseFlashState | null
  return <p>Chi tiết: {state?.flash}</p>
}

function renderPage() {
  return renderRoutes(
    [
      { path: ADMIN_ROUTES.COURSE_EDIT, element: <CourseEditPage /> },
      { path: ADMIN_ROUTES.COURSE_DETAIL, element: <DetailProbe /> },
    ],
    adminCoursePath('COURSE_EDIT', COURSE_DETAIL_FIXTURE.id),
  )
}

describe('CourseEditPage', () => {
  beforeEach(() => {
    vi.spyOn(courseService, 'get').mockResolvedValue(COURSE_DETAIL_FIXTURE)
  })

  afterEach(() => vi.restoreAllMocks())

  it('fills the form with the course and saves every field', async () => {
    const user = userEvent.setup()
    const update = vi.spyOn(courseService, 'update').mockResolvedValue(COURSE_FIXTURE)
    renderPage()

    const name = await screen.findByLabelText(/^Tên khoá học\s*\*?$/)
    expect(name).toHaveValue(COURSE_DETAIL_FIXTURE.name)
    expect(screen.getByLabelText(/^Trạng thái\s*\*?$/)).toHaveValue('PUBLISHED')
    // Giảng viên hiện tại hiện sẵn, không cần tìm lại.
    expect(
      screen.getByRole('button', { name: 'Đổi giảng viên (đang chọn Nguyễn Quản Trị)' }),
    ).toBeInTheDocument()

    await user.clear(name)
    await user.type(name, 'PCCC nâng cao')
    const price = screen.getByLabelText(/^Học phí \(VND\)\s*\*?$/)
    expect(price).toHaveValue(String(COURSE_DETAIL_FIXTURE.price))
    await user.clear(price)
    await user.type(price, '2000000')
    await user.selectOptions(screen.getByLabelText(/^Trạng thái\s*\*?$/), 'Lưu trữ')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(update).toHaveBeenCalledWith(7, {
      name: 'PCCC nâng cao',
      description: COURSE_DETAIL_FIXTURE.description,
      instructorId: 3,
      price: 2000000,
      status: 'ARCHIVED',
    })
    expect(await screen.findByText('Chi tiết: Đã lưu thay đổi của khoá học.')).toBeInTheDocument()
  })

  it('requires an instructor again after removing the current one', async () => {
    const user = userEvent.setup()
    const update = vi.spyOn(courseService, 'update')
    renderPage()

    await user.click(await screen.findByRole('button', { name: /^Đổi giảng viên/ }))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(await screen.findByText('Vui lòng chọn giảng viên')).toBeInTheDocument()
    expect(update).not.toHaveBeenCalled()
  })
})
