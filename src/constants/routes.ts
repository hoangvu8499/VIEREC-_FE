export const ROUTES = {
  HOME: '/',
  COURSES: '/khoa-hoc',
  INCIDENT_RESPONSE: '/ung-pho-su-co',
  ENTERPRISE: '/doanh-nghiep',
  LIBRARY: '/thu-vien',
  INSTRUCTORS: '/giang-vien',
  ABOUT: '/ve-vierec',
  NEWS: '/tin-tuc',
  CONTACT: '/lien-he',
  PARTNERS: '/doi-tac',
  EMERGENCY_REPORT: '/bao-su-co',
  SEARCH: '/tim-kiem',
  LOGIN: '/dang-nhap',
  REGISTER: '/dang-ky',
  NOT_FOUND: '*',
} as const

// Dự trù cho trang admin, ví dụ: export const ADMIN_ROUTES = { DASHBOARD: '/admin', ... } as const
