import { crc16, vietQrPayload } from '@/utils/viet-qr'

describe('vietQrPayload', () => {
  it('computes the checksum the bank put on the static QR', () => {
    // Mã QR tĩnh TPBank cấp cho tài khoản nhận học phí, CRC 54B2.
    const staticQr =
      '00020101021138550010A000000727012500069704230111083431441410208QRIBFTTA' +
      '5204513753037045802VN5917TON THAT HOANG VU6006Ha Noi8707CLASSIC6304'
    expect(crc16(staticQr)).toBe('54B2')
  })

  it('carries the account, amount and transfer content', () => {
    const payload = vietQrPayload({
      bankBin: '970423',
      accountNumber: '08343144141',
      accountName: 'TON THAT HOANG VU',
      amount: 100000,
      content: 'VIEREC KH7 HV12',
    })

    expect(payload).toBe(
      '00020101021238550010A000000727012500069704230111083431441410208QRIBFTTA' +
        '52045137530370454061000005802VN5917TON THAT HOANG VU6006Ha Noi' +
        '62190815VIEREC KH7 HV126304' +
        crc16(payload.slice(0, -4)),
    )
  })
})
