import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { deleteRecipe, getRecipeById } from '../../services/recipeService.js'
import RecipeImage from '../../components/RecipeImage/RecipeImage.jsx'
import LikeButton from '../../components/LikeButton/LikeButton.jsx'
import Comments from '../../components/Comments/Comments.jsx'
import Loader from '../../components/Loader/Loader.jsx'
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage.jsx'
import './Details.css'

function Details() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useDocumentTitle(recipe ? recipe.title : 'Recipe')

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

  async function handleDelete() {
    if (!window.confirm('Delete this recipe?')) {
      return
    }

    setDeleteError('')
    try {
      await deleteRecipe(id)
      navigate('/catalog')
    } catch {
      setDeleteError('Could not delete the recipe. Please try again.')
    }
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

  const isOwner = user !== null && user.uid === recipe.ownerId

  return (
    <section className="details">
      <div className="details-image">
        <RecipeImage imageUrl={recipe.imageUrl} title={recipe.title} />
      </div>

      <h1>{recipe.title}</h1>
      <p className="details-meta">
        {recipe.category} &middot; {recipe.prepTime} min &middot;{' '}
        {recipe.servings} servings
      </p>
      <p className="details-meta">
        by <Link to={`/profile/${recipe.ownerId}`}>{recipe.ownerName}</Link>
      </p>

      <h2>Ingredients</h2>
      <ul>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>

      <h2>Instructions</h2>
      <p className="details-instructions">{recipe.instructions}</p>

      <LikeButton recipeId={id} ownerId={recipe.ownerId} />

      {isOwner && (
        <div className="details-actions">
          <Link to={`/catalog/${id}/edit`} className="btn btn-primary">
            Edit
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
      {deleteError && <ErrorMessage message={deleteError} />}

      <Comments recipeId={id} recipeOwnerId={recipe.ownerId} />
    </section>
  )
}

export default Details
