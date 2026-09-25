import { Siren } from 'lucide-react'

import { ButtonLink } from '@/components/common/button-link'
import type { ButtonSize } from '@/components/common/button-class'
import { ROUTES } from '@/constants/routes'

interface EmergencyReportButtonProps {
  size?: ButtonSize
  block?: boolean
  className?: string
}

export function EmergencyReportButton({
  size = 'md',
  block,
  className,
}: EmergencyReportButtonProps) {
  return (
    <ButtonLink
      to={ROUTES.EMERGENCY_REPORT}
      variant="danger"
      size={size}
      block={block}
      className={className}
    >
      <Siren size={20} aria-hidden />
      BÁO SỰ CỐ KHẨN CẤP
    </ButtonLink>
  )
}
