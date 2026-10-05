import { Check, Copy, Download, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/common/button'
import { buttonClass } from '@/components/common/button-class'
import { certificateVerifyPath } from '@/constants/routes'
import type { Certificate } from '@/types/course'
import { cn } from '@/utils/cn'
import { fileDownloadUrl, printPdf } from '@/utils/pdf-file'

import styles from './certificate-actions.module.css'

interface CertificateActionsProps {
  certificate: Certificate
  size?: 'sm' | 'md'
  /** `stack`: mỗi nút một dòng, rộng hết khung (cột bên của trang chi tiết). */
  layout?: 'row' | 'stack'
  /** Nút sao chép link tra cứu công khai; tắt ở dòng danh sách cho gọn. */
  withVerifyLink?: boolean
  className?: string
}

/** Tải PDF, in PDF và sao chép link tra cứu công khai của một chứng chỉ. */
export function CertificateActions({
  certificate,
  size = 'md',
  layout = 'row',
  withVerifyLink = true,
  className,
}: CertificateActionsProps) {
  const [printing, setPrinting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const print = async () => {
    setPrinting(true)
    try {
      await printPdf(certificate.fileUrl)
    } finally {
      setPrinting(false)
    }
  }

  const copyVerifyLink = async () => {
    const url = new URL(certificateVerifyPath(certificate.code), window.location.origin).toString()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      window.open(url, '_blank', 'noopener')
    }
  }

  const iconSize = size === 'sm' ? 16 : 18
  return (
    <div className={cn(styles.actions, layout === 'stack' && styles.stack, className)}>
      <a
        href={fileDownloadUrl(certificate.fileUrl)}
        download
        className={buttonClass({ variant: 'accent', size })}
        aria-label={`Tải chứng chỉ ${certificate.code} (PDF)`}
      >
        <Download size={iconSize} aria-hidden /> Tải PDF
      </a>
      <Button
        variant="outline"
        size={size}
        loading={printing}
        onClick={() => void print()}
        aria-label={`In chứng chỉ ${certificate.code}`}
      >
        {!printing && <Printer size={iconSize} aria-hidden />} In chứng chỉ
      </Button>
      {withVerifyLink && (
        <>
          <Button variant="ghost" size={size} onClick={() => void copyVerifyLink()}>
            {copied ? <Check size={iconSize} aria-hidden /> : <Copy size={iconSize} aria-hidden />}
            {copied ? 'Đã sao chép' : 'Sao chép link tra cứu'}
          </Button>
          <span className="sr-only" aria-live="polite">
            {copied ? 'Đã sao chép link tra cứu chứng chỉ' : ''}
          </span>
        </>
      )}
    </div>
  )
}
