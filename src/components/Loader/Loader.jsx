import './Loader.css'

function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader" role="status">
      <span className="loader-spinner"></span>
      <span>{text}</span>
    </div>
  )
}

export default Loader
