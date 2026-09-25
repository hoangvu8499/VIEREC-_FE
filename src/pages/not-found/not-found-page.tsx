import { Link } from 'react-router'

import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'

export default function NotFoundPage() {
  useDocumentTitle('Not found')

  return (
    <section>
      <h1>404</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to={ROUTES.HOME}>Back to home</Link>
    </section>
  )
}
