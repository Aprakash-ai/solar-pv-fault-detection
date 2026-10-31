import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p style={{ padding: 48, color: 'var(--mist)' }}>Loading…</p>
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}