import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ROUTES } from '@/constants/routes'
import FindRespondersPage from '@/pages/find-responders/find-responders-page'
import { supportPointService } from '@/services/support-point-service'
import { renderRoutes } from '@/test/render-routes'
import type { NearbySupportPoints } from '@/types/support-point'

// jsdom không vẽ được Leaflet: thay bản đồ bằng danh sách ghim.
vi.mock('@/pages/find-responders/components/responders-map', () => ({
  default: ({
    points,
    selectedId,
  }: {
    points: { id: number; name: string }[]
    selectedId?: number
  }) => (
    <ul aria-label="Bản đồ">
      {points.map((point) => (
        <li key={point.id} aria-current={point.id === selectedId || undefined}>
          {point.name}
        </li>
      ))}
    </ul>
  ),
}))

const NEARBY: NearbySupportPoints = {
  origin: { latitude: 15.9967, longitude: 108.2462, label: 'Ngũ Hành Sơn, Đà Nẵng, Việt Nam' },
  radiusKm: 3,
  results: [
    {
      id: 1,
      name: 'Đơn vị xử lý sự cố số 1',
      province: 'Đà Nẵng',
      district: 'Ngũ Hành Sơn',
      latitude: 15.994224,
      longitude: 108.237739,
      phoneNumber: '0905123456',
      distanceKm: 0.954,
    },
    {
      id: 2,
      name: 'Đơn vị xử lý sự cố số 2',
      province: 'Đà Nẵng',
      district: 'Ngũ Hành Sơn',
      address: '12 Lê Văn Hiến',
      latitude: 15.981263,
      longitude: 108.246143,
      phoneNumber: '0912345678',
      distanceKm: 1.712,
    },
  ],
}

function renderPage(path: string = ROUTES.FIND_RESPONDERS) {
  return renderRoutes([{ path: ROUTES.FIND_RESPONDERS, element: <FindRespondersPage /> }], path)
}

describe('FindRespondersPage (tìm đơn vị xử lý sự cố)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('finds the units around an address, nearest first, with call and directions', async () => {
    const user = userEvent.setup()
    const nearby = vi.spyOn(supportPointService, 'nearby').mockResolvedValue(NEARBY)
    const { router } = renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Tìm đơn vị xử lý sự cố' })).toBeVisible()
    await user.type(
      screen.getByRole('textbox', { name: 'Địa chỉ nơi xảy ra sự cố' }),
      ' Ngũ Hành Sơn, Đà Nẵng ',
    )
    await user.click(screen.getByRole('button', { name: 'Tìm' }))

    expect(nearby).toHaveBeenCalledWith({ address: 'Ngũ Hành Sơn, Đà Nẵng', radiusKm: 3 })
    expect(router.state.location.search).toBe(
      `?dia-chi=${encodeURIComponent('Ngũ Hành Sơn, Đà Nẵng').replace(/%20/g, '+')}`,
    )
    expect(
      await screen.findByRole('heading', { name: '2 đơn vị trong bán kính 3 km' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Quanh Ngũ Hành Sơn, Đà Nẵng, Việt Nam')).toBeInTheDocument()

    const list = screen.getByRole('list', { name: 'Đơn vị xử lý sự cố gần nhất' })
    const cards = within(list).getAllByRole('article')
    expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      'Đơn vị xử lý sự cố số 1',
      'Đơn vị xử lý sự cố số 2',
    ])
    const first = cards[0] as HTMLElement
    expect(within(first).getByText('0,95 km')).toBeInTheDocument()
    expect(
      within(first).getByRole('link', { name: 'Gọi Đơn vị xử lý sự cố số 1: 0905123456' }),
    ).toHaveAttribute('href', 'tel:0905123456')
    expect(within(first).getByText('0905 123 456')).toBeInTheDocument()
    expect(within(first).getByRole('link', { name: /Chỉ đường/ })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/dir/?api=1&origin=15.9967%2C108.2462&destination=15.994224%2C108.237739',
    )
    expect(within(cards[1] as HTMLElement).getByText(/^12 Lê Văn Hiến, Ngũ Hành Sơn/)).toBeVisible()

    // Chọn ở danh sách → đơn vị được làm nổi trên bản đồ.
    await user.click(within(first).getByRole('button', { name: /trên bản đồ/ }))
    const map = await screen.findByRole('list', { name: 'Bản đồ' })
    expect(within(map).getByText('Đơn vị xử lý sự cố số 1')).toHaveAttribute('aria-current', 'true')
  })

  it('asks for an address before searching', async () => {
    const user = userEvent.setup()
    const nearby = vi.spyOn(supportPointService, 'nearby')
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Tìm' }))

    expect(screen.getByText('Vui lòng nhập địa chỉ nơi xảy ra sự cố.')).toBeInTheDocument()
    expect(nearby).not.toHaveBeenCalled()
  })

  it('searches around the current position', async () => {
    const user = userEvent.setup()
    const nearby = vi
      .spyOn(supportPointService, 'nearby')
      .mockResolvedValue({ ...NEARBY, origin: { latitude: 16.0123457, longitude: 108.2 } })
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: {
        getCurrentPosition: (success: PositionCallback) =>
          success({ coords: { latitude: 16.01234567, longitude: 108.2 } } as GeolocationPosition),
      },
    })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Dùng vị trí của tôi' }))

    expect(nearby).toHaveBeenCalledWith({ latitude: 16.012346, longitude: 108.2, radiusKm: 3 })
    expect(await screen.findByText('Quanh vị trí của bạn')).toBeInTheDocument()
  })

  it('explains when the location permission is refused', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: {
        getCurrentPosition: (_: PositionCallback, failure: PositionErrorCallback) =>
          failure({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError),
      },
    })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Dùng vị trí của tôi' }))

    expect(screen.getByText(/Bạn chưa cho phép trang web xem vị trí/)).toBeInTheDocument()
  })

  it('offers a wider radius when nothing is close', async () => {
    const user = userEvent.setup()
    const nearby = vi
      .spyOn(supportPointService, 'nearby')
      .mockResolvedValueOnce({ ...NEARBY, results: [] })
      .mockResolvedValue({ ...NEARBY, radiusKm: 5 })
    const { router } = renderPage(`${ROUTES.FIND_RESPONDERS}?dia-chi=Hoi+An`)

    expect(
      await screen.findByRole('heading', { name: 'Không có đơn vị nào trong bán kính 3 km' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tìm trong 5 km' }))

    expect(nearby).toHaveBeenLastCalledWith({ address: 'Hoi An', radiusKm: 5 })
    expect(router.state.location.search).toBe('?dia-chi=Hoi+An&ban-kinh=5')
    expect(screen.getByRole('combobox', { name: 'Bán kính' })).toHaveValue('5')
  })

  it('says when the address cannot be found', async () => {
    vi.spyOn(supportPointService, 'nearby').mockRejectedValue({
      status: 404,
      code: 'VRC-404-601',
      message: 'No place matches this address',
    })
    renderPage(`${ROUTES.FIND_RESPONDERS}?dia-chi=xyz`)

    expect(await screen.findByText(/Không tìm thấy địa chỉ này trên bản đồ/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
  })
})
