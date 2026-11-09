/** Thông tin pháp lý của trung tâm, theo Hồ sơ năng lực VIEREC (10/2026). */
export const COMPANY = {
  SHORT_NAME: 'VIEREC',
  NAME: 'Trung tâm Ứng phó sự cố khẩn cấp Việt Nam',
  INTERNATIONAL_NAME: 'Vietnam Emergency Incident Response Center',
  ADDRESS: '16 Ngô Tử Hạ, Phường An Khê, Thành phố Đà Nẵng',
  TAX_CODE: '0402358074',
  LEGAL_REPRESENTATIVE: 'Lê Đức Anh',
  /** Cơ quan quyết định thành lập và quản lý trực tiếp. */
  PARENT_COMPANY: 'Công ty Cổ phần Ứng phó sự cố khẩn cấp Việt Nam',
} as const

export const CONTACT = {
  HOTLINE: '0917 553 886',
  PHONE: '02363 568 959',
  EMAIL: 'info@vierec.vn',
  WEBSITE: 'https://vierec.vn',
  SOCIAL: {
    FACEBOOK: 'https://facebook.com',
    YOUTUBE: 'https://youtube.com',
    LINKEDIN: 'https://linkedin.com',
  },
} as const

/** Sứ mệnh của trung tâm, dùng làm slogan. */
export const SLOGAN =
  'Nâng cao năng lực phòng ngừa và ứng phó sự cố, kiến tạo vì một Việt Nam an toàn và phát triển bền vững'

/** Khẩu hiệu cam kết trong hồ sơ năng lực. */
export const MOTTO = 'An toàn là giá trị cốt lõi – Ứng phó là năng lực – Bền vững là tương lai'

export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, '')}`
