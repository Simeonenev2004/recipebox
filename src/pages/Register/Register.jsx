import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { getAuthErrorMessage } from '../../services/authService.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import '../Login/Auth.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Register() {
  useDocumentTitle('Register')

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  function validate() {
    const newErrors = {}

    if (!username) {
      newErrors.username = 'Username is required.'
    } else if (username.length < 3 || username.length > 20) {
      newErrors.username = 'Username must be between 3 and 20 characters.'
    }

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

    if (repeatPassword !== password) {
      newErrors.repeatPassword = 'Passwords do not match.'
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
      await register(email, password, username)
      navigate('/catalog')
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
      setIsLoading(false)
    }
  }

  return (
    <section className="auth">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          aria-invalid={errors.username ? 'true' : undefined}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {errors.username && <span className="field-error">{errors.username}</span>}

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

        <label htmlFor="repeatPassword">Repeat password</label>
        <input
          id="repeatPassword"
          aria-invalid={errors.repeatPassword ? 'true' : undefined}
          type="password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
        />
        {errors.repeatPassword && <span className="field-error">{errors.repeatPassword}</span>}

        {formError && <p className="form-error">{formError}</p>}

        <button className="btn btn-primary btn-block" type="submit" disabled={isLoading}>
          {isLoading ? 'Please wait...' : 'Register'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  )
}

export default Register
