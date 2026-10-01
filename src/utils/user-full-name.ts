import type { User } from '@/types/user'

/** Họ tên hiển thị kiểu Việt: `lastName` (họ, tên đệm) đứng trước `firstName`. */
export function userFullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.lastName} ${user.firstName}`.trim()
}

/** Chữ cái đầu cho avatar: chữ đầu của họ + của tên cuối, vd. "Nguyễn Văn An" → "NA". */
export function userInitials(user: Pick<User, 'firstName' | 'lastName' | 'username'>): string {
  const words = userFullName(user).split(/\s+/).filter(Boolean)
  const first = words[0]
  const last = words.length > 1 ? words[words.length - 1] : undefined
  const initials = `${first?.[0] ?? ''}${last?.[0] ?? ''}` || user.username.slice(0, 2)
  return initials.toLocaleUpperCase('vi-VN')
}
