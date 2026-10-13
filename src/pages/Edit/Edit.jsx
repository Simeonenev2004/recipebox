import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { getRecipeById, updateRecipe } from '../../services/recipeService.js'
import RecipeForm from '../../components/RecipeForm/RecipeForm.jsx'
import Loader from '../../components/Loader/Loader.jsx'
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage.jsx'

function Edit() {
  useDocumentTitle('Edit recipe')

  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // ignore stops an old request from updating state after unmount or when the id changes
    let ignore = false

    setIsLoading(true)
    setError('')
    getRecipeById(id)
      .then((result) => {
        if (!ignore) {
          setRecipe(result)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Could not load the recipe. Please try again later.')
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [id])

  async function handleUpdate(data) {
    await updateRecipe(id, data)
    navigate(`/catalog/${id}`)
  }

  if (isLoading) {
    return <Loader text="Loading recipe..." />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!recipe) {
    return (
      <section>
        <h1>Recipe not found</h1>
        <Link to="/catalog">Back to catalog</Link>
      </section>
    )
  }

  if (recipe.ownerId !== user.uid) {
    return <Navigate to={`/catalog/${id}`} replace />
  }

  const initialValues = {
    title: recipe.title,
    category: recipe.category,
    imageUrl: recipe.imageUrl || '',
    prepTime: recipe.prepTime,
    servings: recipe.servings,
    ingredients: recipe.ingredients.join('\n'),
    instructions: recipe.instructions,
  }

  return (
    <section>
      <h1>Edit recipe</h1>
      <RecipeForm
        initialValues={initialValues}
        onSubmit={handleUpdate}
        submitLabel="Save changes"
      />
    </section>
  )
}

export default Edit
