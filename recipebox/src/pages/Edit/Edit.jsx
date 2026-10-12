import { useParams } from 'react-router-dom'

function Edit() {
  const { id } = useParams()

  return (
    <section className="edit">
      <h1>Edit recipe</h1>
      <p>Here the author will be able to change the recipe.</p>
      <p>Recipe id: {id}</p>
    </section>
  )
}

export default Edit
