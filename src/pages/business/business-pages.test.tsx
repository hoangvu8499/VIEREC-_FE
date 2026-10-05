import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { BUSINESS_ROUTES, businessCertificatePath, businessMemberPath } from '@/constants/routes'
import BusinessCertificateDetailPage from '@/pages/business/certificate-detail-page'
import BusinessCertificatesPage from '@/pages/business/certificates-page'
import BusinessEnrollPage from '@/pages/business/enroll-page'
import MemberCreatePage from '@/pages/business/member-create-page'
import MemberDetailPage from '@/pages/business/member-detail-page'
import BusinessOverviewPage from '@/pages/business/overview-page'
import { myBusinessService } from '@/services/business-service'
import { courseService } from '@/services/course-service'
import { useAuthStore } from '@/stores/auth-store'
import {
  BUSINESS_FIXTURE,
  BUSINESS_MANAGER_FIXTURE,
  BUSINESS_MEMBER_FIXTURE,
  CERTIFICATE_FIXTURE,
  COURSE_FIXTURE,
  ENROLLMENT_FIXTURE,
  pageOf,
} from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { BusinessMemberDetail } from '@/types/business'

const OTHER_MEMBER = {
  ...BUSINESS_MEMBER_FIXTURE,
  id: 22,
  username: 'nv.binh',
  firstName: 'Bình',
  lastName: 'Phạm',
  fullName: 'Phạm Bình',
  phoneNumber: '0912000022',
  pendingCount: 1,
  learningCount: 0,
  completedCount: 0,
  certificateCount: 0,
}

const label = (text: string) => new RegExp(`^${text}\\s*\\*?$`)

function render(path: string, element: React.ReactNode, initial = path) {
  return renderRoutes(
    [
      { path, element },
      { path: BUSINESS_ROUTES.MEMBER_DETAIL, element: <p>Trang tiến độ học viên</p> },
    ],
    initial,
  )
}

describe('Góc doanh nghiệp', () => {
  beforeEach(() => {
    useAuthStore.getState().setUser(BUSINESS_MANAGER_FIXTURE)
    vi.spyOn(myBusinessService, 'get').mockResolvedValue(BUSINESS_FIXTURE)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearSession()
  })

  it('lists the learners of the business with their course counts', async () => {
    vi.spyOn(myBusinessService, 'members').mockResolvedValue(
      pageOf([BUSINESS_MEMBER_FIXTURE, OTHER_MEMBER]),
    )
    render(BUSINESS_ROUTES.OVERVIEW, <BusinessOverviewPage />)

    expect(
      await screen.findByRole('heading', { level: 1, name: BUSINESS_FIXTURE.name }),
    ).toBeVisible()
    const link = await screen.findByRole('link', { name: /Lê Văn An/ })
    expect(link).toHaveAttribute('href', businessMemberPath(BUSINESS_MEMBER_FIXTURE.id))
    const item = link.closest('li') as HTMLElement
    expect(within(item).getByText('Hoàn thành').nextSibling).toHaveTextContent('1')
    expect(within(item).getByText('Chứng chỉ').nextSibling).toHaveTextContent('1')
    expect(screen.getByText(/Hiển thị 1–2 trong/)).toBeInTheDocument()
  })

  it('explains why an inactive business cannot use the area', async () => {
    vi.mocked(myBusinessService.get).mockRejectedValue({
      status: 403,
      code: 'VRC-403-802',
      message: 'The business is inactive',
    })
    vi.spyOn(myBusinessService, 'members').mockResolvedValue(pageOf([]))
    render(BUSINESS_ROUTES.OVERVIEW, <BusinessOverviewPage />)

    expect(await screen.findByText(/Doanh nghiệp đang tạm ngừng trên hệ thống/)).toBeVisible()
  })

  it('creates a learner account and opens their progress', async () => {
    const user = userEvent.setup()
    const create = vi
      .spyOn(myBusinessService, 'createMember')
      .mockResolvedValue(BUSINESS_MEMBER_FIXTURE)
    render(BUSINESS_ROUTES.MEMBER_CREATE, <MemberCreatePage />)

    await user.type(screen.getByLabelText(label('Họ và tên đệm')), 'Lê Văn')
    await user.type(screen.getByLabelText(label('Tên')), 'An')
    await user.type(screen.getByLabelText(label('Ngày sinh')), '1995-05-20')
    await user.type(screen.getByLabelText(label('Số CCCD')), '001099000021')
    await user.type(screen.getByLabelText(label('Số điện thoại')), '0912000021')
    await user.type(screen.getByLabelText(label('Email')), 'an.le@moitruongxanh.vn')
    await user.type(screen.getByLabelText(label('Địa chỉ')), 'Hà Nội')
    await user.type(screen.getByLabelText(label('Tên đăng nhập')), 'nv.an')
    await user.type(screen.getByLabelText(label('Mật khẩu')), 'Abc@1234')
    await user.type(screen.getByLabelText(label('Nhập lại mật khẩu')), 'Abc@1234')
    await user.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))

    expect(create).toHaveBeenCalledWith({
      lastName: 'Lê Văn',
      firstName: 'An',
      dateOfBirth: '1995-05-20',
      cccd: '001099000021',
      phoneNumber: '0912000021',
      email: 'an.le@moitruongxanh.vn',
      address: 'Hà Nội',
      username: 'nv.an',
      password: 'Abc@1234',
    })
    expect(await screen.findByText('Trang tiến độ học viên')).toBeInTheDocument()
  })

  it('shows the progress, exam result and certificate of a learner', async () => {
    const detail: BusinessMemberDetail = {
      member: BUSINESS_MEMBER_FIXTURE,
      courses: [
        {
          enrollmentId: 40,
          courseId: 1,
          courseName: 'Phòng cháy chữa cháy cơ bản',
          status: 'COMPLETED',
          price: 1500000,
          enrolledAt: '2026-10-01T08:00:00',
          approvedAt: '2026-10-01T09:00:00',
          completedAt: '2026-10-02T10:00:00',
          progress: {
            videoCount: 3,
            unopenedCount: 0,
            totalSeconds: 1800,
            watchedSeconds: 1620,
            percent: 90,
            examReady: true,
          },
          exam: {
            submitted: true,
            startedAt: '2026-10-02T09:30:00',
            submittedAt: '2026-10-02T09:50:00',
            questionCount: 20,
            correctCount: 17,
            score: 8.5,
            passScore: 5,
            passed: true,
          },
          certificate: { code: 'VRC-2026-AB12CD34', issuedAt: '2026-10-03T08:00:00' },
        },
        {
          enrollmentId: 41,
          courseId: 2,
          courseName: 'An toàn hoá chất',
          status: 'PENDING',
          price: 1000000,
          enrolledAt: '2026-10-02T08:00:00',
          approvedAt: null,
          completedAt: null,
          exam: null,
          certificate: null,
        },
      ],
    }
    vi.spyOn(myBusinessService, 'member').mockResolvedValue(detail)
    renderRoutes(
      [{ path: BUSINESS_ROUTES.MEMBER_DETAIL, element: <MemberDetailPage /> }],
      businessMemberPath(BUSINESS_MEMBER_FIXTURE.id),
    )

    const course = (
      await screen.findByRole('heading', { name: 'Phòng cháy chữa cháy cơ bản' })
    ).closest('li') as HTMLElement
    expect(within(course).getByRole('progressbar', { name: 'Tiến độ xem video' })).toHaveValue(90)
    expect(within(course).getByText(/Đủ điều kiện thi/)).toBeInTheDocument()
    expect(within(course).getByText('8,5/10')).toBeInTheDocument()
    expect(within(course).getByText('Đạt')).toBeInTheDocument()
    expect(within(course).getByText('VRC-2026-AB12CD34')).toBeInTheDocument()

    const pending = screen
      .getByRole('heading', { name: 'An toàn hoá chất' })
      .closest('li') as HTMLElement
    expect(within(pending).getByText('Chờ duyệt')).toBeInTheDocument()
    expect(within(pending).queryByText(/Bài thi/)).not.toBeInTheDocument()
  })

  it('enrolls several learners and shows the transfer for the total', async () => {
    const user = userEvent.setup()
    vi.spyOn(courseService, 'list').mockResolvedValue(pageOf([COURSE_FIXTURE]))
    vi.spyOn(myBusinessService, 'members').mockResolvedValue(
      pageOf([BUSINESS_MEMBER_FIXTURE, OTHER_MEMBER]),
    )
    const enroll = vi.spyOn(myBusinessService, 'enroll').mockResolvedValue({
      courseId: COURSE_FIXTURE.id,
      courseName: COURSE_FIXTURE.name,
      enrolled: [{ ...ENROLLMENT_FIXTURE, fullName: 'Lê Văn An', price: COURSE_FIXTURE.price }],
      skipped: [{ userId: OTHER_MEMBER.id, fullName: 'Phạm Bình', status: 'PENDING' }],
      totalAmount: COURSE_FIXTURE.price,
    })
    render(BUSINESS_ROUTES.ENROLL, <BusinessEnrollPage />)

    const submit = screen.getByRole('button', { name: /Gửi đăng ký/ })
    expect(submit).toBeDisabled()
    await user.click(await screen.findByRole('radio', { name: new RegExp(COURSE_FIXTURE.name) }))
    await user.click(await screen.findByRole('checkbox', { name: /Chọn tất cả/ }))
    expect(screen.getByText('Đã chọn 2 học viên')).toBeInTheDocument()
    await user.click(submit)

    expect(enroll).toHaveBeenCalledWith({
      courseId: COURSE_FIXTURE.id,
      userIds: [BUSINESS_MEMBER_FIXTURE.id, OTHER_MEMBER.id],
    })
    expect(await screen.findByText(`Đã gửi đăng ký khoá ${COURSE_FIXTURE.name}`)).toBeVisible()
    expect(
      screen.getByText(`VIEREC KH${COURSE_FIXTURE.id} DN${BUSINESS_FIXTURE.id}`),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Mã QR chuyển/ })).toBeInTheDocument()
    expect(screen.getByText(/Phạm Bình · Chờ duyệt/)).toBeInTheDocument()
  })

  it('lists the certificates of the learners and searches them', async () => {
    const user = userEvent.setup()
    const certificate = {
      ...CERTIFICATE_FIXTURE,
      userId: BUSINESS_MEMBER_FIXTURE.id,
      fullName: 'Lê Văn An',
    }
    const list = vi
      .spyOn(myBusinessService, 'certificates')
      .mockResolvedValue(pageOf([certificate]))
    render(BUSINESS_ROUTES.CERTIFICATES, <BusinessCertificatesPage />)

    const row = (await screen.findByRole('link', { name: 'Lê Văn An' })).closest(
      'li',
    ) as HTMLElement
    expect(within(row).getByRole('link', { name: 'Lê Văn An' })).toHaveAttribute(
      'href',
      businessMemberPath(BUSINESS_MEMBER_FIXTURE.id),
    )
    expect(within(row).getByRole('link', { name: /Xem chứng chỉ/ })).toHaveAttribute(
      'href',
      businessCertificatePath(certificate.code),
    )
    expect(
      within(row)
        .getByRole('link', { name: /Tải chứng chỉ/ })
        .getAttribute('href'),
    ).toMatch(/download=true$/)
    expect(within(row).getByRole('button', { name: /In chứng chỉ/ })).toBeInTheDocument()
    expect(within(row).queryByRole('button', { name: /Sao chép/ })).not.toBeInTheDocument()

    await user.type(screen.getByRole('searchbox', { name: 'Tìm chứng chỉ' }), 'pccc')
    await user.click(screen.getByRole('button', { name: 'Tìm' }))
    await vi.waitFor(() =>
      expect(list).toHaveBeenLastCalledWith({ keyword: 'pccc', page: 0, size: expect.any(Number) }),
    )
  })

  it('shows one certificate with a link to the learner’s progress', async () => {
    const certificate = {
      ...CERTIFICATE_FIXTURE,
      userId: BUSINESS_MEMBER_FIXTURE.id,
      fullName: 'Lê Văn An',
    }
    vi.spyOn(myBusinessService, 'certificate').mockResolvedValue(certificate)
    renderRoutes(
      [{ path: BUSINESS_ROUTES.CERTIFICATE_DETAIL, element: <BusinessCertificateDetailPage /> }],
      businessCertificatePath(certificate.code),
    )

    expect(await screen.findByRole('article', { name: 'Lê Văn An' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Tiến độ học tập của Lê Văn An/ })).toHaveAttribute(
      'href',
      businessMemberPath(BUSINESS_MEMBER_FIXTURE.id),
    )
    expect(screen.getByRole('link', { name: /Tải chứng chỉ/ })).toBeInTheDocument()
  })
})
