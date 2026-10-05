import { CourseCard } from '@/components/shared/course-card'
import { ROUTES } from '@/constants/routes'
import { usePublishedCourses } from '@/hooks/use-published-courses'
import { HomeSection } from '@/pages/home/components/home-section'

import styles from './latest-courses.module.css'

/** Số khoá hiện trên trang chủ (một hàng 3 cột). */
const LIMIT = 3

/** Khoá học mới xuất bản. Lỗi hoặc chưa có khoá nào thì ẩn cả khối (trang chủ không hiện lỗi). */
export function LatestCourses() {
  const courses = usePublishedCourses({ page: 0 })
  const items = courses.data?.content.slice(0, LIMIT) ?? []

  if (courses.isError || (courses.isSuccess && items.length === 0)) return null

  return (
    <HomeSection
      id="latest-courses-title"
      eyebrow="Khoá học mới"
      title="Bắt đầu hành trình an toàn của bạn"
      viewAll={{ to: ROUTES.COURSES, label: 'Xem tất cả khoá học' }}
      white
    >
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
    </HomeSection>
  )
}
