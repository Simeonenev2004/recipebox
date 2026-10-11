import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

function GuestRoute() {
  const { isAuthenticated, authLoading } = useAuth()

  if (authLoading) {
    return <p>Loading...</p>
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default GuestRoute
