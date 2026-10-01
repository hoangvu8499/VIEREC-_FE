import { ArrowRight } from 'lucide-react'

import { ButtonLink } from '@/components/common/button-link'
import { Container } from '@/components/common/container'
import { CourseCard } from '@/components/shared/course-card'
import { ROUTES } from '@/constants/routes'
import { usePublishedCourses } from '@/hooks/use-published-courses'

import styles from './latest-courses.module.css'

/** Số khoá hiện trên trang chủ (lưới 3 cột × 2 hàng). */
const LIMIT = 6

/** Khoá học mới xuất bản. Lỗi hoặc chưa có khoá nào thì ẩn cả khối (trang chủ không hiện lỗi). */
export function LatestCourses() {
  const courses = usePublishedCourses({ page: 0 })
  const items = courses.data?.content.slice(0, LIMIT) ?? []

  if (courses.isError || (courses.isSuccess && items.length === 0)) return null

  return (
    <section className={styles.section} aria-labelledby="latest-courses-title">
      <Container>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Khoá học mới</p>
            <h2 id="latest-courses-title" className={styles.title}>
              Bắt đầu hành trình an toàn của bạn
            </h2>
            <p className={styles.subtitle}>
              Tìm hiểu mục tiêu và nội dung từng khoá trước khi đăng ký học.
            </p>
          </div>
          <ButtonLink to={ROUTES.COURSES} variant="outline" className={styles.viewAll}>
            Xem tất cả khoá học <ArrowRight size={18} aria-hidden />
          </ButtonLink>
        </div>

        {courses.isPending ? (
          <p className={styles.loading} aria-busy>
            Đang tải khoá học…
          </p>
        ) : (
          <ul className={styles.grid}>
            {items.map((course) => (
              <li key={course.id}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  )
}
