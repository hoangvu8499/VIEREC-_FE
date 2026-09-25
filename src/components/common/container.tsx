import type { HTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

import styles from './container.module.css'

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.container, className)} {...props} />
}
