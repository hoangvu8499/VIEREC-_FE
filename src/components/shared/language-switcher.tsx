import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/utils/cn'

import styles from './language-switcher.module.css'

const LANGUAGES = [
  { code: 'vi', label: 'VI' },
  { code: 'en', label: 'EN' },
] as const

type LanguageCode = (typeof LANGUAGES)[number]['code']

interface LanguageSwitcherProps {
  className?: string
}

/** Chọn ngôn ngữ — hiện chỉ là UI, chưa gắn i18n. */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const [language, setLanguage] = useState<LanguageCode>('vi')

  return (
    <div className={cn(styles.wrapper, className)}>
      <select
        aria-label="Ngôn ngữ"
        className={styles.select}
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
      <ChevronDown className={styles.chevron} size={16} aria-hidden />
    </div>
  )
}
