import { screen, within } from '@testing-library/react'

import { LEARNER_ROUTES } from '@/constants/routes'
import PaymentsPage from '@/pages/learner/payments-page'
import { paymentService } from '@/services/payment-service'
import { pageOf, PAYMENT_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'

function renderPage() {
  return renderRoutes(
    [{ path: LEARNER_ROUTES.PAYMENTS, element: <PaymentsPage /> }],
    LEARNER_ROUTES.PAYMENTS,
  )
}

describe('PaymentsPage (lịch sử thanh toán)', () => {
  afterEach(() => vi.restoreAllMocks())

  it('lists the payments with amount and confirmation status', async () => {
    const listMine = vi
      .spyOn(paymentService, 'listMine')
      .mockResolvedValue(
        pageOf([PAYMENT_FIXTURE, { ...PAYMENT_FIXTURE, id: 13, status: 'PENDING', paidAt: null }]),
      )
    renderPage()

    const items = await screen.findAllByRole('article')
    expect(items).toHaveLength(2)
    const [paid, pending] = items as [HTMLElement, HTMLElement]
    expect(within(paid).getByText(/1\.500\.000/)).toBeInTheDocument()
    expect(within(paid).getByText('Đã thanh toán')).toBeInTheDocument()
    expect(within(paid).getByText('FT26269123456')).toBeInTheDocument()
    expect(within(pending).getByText('Chờ xác nhận')).toBeInTheDocument()
    expect(listMine).toHaveBeenCalledWith({ page: 0, size: 10 })
  })

  it('explains the empty history', async () => {
    vi.spyOn(paymentService, 'listMine').mockResolvedValue(pageOf([]))
    renderPage()

    expect(await screen.findByText('Chưa có giao dịch nào')).toBeInTheDocument()
  })
})
