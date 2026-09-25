import { createBrowserRouter } from 'react-router'

import { ROUTES } from '@/constants/routes'
import { UserLayout } from '@/layouts/user/user-layout'
import { ErrorPage } from '@/pages/error/error-page'

export const router = createBrowserRouter([
  // Nhánh trang user
  {
    element: <UserLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: ROUTES.HOME,
        lazy: async () => ({ Component: (await import('@/pages/home/home-page')).default }),
      },
      {
        path: ROUTES.REGISTER,
        lazy: async () => ({
          Component: (await import('@/pages/register/register-page')).default,
        }),
      },
      {
        path: ROUTES.NOT_FOUND,
        lazy: async () => ({
          Component: (await import('@/pages/not-found/not-found-page')).default,
        }),
      },
    ],
  },
  // Nhánh trang admin (sau): { path: '/admin', element: <AdminLayout />, children: [...] }
  // — lazy-load AdminLayout và bọc guard phân quyền.
])
