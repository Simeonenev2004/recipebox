import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import Loader from '../components/Loader/Loader.jsx'

function GuestRoute() {
  const { isAuthenticated, authLoading } = useAuth()

  if (authLoading) {
    return <Loader />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default GuestRoute
