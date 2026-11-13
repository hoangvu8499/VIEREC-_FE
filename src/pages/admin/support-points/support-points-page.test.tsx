import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ADMIN_ROUTES } from '@/constants/routes'
import SupportPointsPage from '@/pages/admin/support-points/support-points-page'
import { adminSupportPointService } from '@/services/support-point-service'
import { pageOf } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { SupportPointDetail } from '@/types/support-point'

const NGU_HANH_SON: SupportPointDetail = {
  id: 1,
  name: 'Đội PCCC Ngũ Hành Sơn',
  province: 'Đà Nẵng',
  district: 'Ngũ Hành Sơn',
  address: '12 Lê Văn Hiến',
  latitude: 15.994224,
  longitude: 108.237739,
  phoneNumber: '0236 3822 114',
  createdAt: '2026-11-01T08:00:00',
  updatedAt: '2026-11-01T08:00:00',
}

const DIEN_BAN: SupportPointDetail = {
  ...NGU_HANH_SON,
  id: 2,
  name: 'Đội PCCC Điện Bàn',
  province: 'Quảng Nam',
  district: 'Điện Bàn',
  address: undefined,
  latitude: 15.920473,
  longitude: 108.208416,
  phoneNumber: '114',
}

const label = (text: string) => new RegExp(`^${text}\\s*\\*?$`)

function renderPage() {
  return renderRoutes(
    [{ path: ADMIN_ROUTES.SUPPORT_POINTS, element: <SupportPointsPage /> }],
    ADMIN_ROUTES.SUPPORT_POINTS,
  )
}

function rowOf(name: string): HTMLElement {
  return screen.getByText(name).closest('tr') as HTMLElement
}

describe('SupportPointsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists the support points with their area, phone and a map link', async () => {
    vi.spyOn(adminSupportPointService, 'list').mockResolvedValue(pageOf([NGU_HANH_SON, DIEN_BAN]))
    renderPage()

    const row = rowOf(
      await screen.findByText('Đội PCCC Ngũ Hành Sơn').then((cell) => cell.textContent ?? ''),
    )
    expect(within(row).getByText('12 Lê Văn Hiến')).toBeInTheDocument()
    expect(within(row).getByText('Ngũ Hành Sơn, Đà Nẵng')).toBeInTheDocument()
    expect(within(row).getByRole('link', { name: '0236 3822 114' })).toHaveAttribute(
      'href',
      'tel:02363822114',
    )
    expect(within(row).getByRole('link', { name: /15\.994224, 108\.237739/ })).toHaveAttribute(
      'href',
      'https://www.google.com/maps?q=15.994224,108.237739',
    )
    expect(screen.getByText(/Hiển thị 1–2 trong/)).toBeInTheDocument()
  })

  it('creates a point without coordinates so the server looks them up', async () => {
    const user = userEvent.setup()
    vi.spyOn(adminSupportPointService, 'list').mockResolvedValue(pageOf([]))
    const create = vi.spyOn(adminSupportPointService, 'create').mockResolvedValue(NGU_HANH_SON)
    renderPage()

    const buttons = await screen.findAllByRole('button', { name: 'Thêm điểm hỗ trợ' })
    await user.click(buttons[0] as HTMLElement)
    const dialog = screen.getByRole('dialog', { name: 'Thêm điểm hỗ trợ' })

    // Bỏ trống hết: báo lỗi từng ô, chưa gọi API.
    await user.click(within(dialog).getByRole('button', { name: 'Thêm điểm hỗ trợ' }))
    expect(within(dialog).getByText('Vui lòng nhập tên đơn vị')).toBeInTheDocument()
    expect(within(dialog).getByText('Vui lòng nhập số điện thoại')).toBeInTheDocument()
    expect(create).not.toHaveBeenCalled()

    await user.type(within(dialog).getByLabelText(label('Tên đơn vị')), 'Đội PCCC Ngũ Hành Sơn')
    await user.type(within(dialog).getByLabelText(label('Tỉnh / Thành phố')), 'Đà Nẵng')
    await user.type(within(dialog).getByLabelText(label('Quận / Huyện')), 'Ngũ Hành Sơn')
    await user.type(within(dialog).getByLabelText(label('Địa chỉ chi tiết')), '12 Lê Văn Hiến')
    await user.type(within(dialog).getByLabelText(label('Số điện thoại')), '0236 3822 114')
    await user.click(within(dialog).getByRole('button', { name: 'Thêm điểm hỗ trợ' }))

    expect(create).toHaveBeenCalledWith({
      name: 'Đội PCCC Ngũ Hành Sơn',
      province: 'Đà Nẵng',
      district: 'Ngũ Hành Sơn',
      address: '12 Lê Văn Hiến',
      phoneNumber: '0236 3822 114',
      latitude: null,
      longitude: null,
    })
    expect(
      await screen.findByText('Đã thêm điểm hỗ trợ Đội PCCC Ngũ Hành Sơn.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('asks for both coordinates and explains an address that cannot be found', async () => {
    const user = userEvent.setup()
    vi.spyOn(adminSupportPointService, 'list').mockResolvedValue(pageOf([]))
    const create = vi.spyOn(adminSupportPointService, 'create').mockRejectedValue({
      status: 404,
      code: 'VRC-404-601',
      message: 'No place matches this address; enter the coordinates instead',
    })
    renderPage()

    const buttons = await screen.findAllByRole('button', { name: 'Thêm điểm hỗ trợ' })
    await user.click(buttons[0] as HTMLElement)
    const dialog = screen.getByRole('dialog', { name: 'Thêm điểm hỗ trợ' })
    await user.type(within(dialog).getByLabelText(label('Tên đơn vị')), 'Đội PCCC')
    await user.type(within(dialog).getByLabelText(label('Tỉnh / Thành phố')), 'Đà Nẵng')
    await user.type(within(dialog).getByLabelText(label('Quận / Huyện')), 'Không Có')
    await user.type(within(dialog).getByLabelText(label('Số điện thoại')), '114')

    // Chỉ vĩ độ: phải nhập cả kinh độ.
    await user.type(within(dialog).getByLabelText(label('Vĩ độ')), '15,99')
    await user.click(within(dialog).getByRole('button', { name: 'Thêm điểm hỗ trợ' }))
    expect(
      within(dialog).getByText('Nhập cả vĩ độ và kinh độ, hoặc bỏ trống cả hai'),
    ).toBeInTheDocument()
    expect(create).not.toHaveBeenCalled()

    await user.clear(within(dialog).getByLabelText(label('Vĩ độ')))
    await user.click(within(dialog).getByRole('button', { name: 'Thêm điểm hỗ trợ' }))
    expect(
      await within(dialog).findByText(/Không tìm được toạ độ từ địa chỉ đã nhập/),
    ).toBeInTheDocument()
  })

  it('edits a point with its current values filled in', async () => {
    const user = userEvent.setup()
    vi.spyOn(adminSupportPointService, 'list').mockResolvedValue(pageOf([NGU_HANH_SON]))
    const update = vi
      .spyOn(adminSupportPointService, 'update')
      .mockResolvedValue({ ...NGU_HANH_SON, phoneNumber: '114' })
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Sửa Đội PCCC Ngũ Hành Sơn' }))
    const dialog = screen.getByRole('dialog', { name: 'Sửa điểm hỗ trợ' })
    expect(within(dialog).getByLabelText(label('Vĩ độ'))).toHaveValue('15.994224')
    const phone = within(dialog).getByLabelText(label('Số điện thoại'))
    await user.clear(phone)
    await user.type(phone, '114')
    await user.click(within(dialog).getByRole('button', { name: 'Lưu thay đổi' }))

    expect(update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ phoneNumber: '114', latitude: 15.994224, longitude: 108.237739 }),
    )
    expect(
      await screen.findByText('Đã lưu thay đổi của Đội PCCC Ngũ Hành Sơn.'),
    ).toBeInTheDocument()
  })

  it('deletes a point after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(adminSupportPointService, 'list').mockResolvedValue(pageOf([NGU_HANH_SON, DIEN_BAN]))
    const remove = vi.spyOn(adminSupportPointService, 'remove').mockResolvedValue()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Xoá Đội PCCC Điện Bàn' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Xoá điểm hỗ trợ?' })
    await user.click(within(dialog).getByRole('button', { name: 'Xoá điểm hỗ trợ' }))

    expect(remove).toHaveBeenCalledWith(2)
    expect(await screen.findByText('Đã xoá điểm hỗ trợ Đội PCCC Điện Bàn.')).toBeInTheDocument()
  })

  it('imports points from Excel and lists the rows to fix', async () => {
    const user = userEvent.setup()
    vi.spyOn(adminSupportPointService, 'list').mockResolvedValue(pageOf([NGU_HANH_SON]))
    const importPoints = vi
      .spyOn(adminSupportPointService, 'importPoints')
      .mockRejectedValueOnce({
        status: 400,
        code: 'VRC-400-602',
        message: 'Some rows of the file are invalid; nothing was imported',
        fieldErrors: [
          {
            field: 'rows[4].latitude',
            rejectedValue: 'mười sáu',
            message: 'Coordinate must be a number like 15.994224',
          },
          { field: 'rows[3].longitude', rejectedValue: '', message: 'Longitude is required' },
          {
            field: 'rows[3].latitude',
            rejectedValue: 95,
            message: 'Latitude must be between -90 and 90',
          },
        ],
      })
      .mockResolvedValue({ importedCount: 40 })
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Import Excel' }))
    const dialog = screen.getByRole('dialog', { name: 'Import điểm hỗ trợ từ Excel' })
    expect(within(dialog).getByRole('link', { name: /Tải file mẫu/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/\/api\/v1\/support-points\/import-template$/),
    )
    await user.click(within(dialog).getByRole('button', { name: 'Import' }))
    expect(within(dialog).getByText('Vui lòng chọn file Excel điểm hỗ trợ')).toBeInTheDocument()

    const file = new File(['xlsx'], 'diem-ho-tro.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    await user.upload(within(dialog).getByLabelText(label('File điểm hỗ trợ')), file)
    await user.click(within(dialog).getByRole('button', { name: 'Import' }))

    expect(importPoints).toHaveBeenCalledWith(file)
    const rows = await within(dialog).findByRole('list', { name: 'Các dòng cần sửa' })
    expect(
      within(rows)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual([
      'Dòng 3: Kinh độ đang để trống; Vĩ độ “95” phải từ -90 đến 90',
      'Dòng 4: Vĩ độ “mười sáu” không phải là số (vd. 15.994224)',
    ])

    await user.click(within(dialog).getByRole('button', { name: 'Import' }))
    expect(await screen.findByText('Đã thêm 40 điểm hỗ trợ từ file Excel.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
