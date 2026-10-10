import { useParams } from 'react-router-dom'
import './Details.css'

function Details() {
  const { id } = useParams()

  return (
    <section className="details">
      <h1>Recipe details</h1>
      <p>Here the full recipe will be shown: ingredients, steps and author.</p>
      <p>Recipe id: {id}</p>
    </section>
  )
}

export default Details
