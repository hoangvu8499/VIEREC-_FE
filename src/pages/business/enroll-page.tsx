import { BookOpen, CalendarPlus, CircleCheck, Users } from 'lucide-react'
import { useState } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { QrCode } from '@/components/common/qr-code'
import { CheckboxField } from '@/components/form/checkbox-field'
import { RadioGroupField } from '@/components/form/radio-group-field'
import { TextField } from '@/components/form/text-field'
import { ENROLLMENT_STATUS_LABELS } from '@/constants/course'
import { BANK_ACCOUNT, businessTransferContent } from '@/constants/payment'
import { BUSINESS_ROUTES } from '@/constants/routes'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { usePublishedCourses } from '@/hooks/use-published-courses'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import {
  businessErrorMessage,
  enrollErrorMessage,
  useBusinessEnroll,
  useMyBusiness,
  useMyMembers,
} from '@/pages/business/use-my-business'
import type { BusinessEnrollResult } from '@/types/business'
import type { Course } from '@/types/course'
import { cn } from '@/utils/cn'
import { formatVnd } from '@/utils/format-currency'
import { vietQrPayload } from '@/utils/viet-qr'

import styles from './business.module.css'

/** Tối đa backend nhận trong một trang (`MAX_PAGE_SIZE`): đủ cho danh sách chọn học viên. */
const MEMBERS_PICK_SIZE = 100

function EnrollResult({
  result,
  businessId,
  onAgain,
}: {
  result: BusinessEnrollResult
  businessId: number
  onAgain: () => void
}) {
  const content = businessTransferContent(result.courseId, businessId)
  return (
    <section
      className={cn(styles.panel, styles.padded, styles.result)}
      aria-label="Kết quả đăng ký"
    >
      <Alert variant="success" title={`Đã gửi đăng ký khoá ${result.courseName}`}>
        {result.enrolled.length > 0
          ? `${result.enrolled.length} học viên đang chờ duyệt. Chuyển khoản học phí theo thông tin dưới đây; VIEREC đối chiếu rồi mở khoá học cho từng người.`
          : 'Không có lượt đăng ký mới: các học viên đã chọn đều đã đăng ký khoá này.'}
      </Alert>

      {result.totalAmount > 0 && (
        <div className={styles.qr}>
          <QrCode
            className={styles.qrImage}
            value={vietQrPayload({ ...BANK_ACCOUNT, amount: result.totalAmount, content })}
            label={`Mã QR chuyển ${formatVnd(result.totalAmount)} tới ${BANK_ACCOUNT.bankName}`}
          />
          <dl className={styles.transfer}>
            <div>
              <dt>Ngân hàng</dt>
              <dd>{BANK_ACCOUNT.bankName}</dd>
            </div>
            <div>
              <dt>Số tài khoản</dt>
              <dd>{BANK_ACCOUNT.accountNumber}</dd>
            </div>
            <div>
              <dt>Chủ tài khoản</dt>
              <dd>{BANK_ACCOUNT.accountName}</dd>
            </div>
            <div>
              <dt>Số tiền</dt>
              <dd>{formatVnd(result.totalAmount)}</dd>
            </div>
            <div>
              <dt>Nội dung</dt>
              <dd>{content}</dd>
            </div>
          </dl>
        </div>
      )}

      {result.enrolled.length > 0 && (
        <div>
          <strong>Chờ duyệt ({result.enrolled.length})</strong>
          <ul className={styles.names}>
            {result.enrolled.map((enrollment) => (
              <li key={enrollment.id}>
                {enrollment.fullName} · {formatVnd(enrollment.price)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.skipped.length > 0 && (
        <div>
          <strong>Bỏ qua vì đã đăng ký ({result.skipped.length})</strong>
          <ul className={styles.names}>
            {result.skipped.map((member) => (
              <li key={member.userId}>
                {member.fullName} · {ENROLLMENT_STATUS_LABELS[member.status]}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.formFooter}>
        <ButtonLink to={BUSINESS_ROUTES.OVERVIEW} variant="ghost">
          Về danh sách học viên
        </ButtonLink>
        <Button variant="outline" onClick={onAgain}>
          <CalendarPlus size={18} aria-hidden /> Đăng ký khoá khác
        </Button>
      </div>
    </section>
  )
}

/** Doanh nghiệp ghi danh nhiều học viên vào một khoá, rồi chuyển khoản tổng học phí. */
export default function BusinessEnrollPage() {
  useDocumentTitle('Đăng ký khoá học – Góc doanh nghiệp')
  const business = useMyBusiness()
  const [courseKeyword, setCourseKeyword] = useState('')
  const [coursePage, setCoursePage] = useState(0)
  const debouncedKeyword = useDebouncedValue(courseKeyword.trim())
  const courses = usePublishedCourses({ page: coursePage, keyword: debouncedKeyword || undefined })
  const members = useMyMembers({ page: 0, size: MEMBERS_PICK_SIZE })
  const enroll = useBusinessEnroll()

  const [course, setCourse] = useState<Pick<Course, 'id' | 'name' | 'price'>>()
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set())
  const [memberFilter, setMemberFilter] = useState('')

  const allMembers = members.data?.content ?? []
  const filter = memberFilter.trim().toLowerCase()
  const visibleMembers = filter
    ? allMembers.filter((member) =>
        `${member.fullName} ${member.username} ${member.phoneNumber}`
          .toLowerCase()
          .includes(filter),
      )
    : allMembers
  const allVisibleSelected =
    visibleMembers.length > 0 && visibleMembers.every((member) => selected.has(member.id))

  const toggle = (id: number) =>
    setSelected((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const toggleVisible = () =>
    setSelected((previous) => {
      const next = new Set(previous)
      for (const member of visibleMembers) {
        if (allVisibleSelected) next.delete(member.id)
        else next.add(member.id)
      }
      return next
    })

  if (enroll.data && business.data) {
    return (
      <>
        <AccountPageHeader
          title="Đăng ký khoá học"
          description="Đăng ký đã được gửi. Chuyển khoản để VIEREC mở khoá học cho học viên."
        />
        <EnrollResult
          result={enroll.data}
          businessId={business.data.id}
          onAgain={() => {
            enroll.reset()
            setSelected(new Set())
            setCourse(undefined)
          }}
        />
      </>
    )
  }

  const canSubmit = Boolean(course) && selected.size > 0
  const submit = () => {
    if (!course) return
    enroll.mutate({ courseId: course.id, userIds: [...selected] })
  }

  return (
    <>
      <AccountPageHeader
        title="Đăng ký khoá học"
        description="Chọn khoá học và các học viên. Học viên đã đăng ký khoá đó sẽ được bỏ qua."
      />

      {business.isError && (
        <Alert variant="error">
          {businessErrorMessage(business.error, 'Không mở được Góc doanh nghiệp.')}
        </Alert>
      )}

      <section className={cn(styles.panel, styles.padded)} aria-labelledby="enroll-course-title">
        <h2 id="enroll-course-title" className={styles.panelTitle}>
          1. Chọn khoá học
        </h2>
        <TextField
          label="Tìm khoá học"
          type="search"
          placeholder="Tên khoá học"
          value={courseKeyword}
          onChange={(event) => {
            setCourseKeyword(event.target.value)
            setCoursePage(0)
          }}
        />
        {courses.isPending ? (
          <p className={styles.loading} aria-busy>
            Đang tải khoá học…
          </p>
        ) : courses.isError ? (
          <Alert variant="error">Không tải được danh sách khoá học. Vui lòng tải lại trang.</Alert>
        ) : courses.data.content.length === 0 ? (
          <EmptyState icon={BookOpen} title="Không có khoá học phù hợp" />
        ) : (
          <>
            <RadioGroupField
              label="Khoá học"
              name="courseId"
              options={courses.data.content.map((item) => ({
                value: String(item.id),
                label: item.name,
                hint: `${formatVnd(item.price)} / học viên · ${item.lessonCount} bài học`,
              }))}
              value={course ? String(course.id) : ''}
              onChange={(event) => {
                const picked = courses.data.content.find(
                  (item) => String(item.id) === event.target.value,
                )
                if (picked) setCourse(picked)
              }}
            />
            {courses.data.totalPages > 1 && (
              <Pagination
                page={courses.data.page}
                totalPages={courses.data.totalPages}
                onChange={setCoursePage}
                label="Phân trang khoá học"
              />
            )}
          </>
        )}
      </section>

      <section className={cn(styles.panel, styles.padded)} aria-labelledby="enroll-members-title">
        <h2 id="enroll-members-title" className={styles.panelTitle}>
          2. Chọn học viên
        </h2>
        {members.isPending ? (
          <p className={styles.loading} aria-busy>
            Đang tải học viên…
          </p>
        ) : members.isError ? (
          <Alert variant="error">
            {businessErrorMessage(members.error, 'Không tải được danh sách học viên.')}
          </Alert>
        ) : allMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Doanh nghiệp chưa có học viên"
            action={
              <ButtonLink to={BUSINESS_ROUTES.MEMBER_CREATE} variant="accent">
                Thêm học viên
              </ButtonLink>
            }
          />
        ) : (
          <>
            <TextField
              label="Lọc học viên"
              type="search"
              placeholder="Họ tên, tên đăng nhập hoặc SĐT"
              value={memberFilter}
              onChange={(event) => setMemberFilter(event.target.value)}
            />
            <div className={styles.checkAll}>
              <CheckboxField
                label={`Chọn tất cả (${visibleMembers.length})`}
                checked={allVisibleSelected}
                disabled={visibleMembers.length === 0}
                onChange={toggleVisible}
              />
              <span className={styles.summary}>Đã chọn {selected.size} học viên</span>
            </div>
            <ul className={styles.memberChecks} aria-label="Học viên">
              {visibleMembers.map((member) => (
                <li key={member.id}>
                  <CheckboxField
                    label={member.fullName}
                    hint={`@${member.username} · ${member.phoneNumber}`}
                    checked={selected.has(member.id)}
                    onChange={() => toggle(member.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className={cn(styles.panel, styles.padded, styles.result)} aria-label="Gửi đăng ký">
        {enroll.isError && <Alert variant="error">{enrollErrorMessage(enroll.error)}</Alert>}
        <div className={styles.total}>
          <span>
            {course ? `${course.name} × ${selected.size} học viên` : 'Chưa chọn khoá học'}
          </span>
          <strong>{formatVnd((course?.price ?? 0) * selected.size)}</strong>
        </div>
        <p className={styles.summary}>
          Số tiền cuối cùng tính sau khi bỏ qua học viên đã đăng ký khoá này; mã QR chuyển khoản
          hiện sau khi gửi.
        </p>
        <div className={styles.formFooter}>
          <Button
            variant="accent"
            disabled={!canSubmit}
            loading={enroll.isPending}
            onClick={submit}
          >
            <CircleCheck size={18} aria-hidden /> Gửi đăng ký
          </Button>
        </div>
      </section>
    </>
  )
}
