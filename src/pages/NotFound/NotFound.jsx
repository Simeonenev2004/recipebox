import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import './NotFound.css'

function NotFound() {
  useDocumentTitle('Page not found')

  return (
    <section className="not-found">
      <h1 className="not-found-code">404</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">Back to home</Link>
    </section>
  )
}

export default NotFound
