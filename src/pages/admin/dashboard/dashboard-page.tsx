import type { UseQueryResult } from '@tanstack/react-query'
import {
  ArrowRight,
  CalendarDays,
  CalendarRange,
  Hourglass,
  type LucideIcon,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router'

import { StatCard } from '@/components/common/stat-card'
import { ADMIN_NAV } from '@/constants/admin-navigation'
import { ADMIN_ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useDashboardStats } from '@/pages/admin/dashboard/use-dashboard-stats'
import { useAuthStore } from '@/stores/auth-store'
import type { RevenueSummary } from '@/types/course'
import { formatVnd } from '@/utils/format-currency'
import { hasAnyRole, primaryRoleLabel } from '@/utils/user-roles'
import { userFullName } from '@/utils/user-full-name'

import styles from './dashboard-page.module.css'

const todayFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const numberFormatter = new Intl.NumberFormat('vi-VN')

const dayMonthFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' })

const REVENUE_PERIODS: { key: keyof RevenueSummary; label: string; icon: LucideIcon }[] = [
  { key: 'week', label: 'Tuần này', icon: Wallet },
  { key: 'month', label: 'Tháng này', icon: CalendarDays },
  { key: 'year', label: 'Năm nay', icon: CalendarRange },
]

/** `2026-09-28` → `28/09` (ngày theo lịch, không qua múi giờ). */
function dayMonth(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return dayMonthFormatter.format(new Date(year ?? 0, (month ?? 1) - 1, day ?? 1))
}

/** Đang tải: "…", lỗi: "—". */
function statValue(query: UseQueryResult<number>): string {
  if (query.isPending) return '…'
  if (query.isError) return '—'
  return numberFormatter.format(query.data)
}

export default function DashboardPage() {
  useDocumentTitle('Tổng quan – Quản trị')
  const user = useAuthStore((state) => state.user)
  const { totalUsers, activeUsers, pendingEnrollments, revenue } = useDashboardStats()

  const modules = ADMIN_NAV.filter(
    (item) => item.path !== ADMIN_ROUTES.DASHBOARD && (!item.roles || hasAnyRole(user, item.roles)),
  )
  const statsFailed = totalUsers.isError || activeUsers.isError || pendingEnrollments.isError

  return (
    <div className={styles.page}>
      <section className={styles.welcome} aria-labelledby="dashboard-title">
        <div>
          <p className={styles.date}>{todayFormatter.format(new Date())}</p>
          <h1 id="dashboard-title" className={styles.title}>
            Xin chào, {user ? userFullName(user) || user.username : 'quản trị viên'}
          </h1>
          <p className={styles.subtitle}>Chào mừng bạn đến trang quản trị VIEREC Academy.</p>
        </div>
        {user && <span className={styles.role}>{primaryRoleLabel(user)}</span>}
      </section>

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className={styles.sectionTitle}>
          Số liệu
        </h2>
        <div className={styles.stats}>
          <StatCard
            variant="card"
            icon={Users}
            value={statValue(totalUsers)}
            label="Tổng tài khoản"
          />
          <StatCard
            variant="card"
            icon={UserCheck}
            value={statValue(activeUsers)}
            label="Đang hoạt động"
          />
          <Link to={ADMIN_ROUTES.ENROLLMENT_REQUESTS} className={styles.statLink}>
            <StatCard
              variant="card"
              icon={Hourglass}
              value={statValue(pendingEnrollments)}
              label="Đăng ký chờ duyệt"
            />
          </Link>
        </div>
        {statsFailed && (
          <p className={styles.statsError}>
            Không tải được số liệu. Vui lòng tải lại trang sau ít phút.
          </p>
        )}
      </section>

      <section aria-labelledby="revenue-title">
        <h2 id="revenue-title" className={styles.sectionTitle}>
          Doanh thu
        </h2>
        <p className={styles.sectionNote}>
          Tổng học phí của các lượt đăng ký đã duyệt, tính theo ngày duyệt. Tuần tính từ thứ Hai.
        </p>
        <div className={styles.stats}>
          {REVENUE_PERIODS.map(({ key, label, icon }) => {
            const period = revenue.data?.[key]
            const card = (
              <StatCard
                variant="card"
                icon={icon}
                value={revenue.isPending ? '…' : period ? formatVnd(period.amount) : '—'}
                label={
                  period
                    ? `${label} (từ ${dayMonth(period.from)}) · ${numberFormatter.format(period.enrollments)} lượt`
                    : label
                }
              />
            )
            // Chi tiết từng khoản thu xem theo tháng.
            return key === 'month' ? (
              <Link key={key} to={ADMIN_ROUTES.REVENUE} className={styles.statLink}>
                {card}
              </Link>
            ) : (
              <Fragment key={key}>{card}</Fragment>
            )
          })}
        </div>
        {revenue.isError && (
          <p className={styles.statsError}>
            Không tải được doanh thu. Vui lòng tải lại trang sau ít phút.
          </p>
        )}
      </section>

      <section aria-labelledby="modules-title">
        <h2 id="modules-title" className={styles.sectionTitle}>
          Phân hệ quản lý
        </h2>
        <ul className={styles.modules}>
          {modules.map(({ label, path, icon: Icon, description }) => (
            <li key={path}>
              <Link to={path} className={styles.module}>
                {Icon && (
                  <span className={styles.moduleIcon}>
                    <Icon size={24} aria-hidden />
                  </span>
                )}
                <span className={styles.moduleName}>{label}</span>
                {description && <span className={styles.moduleDescription}>{description}</span>}
                <span className={styles.moduleOpen}>
                  Mở <ArrowRight size={16} aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
