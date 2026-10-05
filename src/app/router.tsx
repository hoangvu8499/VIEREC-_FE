import { createBrowserRouter } from 'react-router'

import { ADMIN_ROUTES, BUSINESS_ROUTES, LEARNER_ROUTES, ROUTES } from '@/constants/routes'
import { PageLoader } from '@/components/common/page-loader'
import { RequireRole } from '@/components/shared/require-role'
import { UserLayout } from '@/layouts/user/user-layout'
import { ErrorPage } from '@/pages/error/error-page'

export const router = createBrowserRouter([
  // Nhánh trang user
  {
    element: <UserLayout />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        path: ROUTES.HOME,
        lazy: async () => ({ Component: (await import('@/pages/home/home-page')).default }),
      },
      {
        path: ROUTES.COURSES,
        lazy: async () => ({ Component: (await import('@/pages/courses/courses-page')).default }),
      },
      {
        path: ROUTES.COURSE_DETAIL,
        lazy: async () => ({
          Component: (await import('@/pages/course-detail/course-detail-page')).default,
        }),
      },
      {
        // Cần đăng nhập: chưa đăng nhập thì sang trang đăng nhập rồi quay lại.
        path: ROUTES.FIND_RESPONDERS,
        lazy: async () => {
          const { default: FindRespondersPage } =
            await import('@/pages/find-responders/find-responders-page')
          return {
            element: (
              <RequireRole>
                <FindRespondersPage />
              </RequireRole>
            ),
          }
        },
      },
      {
        path: ROUTES.VERIFY_CERTIFICATE,
        lazy: async () => ({
          Component: (await import('@/pages/verify-certificate/verify-certificate-page')).default,
        }),
      },
      // Góc doanh nghiệp — BusinessLayout tự chặn (chỉ role BUSINESS).
      {
        path: BUSINESS_ROUTES.OVERVIEW,
        lazy: async () => ({
          Component: (await import('@/layouts/user/business-layout')).BusinessLayout,
        }),
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/pages/business/overview-page')).default,
            }),
          },
          {
            path: BUSINESS_ROUTES.MEMBER_CREATE,
            lazy: async () => ({
              Component: (await import('@/pages/business/member-create-page')).default,
            }),
          },
          {
            path: BUSINESS_ROUTES.MEMBER_DETAIL,
            lazy: async () => ({
              Component: (await import('@/pages/business/member-detail-page')).default,
            }),
          },
          {
            path: BUSINESS_ROUTES.CERTIFICATES,
            lazy: async () => ({
              Component: (await import('@/pages/business/certificates-page')).default,
            }),
          },
          {
            path: BUSINESS_ROUTES.CERTIFICATE_DETAIL,
            lazy: async () => ({
              Component: (await import('@/pages/business/certificate-detail-page')).default,
            }),
          },
          {
            path: BUSINESS_ROUTES.ENROLL,
            lazy: async () => ({
              Component: (await import('@/pages/business/enroll-page')).default,
            }),
          },
        ],
      },
      // Góc học viên — LearnerLayout tự chặn khi chưa đăng nhập.
      {
        path: LEARNER_ROUTES.OVERVIEW,
        lazy: async () => ({
          Component: (await import('@/layouts/user/learner-layout')).LearnerLayout,
        }),
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/pages/learner/overview-page')).default,
            }),
          },
          {
            path: LEARNER_ROUTES.MY_COURSES,
            lazy: async () => ({
              Component: (await import('@/pages/learner/my-courses-page')).default,
            }),
          },
          {
            path: LEARNER_ROUTES.LEARN,
            lazy: async () => ({
              Component: (await import('@/pages/learner/learn-page')).default,
            }),
          },
          {
            path: LEARNER_ROUTES.EXAM,
            lazy: async () => ({
              Component: (await import('@/pages/learner/exam-page')).default,
            }),
          },
          {
            path: LEARNER_ROUTES.PAYMENTS,
            lazy: async () => ({
              Component: (await import('@/pages/learner/payments-page')).default,
            }),
          },
          {
            path: LEARNER_ROUTES.ENROLL,
            lazy: async () => ({
              Component: (await import('@/pages/learner/enroll-page')).default,
            }),
          },
          {
            path: LEARNER_ROUTES.CERTIFICATES,
            lazy: async () => ({
              Component: (await import('@/pages/learner/certificates-page')).default,
            }),
          },
          {
            path: LEARNER_ROUTES.CERTIFICATE_DETAIL,
            lazy: async () => ({
              Component: (await import('@/pages/learner/certificate-detail-page')).default,
            }),
          },
          {
            path: LEARNER_ROUTES.PROFILE,
            lazy: async () => ({
              Component: (await import('@/pages/learner/profile-page')).default,
            }),
          },
        ],
      },
      {
        path: ROUTES.REGISTER,
        lazy: async () => ({
          Component: (await import('@/pages/register/register-page')).default,
        }),
      },
      {
        path: ROUTES.LOGIN,
        lazy: async () => ({ Component: (await import('@/pages/login/login-page')).default }),
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        lazy: async () => ({
          Component: (await import('@/pages/forgot-password/forgot-password-page')).default,
        }),
      },
      {
        path: ROUTES.RESET_PASSWORD,
        lazy: async () => ({
          Component: (await import('@/pages/reset-password/reset-password-page')).default,
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
  // Nhánh trang quản trị — AdminLayout tự chặn quyền (RequireRole ADMIN_ROLES).
  {
    path: ADMIN_ROUTES.DASHBOARD,
    lazy: async () => ({
      Component: (await import('@/layouts/admin/admin-layout')).AdminLayout,
    }),
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('@/pages/admin/dashboard/dashboard-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.COURSES,
        lazy: async () => ({
          Component: (await import('@/pages/admin/courses/courses-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.COURSE_CREATE,
        lazy: async () => ({
          Component: (await import('@/pages/admin/courses/course-create-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.COURSE_DETAIL,
        lazy: async () => ({
          Component: (await import('@/pages/admin/courses/course-detail-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.COURSE_EDIT,
        lazy: async () => ({
          Component: (await import('@/pages/admin/courses/course-edit-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.ENROLLMENT_REQUESTS,
        lazy: async () => ({
          Component: (await import('@/pages/admin/courses/enrollment-requests-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.REVENUE,
        lazy: async () => ({
          Component: (await import('@/pages/admin/courses/revenue-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.COURSE_ENROLLMENTS,
        lazy: async () => ({
          Component: (await import('@/pages/admin/courses/course-enrollments-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.COURSE_EXAM,
        lazy: async () => ({
          Component: (await import('@/pages/admin/courses/exam-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.LESSON_CREATE,
        lazy: async () => ({
          Component: (await import('@/pages/admin/courses/lesson-create-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.LESSON_EDIT,
        lazy: async () => ({
          Component: (await import('@/pages/admin/courses/lesson-edit-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.SUPPORT_POINTS,
        lazy: async () => ({
          Component: (await import('@/pages/admin/support-points/support-points-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.BUSINESSES,
        lazy: async () => ({
          Component: (await import('@/pages/admin/businesses/businesses-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.BUSINESS_CREATE,
        lazy: async () => ({
          Component: (await import('@/pages/admin/businesses/business-create-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.BUSINESS_DETAIL,
        lazy: async () => ({
          Component: (await import('@/pages/admin/businesses/business-detail-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.BUSINESS_MEMBER,
        lazy: async () => ({
          Component: (await import('@/pages/admin/businesses/business-member-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.USERS,
        lazy: async () => ({
          Component: (await import('@/pages/admin/users/users-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.USER_CREATE,
        lazy: async () => ({
          Component: (await import('@/pages/admin/users/user-create-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.USER_DETAIL,
        lazy: async () => ({
          Component: (await import('@/pages/admin/users/user-detail-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.USER_EDIT,
        lazy: async () => ({
          Component: (await import('@/pages/admin/users/user-edit-page')).default,
        }),
      },
      {
        path: ADMIN_ROUTES.PERMISSIONS,
        lazy: async () => ({
          Component: (await import('@/pages/admin/permissions/permissions-page')).default,
        }),
      },
      {
        path: '*',
        lazy: async () => ({
          Component: (await import('@/pages/admin/not-found/admin-not-found-page')).default,
        }),
      },
    ],
  },
])
