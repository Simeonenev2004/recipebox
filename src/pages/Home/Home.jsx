import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { getLatestRecipes } from '../../services/recipeService.js'
import { CATEGORIES, CATEGORY_ICONS } from '../../constants/categories.js'
import RecipeCard from '../../components/RecipeCard/RecipeCard.jsx'
import './Home.css'

function Home() {
  useDocumentTitle('Home')

  const { isAuthenticated } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadRecipes() {
    setIsLoading(true)
    setError('')
    try {
      setRecipes(await getLatestRecipes(3))
    } catch {
      setError('Could not load recipes. Please try again.')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadRecipes()
  }, [])

  function renderLatest() {
    if (isLoading) {
      return <p>Loading recipes...</p>
    }

    if (error) {
      return (
        <div>
          <p className="home-error">{error}</p>
          <button className="btn" onClick={loadRecipes}>Try again</button>
        </div>
      )
    }

    if (recipes.length === 0) {
      return <p>No recipes yet. Be the first to share one!</p>
    }

    return (
      <div className="catalog-grid">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    )
  }

  return (
    <div className="home">
      <section className="hero">
        <h1>Welcome to RecipeBox</h1>
        <p>
          RecipeBox is a place to share and discover recipes. Browse dishes
          from other cooks, or add your own favourites.
        </p>
        <div className="hero-buttons">
          <Link to="/catalog" className="btn">Browse recipes</Link>
          {isAuthenticated ? (
            <Link to="/create" className="btn hero-secondary">Share a recipe</Link>
          ) : (
            <Link to="/register" className="btn hero-secondary">Join RecipeBox</Link>
          )}
        </div>
      </section>

      <section>
        <div className="home-section-header">
          <h2>Latest recipes</h2>
          <Link to="/catalog">See all</Link>
        </div>
        {renderLatest()}
      </section>

      <section>
        <h2>Browse by category</h2>
        <div className="category-tiles">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              to={`/catalog?category=${category}`}
              className="category-tile"
            >
              <span className="category-icon">{CATEGORY_ICONS[category]}</span>
              {category}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
