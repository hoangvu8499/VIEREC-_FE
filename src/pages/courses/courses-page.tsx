import { BookOpenCheck, GraduationCap, RotateCw, Search, SearchX } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/common/button'
import { Container } from '@/components/common/container'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { TextField } from '@/components/form/text-field'
import { CourseCard } from '@/components/shared/course-card'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { usePublishedCourses } from '@/hooks/use-published-courses'
import { usePublishedCourseParams } from '@/hooks/use-published-course-params'
import { apiErrorMessage } from '@/utils/api-error-message'

import styles from './courses-page.module.css'

const numberFormatter = new Intl.NumberFormat('vi-VN')

/** Thẻ giả trong lúc tải. */
function CourseSkeletons() {
  return (
    <ul className={styles.grid} aria-hidden>
      {[0, 1, 2].map((item) => (
        <li key={item} className={styles.skeleton}>
          <span className={styles.skeletonCover} />
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonLineShort} />
        </li>
      ))}
    </ul>
  )
}

export default function CoursesPage() {
  useDocumentTitle('Khoá học')
  const { page, keyword, setPage, setKeyword } = usePublishedCourseParams()
  const courses = usePublishedCourses({ page, keyword })
  const [draft, setDraft] = useState(keyword ?? '')

  const data = courses.data

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="courses-title">
        <Container className={styles.heroInner}>
          <p className={styles.eyebrow}>
            <GraduationCap size={18} aria-hidden /> VIEREC Academy
          </p>
          <h1 id="courses-title" className={styles.title}>
            Khoá học an toàn – ứng phó sự cố – môi trường
          </h1>
          <p className={styles.subtitle}>
            Chương trình đào tạo thực tiễn cho cá nhân và doanh nghiệp. Chọn khoá học để xem mục
            tiêu, nội dung từng bài và tài liệu đi kèm.
          </p>
          {data && !keyword && data.totalElements > 0 && (
            <p className={styles.count}>
              <BookOpenCheck size={18} aria-hidden />
              <strong>{numberFormatter.format(data.totalElements)}</strong> khoá học đang mở
            </p>
          )}
        </Container>
      </section>

      <Container className={styles.content}>
        <search className={styles.search}>
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
              fieldClassName={styles.searchField}
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
                Xem tất cả khoá học
              </button>
            </p>
          )}
        </search>

        {courses.isPending ? (
          <CourseSkeletons />
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
                  <CourseCard course={course} headingLevel="h2" />
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
            title="Khoá học sắp ra mắt"
            description="Các khoá học đang được chuẩn bị. Vui lòng quay lại sau."
          />
        )}
      </Container>
    </div>
  )
}
