import { useAuth } from './useAuth'
import { Navigate } from 'react-router-dom'
import { PageLoader } from '../../components/ui/PageLoader'

/**
 * AuthGuard — Protects admin routes
 * Redirects to /login if not authenticated
 */
export function AuthGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />

  return children
}
