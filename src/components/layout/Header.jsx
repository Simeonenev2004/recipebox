import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import './Header.css'

function Header() {
  const { user, isAuthenticated, authLoading, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      navigate('/')
    } catch {
      window.alert('Logout failed. Please try again.')
    }
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">RecipeBox</Link>
        <nav className="nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/catalog">Catalog</NavLink>
          {/* The other links wait until Firebase has checked the session, so they do not flicker */}
          {!authLoading && (isAuthenticated ? (
            <>
              <NavLink to="/create">Create</NavLink>
              <NavLink to={`/profile/${user.uid}`}>My Profile</NavLink>
              <span className="greeting">Hello, {user.username}</span>
              <button className="btn btn-secondary btn-small" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header
