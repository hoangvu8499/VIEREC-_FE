import { BookOpen, ReceiptText, SearchX, Wallet } from 'lucide-react'

import { Button } from '@/components/common/button'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { StatCard } from '@/components/common/stat-card'
import { SelectField } from '@/components/form/select-field'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { CourseRevenueList } from '@/pages/admin/courses/components/course-revenue-list'
import { KeywordSearch } from '@/pages/admin/courses/components/keyword-search'
import { RevenueTable } from '@/pages/admin/courses/components/revenue-table'
import {
  monthLabel,
  monthOptions,
  useMonthlyRevenue,
  useRevenueParams,
} from '@/pages/admin/courses/use-revenue'
import { apiErrorMessage } from '@/utils/api-error-message'
import { formatVnd } from '@/utils/format-currency'

import styles from './components/course-list.module.css'
import revenueStyles from './components/revenue.module.css'

const numberFormatter = new Intl.NumberFormat('vi-VN')

/** Doanh thu theo tháng: chỉ các lượt đăng ký đã duyệt (đang học / đã hoàn thành), theo ngày duyệt. */
export default function RevenuePage() {
  useDocumentTitle('Doanh thu – Quản trị')
  const { month, keyword, page, setMonth, setKeyword, setPage } = useRevenueParams()
  const revenue = useMonthlyRevenue({ month, keyword, page })
  const data = revenue.data
  const label = monthLabel(month)

  return (
    <>
      <AdminPageHeader
        title="Doanh thu"
        description="Chỉ tính học phí của các lượt đăng ký đã duyệt (đang học hoặc đã hoàn thành), theo ngày duyệt. Yêu cầu chờ duyệt hoặc bị từ chối không được tính."
        action={
          <SelectField
            label="Tháng"
            options={monthOptions(month)}
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            fieldClassName={revenueStyles.monthPicker}
          />
        }
      />

      {revenue.isError ? (
        <AdminPanel>
          <EmptyState
            icon={Wallet}
            tone="danger"
            title="Không tải được doanh thu"
            description={apiErrorMessage(revenue.error, {
              fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            })}
            action={
              <Button variant="outline" onClick={() => void revenue.refetch()}>
                Thử lại
              </Button>
            }
          />
        </AdminPanel>
      ) : !data ? (
        <p className={styles.loading} aria-busy>
          Đang tải doanh thu…
        </p>
      ) : (
        <>
          <section className={revenueStyles.stats} aria-label={`Tổng quan tháng ${label}`}>
            <StatCard
              variant="card"
              icon={Wallet}
              value={formatVnd(data.amount)}
              label={`Tổng thu tháng ${label}`}
            />
            <StatCard
              variant="card"
              icon={ReceiptText}
              value={numberFormatter.format(data.enrollments)}
              label="Lượt đăng ký đã duyệt"
            />
            <StatCard
              variant="card"
              icon={BookOpen}
              value={numberFormatter.format(data.courses.length)}
              label="Khoá học có doanh thu"
            />
          </section>

          {data.courses.length > 0 && (
            <AdminPanel className={revenueStyles.breakdown} aria-labelledby="revenue-courses">
              <h2 id="revenue-courses" className={revenueStyles.panelTitle}>
                Theo khoá học
              </h2>
              <CourseRevenueList courses={data.courses} total={data.amount} />
            </AdminPanel>
          )}

          <AdminPanel aria-labelledby="revenue-items">
            <h2 id="revenue-items" className={revenueStyles.panelTitle}>
              Chi tiết khoản thu
            </h2>
            <p className={revenueStyles.panelNote}>
              Học viên nào đã trả, cho khoá nào, bao nhiêu. Mới duyệt gần nhất ở trên.
            </p>
            {/* key: ô tìm kiếm cập nhật theo URL khi bấm Back. */}
            <KeywordSearch
              key={keyword ?? ''}
              label="Tìm khoản thu"
              placeholder="Tên, username, SĐT học viên hoặc tên khoá học"
              keyword={keyword}
              onChange={setKeyword}
            />

            {data.items.content.length > 0 ? (
              <>
                <RevenueTable
                  enrollments={data.items.content}
                  isFetching={revenue.isPlaceholderData}
                />
                <div className={styles.footer}>
                  <p className={styles.summary}>
                    {numberFormatter.format(data.items.totalElements)} khoản
                    {keyword ? ' khớp tìm kiếm' : ''} · tổng{' '}
                    <span className={revenueStyles.matched}>{formatVnd(data.matchedAmount)}</span>
                  </p>
                  <Pagination
                    page={data.items.page}
                    totalPages={data.items.totalPages}
                    onChange={setPage}
                    label="Phân trang khoản thu"
                  />
                </div>
              </>
            ) : keyword ? (
              <EmptyState
                icon={SearchX}
                title={`Không có khoản thu nào khớp “${keyword}” trong tháng ${label}`}
                action={
                  <Button variant="outline" onClick={() => setKeyword(undefined)}>
                    Xem tất cả
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={ReceiptText}
                title={`Chưa có khoản thu nào trong tháng ${label}`}
                description="Khoản thu được tính khi admin duyệt yêu cầu đăng ký của học viên."
              />
            )}
          </AdminPanel>
        </>
      )}
    </>
  )
}
