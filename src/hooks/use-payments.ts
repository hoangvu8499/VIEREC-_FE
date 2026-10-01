import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { PAYMENT_PAGE_SIZE, PAYMENT_QUERY_KEYS } from '@/constants/payment'
import { paymentService } from '@/services/payment-service'
import type { ApiError, PageResponse } from '@/types/api'
import type { Payment } from '@/types/payment'

export function useMyPayments(page = 0) {
  const params = { page, size: PAYMENT_PAGE_SIZE }
  return useQuery<PageResponse<Payment>, ApiError>({
    queryKey: PAYMENT_QUERY_KEYS.mine(params),
    queryFn: () => paymentService.listMine(params),
    placeholderData: keepPreviousData,
  })
}
