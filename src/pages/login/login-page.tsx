import { Link, useLocation, useNavigate } from 'react-router'

import { ADMIN_ROUTES, LEARNER_ROUTES, ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AuthShell } from '@/layouts/user/auth-shell'
import { LoginForm } from '@/pages/login/components/login-form'
import { getRedirectPath } from '@/pages/login/use-login'
import { isAdmin } from '@/utils/user-roles'

export default function LoginPage() {
  useDocumentTitle('Đăng nhập')
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <AuthShell
      titleId="login-title"
      title="Đăng nhập"
      subtitle="Chào mừng bạn quay lại VIEREC Academy."
      footer={
        <>
          Chưa có tài khoản? <Link to={ROUTES.REGISTER}>Đăng ký ngay</Link>
        </>
      }
    >
      <LoginForm
        onSuccess={({ user }) => {
          // Vào thẳng trang quản trị / góc học viên (trừ khi đang quay lại một trang cụ thể).
          const fallback = isAdmin(user) ? ADMIN_ROUTES.DASHBOARD : LEARNER_ROUTES.OVERVIEW
          void navigate(getRedirectPath(location.state, fallback), { replace: true })
        }}
      />
    </AuthShell>
  )
}
