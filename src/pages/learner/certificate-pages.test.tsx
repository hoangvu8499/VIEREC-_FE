import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LEARNER_ROUTES, learnerCertificatePath } from '@/constants/routes'
import CertificateDetailPage from '@/pages/learner/certificate-detail-page'
import CertificatesPage from '@/pages/learner/certificates-page'
import { certificateService } from '@/services/certificate-service'
import { useAuthStore } from '@/stores/auth-store'
import { CERTIFICATE_FIXTURE, USER_FIXTURE, pageOf } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type * as PdfFile from '@/utils/pdf-file'
import { printPdf } from '@/utils/pdf-file'

vi.mock('@/utils/pdf-file', async (importOriginal) => ({
  ...(await importOriginal<typeof PdfFile>()),
  printPdf: vi.fn<typeof printPdf>(() => Promise.resolve()),
}))

const DETAIL = learnerCertificatePath(CERTIFICATE_FIXTURE.code)

function renderPages(initial: string) {
  return renderRoutes(
    [
      { path: LEARNER_ROUTES.CERTIFICATES, element: <CertificatesPage /> },
      { path: LEARNER_ROUTES.CERTIFICATE_DETAIL, element: <CertificateDetailPage /> },
    ],
    initial,
  )
}

describe('Chứng chỉ của học viên', () => {
  beforeEach(() => useAuthStore.getState().setUser(USER_FIXTURE))

  afterEach(() => {
    vi.restoreAllMocks()
    vi.mocked(printPdf).mockClear()
    useAuthStore.getState().clearSession()
  })

  it('lists the certificates with links to view, download and print them', async () => {
    vi.spyOn(certificateService, 'listMine').mockResolvedValue(pageOf([CERTIFICATE_FIXTURE]))
    renderPages(LEARNER_ROUTES.CERTIFICATES)

    const card = await screen.findByRole('article', { name: CERTIFICATE_FIXTURE.courseName })
    expect(within(card).getByRole('link', { name: /Xem chứng chỉ/ })).toHaveAttribute(
      'href',
      DETAIL,
    )
    expect(
      within(card)
        .getByRole('link', { name: /Tải chứng chỉ/ })
        .getAttribute('href'),
    ).toMatch(/\/api\/v1\/files\/42\?download=true$/)
    expect(within(card).getByRole('button', { name: /In chứng chỉ/ })).toBeInTheDocument()
  })

  it('shows the certificate as a sheet and prints the official PDF', async () => {
    const user = userEvent.setup()
    const get = vi.spyOn(certificateService, 'getMine').mockResolvedValue(CERTIFICATE_FIXTURE)
    renderPages(DETAIL)

    const sheet = await screen.findByRole('article', { name: CERTIFICATE_FIXTURE.fullName })
    expect(get).toHaveBeenCalledWith(CERTIFICATE_FIXTURE.code)
    expect(within(sheet).getByText(CERTIFICATE_FIXTURE.courseName)).toBeInTheDocument()
    expect(within(sheet).getByText(CERTIFICATE_FIXTURE.code)).toBeInTheDocument()
    expect(within(sheet).getByText(`Số CCCD: ${CERTIFICATE_FIXTURE.cccd}`)).toBeInTheDocument()
    expect(within(sheet).getByRole('img', { name: /Mã QR tra cứu chứng chỉ/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /In chứng chỉ/ }))
    expect(printPdf).toHaveBeenCalledWith(CERTIFICATE_FIXTURE.fileUrl)
  })

  it('explains when the certificate is not the learner’s', async () => {
    vi.spyOn(certificateService, 'getMine').mockRejectedValue({
      status: 404,
      code: 'VRC-404-401',
      message: 'Certificate not found',
    })
    renderPages(DETAIL)

    expect(await screen.findByText('Không tìm thấy chứng chỉ')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Chứng chỉ của tôi/ })).toHaveAttribute(
      'href',
      LEARNER_ROUTES.CERTIFICATES,
    )
  })
})
