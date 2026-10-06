export const INDIVIDUAL_LEARNER_LABEL = 'Cá nhân học tập'

/** Đơn vị của học viên: tên doanh nghiệp quản lý tài khoản, không có thì là học viên tự đăng ký. */
export function learnerOrganization(businessName?: string | null): string {
  return businessName?.trim() || INDIVIDUAL_LEARNER_LABEL
}
