import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { getAuthErrorMessage } from '../../services/authService.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import './Auth.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Login() {
  useDocumentTitle('Login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  function validate() {
    const newErrors = {}

    if (!email) {
      newErrors.email = 'Email is required.'
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Enter a valid email address.'
    }

    if (!password) {
      newErrors.password = 'Password is required.'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }

    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      navigate('/catalog')
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
      setIsLoading(false)
    }
  }

  return (
    <section className="auth">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          aria-invalid={errors.email ? 'true' : undefined}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          aria-invalid={errors.password ? 'true' : undefined}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <span className="field-error">{errors.password}</span>}

        {formError && <p className="form-error">{formError}</p>}

        <button className="btn btn-primary btn-block" type="submit" disabled={isLoading}>
          {isLoading ? 'Please wait...' : 'Login'}
        </button>
      </form>
      <p className="auth-switch">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </section>
  )
}

export default Login
