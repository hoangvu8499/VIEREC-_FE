import { ChevronRight, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router'

import type { BusinessMember } from '@/types/business'
import { cn } from '@/utils/cn'
import { userInitials } from '@/utils/user-full-name'

import styles from './business-member-list.module.css'

interface BusinessMemberListProps {
  members: BusinessMember[]
  /** Link tới trang tiến độ của học viên (admin và doanh nghiệp khác đường dẫn). */
  memberHref: (memberId: number) => string
  isFetching?: boolean
}

/** Học viên của doanh nghiệp: liên hệ và số khoá theo trạng thái; bấm vào để xem tiến độ. */
export function BusinessMemberList({ members, memberHref, isFetching }: BusinessMemberListProps) {
  return (
    <ul className={cn(styles.list, isFetching && styles.fetching)} aria-busy={isFetching}>
      {members.map((member) => (
        <li key={member.id} className={styles.item}>
          <span className={styles.avatar} aria-hidden>
            {userInitials(member)}
          </span>
          <div className={styles.main}>
            <Link to={memberHref(member.id)} className={styles.name}>
              {member.fullName || member.username}
              <span className="sr-only"> – xem tiến độ học tập</span>
            </Link>
            <p className={styles.contact}>
              <span>@{member.username}</span>
              <span>
                <Phone size={14} aria-hidden /> {member.phoneNumber}
              </span>
              <span className={styles.email}>
                <Mail size={14} aria-hidden /> {member.email}
              </span>
            </p>
          </div>
          <dl className={styles.counts}>
            <div>
              <dt>Chờ duyệt</dt>
              <dd>{member.pendingCount}</dd>
            </div>
            <div>
              <dt>Đang học</dt>
              <dd>{member.learningCount}</dd>
            </div>
            <div>
              <dt>Hoàn thành</dt>
              <dd>{member.completedCount}</dd>
            </div>
            <div>
              <dt>Chứng chỉ</dt>
              <dd>{member.certificateCount}</dd>
            </div>
          </dl>
          <ChevronRight className={styles.chevron} size={20} aria-hidden />
        </li>
      ))}
    </ul>
  )
}
