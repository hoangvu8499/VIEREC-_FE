import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'

type InitialEntry = string | { pathname: string; search?: string; state?: unknown }

/**
 * Render các route trong data router (cần cho `useSearchParams`, `state`, `navigate`)
 * + QueryClient mới, không retry.
 */
export function renderRoutes(routes: RouteObject[], initialEntry: InitialEntry) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { ...view, router, queryClient }
}
