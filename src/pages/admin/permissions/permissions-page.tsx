import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  Crown,
  GraduationCap,
  RotateCw,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { ROLE_LABELS, ROLE_ORDER, type RoleCode } from '@/constants/roles'
import { ADMIN_ROUTES } from '@/constants/routes'
import { USER_QUERY_KEYS } from '@/constants/user'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { roleService } from '@/services/role-service'
import type { ApiError } from '@/types/api'
import type { Role } from '@/types/user'
import { apiErrorMessage } from '@/utils/api-error-message'

import styles from './permissions-page.module.css'

/** Mô tả quyền hạn từng vai trò theo luật backend (`@PreAuthorize`, UserServiceImpl). */
const ROLE_DETAILS: Record<RoleCode, { icon: LucideIcon; abilities: string[] }> = {
  SUPER_ADMIN: {
    icon: Crown,
    abilities: [
      'Toàn bộ quyền của Quản trị viên',
      'Cấp hoặc gỡ vai trò Quản trị cấp cao',
      'Quản lý tài khoản Quản trị cấp cao khác',
    ],
  },
  ADMIN: {
    icon: ShieldCheck,
    abilities: [
      'Vào trang quản trị',
      'Quản lý khoá học và bài học',
      'Tạo, sửa, khoá, xoá tài khoản; gán vai trò Quản trị viên / Học viên',
    ],
  },
  BUSINESS: {
    icon: Building2,
    abilities: [
      'Tạo tài khoản học viên cho nhân viên doanh nghiệp mình',
      'Ghi danh nhân viên vào khoá học (admin duyệt sau khi nhận chuyển khoản)',
      'Theo dõi tiến độ, điểm thi, chứng chỉ của từng nhân viên',
      'Chỉ cấp qua trang Doanh nghiệp (tài khoản phải gắn với một doanh nghiệp)',
    ],
  },
  TRAINEE: {
    icon: GraduationCap,
    abilities: [
      'Xem khoá học đã xuất bản',
      'Mở tài liệu và video bài học khi đã đăng nhập',
      'Vai trò mặc định của tài khoản tự đăng ký',
    ],
  },
}

const RULES = [
  'Một tài khoản có thể có nhiều vai trò.',
  'Không ai tự thay đổi được vai trò của chính mình.',
  'Vai trò mới có hiệu lực từ lần đăng nhập tiếp theo của người dùng (tối đa 30 phút).',
]

function rank(code: string): number {
  const index = ROLE_ORDER.indexOf(code as RoleCode)
  return index < 0 ? ROLE_ORDER.length : index
}

export default function PermissionsPage() {
  useDocumentTitle('Phân quyền – Quản trị')
  const roles = useQuery<Role[], ApiError>({
    queryKey: USER_QUERY_KEYS.roles,
    queryFn: roleService.list,
    staleTime: 10 * 60_000,
  })

  return (
    <>
      <AdminPageHeader
        title="Phân quyền"
        description="Các vai trò trong hệ thống và quyền hạn của từng vai trò."
        action={
          <ButtonLink to={ADMIN_ROUTES.USERS} variant="accent">
            <Users size={18} aria-hidden /> Gán vai trò cho người dùng
          </ButtonLink>
        }
      />

      {roles.isPending ? (
        <AdminPanel>
          <p className={styles.loading} aria-busy>
            Đang tải vai trò…
          </p>
        </AdminPanel>
      ) : roles.isError ? (
        <AdminPanel>
          <EmptyState
            icon={RotateCw}
            tone="danger"
            title="Không tải được danh sách vai trò"
            description={apiErrorMessage(roles.error, {
              fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            })}
            action={
              <Button variant="outline" onClick={() => void roles.refetch()}>
                Thử lại
              </Button>
            }
          />
        </AdminPanel>
      ) : (
        <>
          <ul className={styles.roles}>
            {[...roles.data]
              .sort((a, b) => rank(a.code) - rank(b.code))
              .map((role) => {
                const details = ROLE_DETAILS[role.code as RoleCode]
                const Icon = details?.icon ?? ShieldCheck
                return (
                  <li key={role.code} className={styles.role}>
                    <span className={styles.icon}>
                      <Icon size={26} aria-hidden />
                    </span>
                    <h2 className={styles.roleName}>
                      {ROLE_LABELS[role.code as RoleCode] ?? role.name}
                    </h2>
                    <p className={styles.code}>{role.code}</p>
                    <p className={styles.description}>{role.description}</p>
                    {details && (
                      <ul className={styles.abilities}>
                        {details.abilities.map((ability) => (
                          <li key={ability}>{ability}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
          </ul>
          <section className={styles.rules} aria-labelledby="rules-title">
            <h2 id="rules-title" className={styles.rulesTitle}>
              Quy tắc gán vai trò
            </h2>
            <ul>
              {RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  )
}
