import './ErrorMessage.css'

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>Try again</button>
      )}
    </div>
  )
}

export default ErrorMessage
