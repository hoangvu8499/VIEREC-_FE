import { Link, type LinkProps } from 'react-router'

import { buttonClass, type ButtonStyleProps } from '@/components/common/button-class'

interface ButtonLinkProps extends LinkProps, ButtonStyleProps {}

/** Link điều hướng có giao diện nút. */
export function ButtonLink({ variant, size, block, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass({ variant, size, block }, className)} {...props} />
}
