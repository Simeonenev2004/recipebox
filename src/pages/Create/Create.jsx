import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { createRecipe } from '../../services/recipeService.js'
import RecipeForm from '../../components/RecipeForm/RecipeForm.jsx'

const emptyValues = {
  title: '',
  category: '',
  imageUrl: '',
  prepTime: '',
  servings: '',
  ingredients: '',
  instructions: '',
}

function Create() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleCreate(data) {
    const newId = await createRecipe(data, user)
    navigate(`/catalog/${newId}`)
  }

  return (
    <section>
      <h1>Create recipe</h1>
      <RecipeForm
        initialValues={emptyValues}
        onSubmit={handleCreate}
        submitLabel="Create recipe"
      />
    </section>
  )
}

export default Create
