import { GraduationCap, RotateCw, Search, SearchX } from 'lucide-react'
import { useState } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { TextField } from '@/components/form/text-field'
import { CourseCard } from '@/components/shared/course-card'
import { EnrollAction } from '@/components/shared/enroll-action'
import { LEARNER_ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { usePublishedCourseParams } from '@/hooks/use-published-course-params'
import { usePublishedCourses } from '@/hooks/use-published-courses'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import { apiErrorMessage } from '@/utils/api-error-message'

import styles from './enroll-page.module.css'

const numberFormatter = new Intl.NumberFormat('vi-VN')

export default function EnrollPage() {
  useDocumentTitle('Đăng ký khoá học')
  const { page, keyword, setPage, setKeyword } = usePublishedCourseParams()
  // Khoá đã được duyệt / đã hoàn thành nằm ở "Khoá học của tôi", không hiện lại ở đây.
  const courses = usePublishedCourses({ page, keyword, excludeLearning: true })
  const [draft, setDraft] = useState(keyword ?? '')
  const data = courses.data

  return (
    <>
      <AccountPageHeader
        title="Đăng ký khoá học"
        description={
          data && !keyword && data.totalElements > 0
            ? `${numberFormatter.format(data.totalElements)} khoá học bạn có thể đăng ký. Chọn khoá để xem nội dung và bắt đầu học.`
            : 'Chọn khoá học để xem nội dung và bắt đầu học.'
        }
      />

      <Alert title="Cách đăng ký">
        Bấm “Đăng ký khoá học”, quét mã QR để chuyển khoản học phí rồi bấm “Đã thanh toán”. Sau khi
        quản trị viên duyệt, khoá học mở trong “Khoá học của tôi”. Chứng chỉ được cấp theo thông tin
        trong hồ sơ.
      </Alert>

      <section className={styles.panel} aria-label="Khoá học đang mở">
        <search>
          <form
            className={styles.searchForm}
            onSubmit={(event) => {
              event.preventDefault()
              setKeyword(draft.trim() || undefined)
            }}
          >
            <TextField
              label="Tìm khoá học"
              type="search"
              placeholder="Nhập tên khoá học, vd. phòng cháy chữa cháy"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button type="submit" variant="accent" className={styles.searchButton}>
              <Search size={18} aria-hidden /> Tìm kiếm
            </Button>
          </form>
          {keyword && data && (
            <p className={styles.resultNote}>
              {data.totalElements > 0
                ? `Tìm thấy ${numberFormatter.format(data.totalElements)} khoá học cho “${keyword}”.`
                : `Không có khoá học nào khớp “${keyword}”.`}{' '}
              <button
                type="button"
                className={styles.clear}
                onClick={() => {
                  setDraft('')
                  setKeyword(undefined)
                }}
              >
                Xem tất cả
              </button>
            </p>
          )}
        </search>

        {courses.isPending ? (
          <p className={styles.loading} aria-busy>
            Đang tải khoá học…
          </p>
        ) : courses.isError ? (
          <EmptyState
            icon={RotateCw}
            tone="danger"
            title="Không tải được danh sách khoá học"
            description={apiErrorMessage(courses.error, {
              fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            })}
            action={
              <Button variant="outline" onClick={() => void courses.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : data && data.content.length > 0 ? (
          <>
            <ul
              className={styles.grid}
              aria-label="Danh sách khoá học"
              aria-busy={courses.isPlaceholderData}
            >
              {data.content.map((course) => (
                <li key={course.id}>
                  <CourseCard
                    course={course}
                    headingLevel="h2"
                    action={<EnrollAction course={course} variant="card" />}
                  />
                </li>
              ))}
            </ul>
            <Pagination
              className={styles.pagination}
              page={data.page}
              totalPages={data.totalPages}
              onChange={(next) => {
                setPage(next)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              label="Phân trang khoá học"
            />
          </>
        ) : keyword ? (
          <EmptyState
            icon={SearchX}
            title="Không tìm thấy khoá học phù hợp"
            description="Thử từ khoá ngắn hơn hoặc tên lĩnh vực, vd. “PCCC”, “hoá chất”, “môi trường”."
          />
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="Chưa có khoá học mới để đăng ký"
            description="Bạn đã đăng ký mọi khoá học đang mở, hoặc khoá học đang được chuẩn bị. Vui lòng quay lại sau."
            action={
              <ButtonLink to={LEARNER_ROUTES.MY_COURSES} variant="outline">
                Xem khoá học của tôi
              </ButtonLink>
            }
          />
        )}
      </section>
    </>
  )
}
