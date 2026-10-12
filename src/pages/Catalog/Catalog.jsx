import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { getAllRecipes } from '../../services/recipeService.js'
import RecipeCard from '../../components/RecipeCard/RecipeCard.jsx'
import './Catalog.css'

function Catalog() {
  const { isAuthenticated } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadRecipes() {
    setIsLoading(true)
    setError('')
    try {
      setRecipes(await getAllRecipes())
    } catch {
      setError('Could not load recipes. Please try again.')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadRecipes()
  }, [])

  if (isLoading) {
    return <p>Loading recipes...</p>
  }

  if (error) {
    return (
      <section className="catalog">
        <p className="catalog-error">{error}</p>
        <button className="btn" onClick={loadRecipes}>Try again</button>
      </section>
    )
  }

  return (
    <section className="catalog">
      <h1>Catalog</h1>
      {recipes.length === 0 ? (
        <div>
          <p>No recipes yet.</p>
          {isAuthenticated && <Link to="/create">Create the first recipe</Link>}
        </div>
      ) : (
        <div className="catalog-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Catalog
