import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { getAllRecipes } from '../../services/recipeService.js'
import { CATEGORIES } from '../../constants/categories.js'
import RecipeCard from '../../components/RecipeCard/RecipeCard.jsx'
import Loader from '../../components/Loader/Loader.jsx'
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage.jsx'
import './Catalog.css'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'quickest', label: 'Quickest first' },
  { value: 'title', label: 'Title A-Z' },
]

function sortRecipes(recipes, sort) {
  const sorted = [...recipes]

  if (sort === 'oldest') {
    sorted.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())
  } else if (sort === 'quickest') {
    sorted.sort((a, b) => a.prepTime - b.prepTime)
  } else if (sort === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title))
  } else {
    sorted.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
  }

  return sorted
}

function Catalog() {
  useDocumentTitle('Catalog')

  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [recipes, setRecipes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'

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

  // Empty values (and the default sort) are removed, so the URL stays short
  function updateParam(name, value) {
    const newParams = new URLSearchParams(searchParams)
    if (value === '' || (name === 'sort' && value === 'newest')) {
      newParams.delete(name)
    } else {
      newParams.set(name, value)
    }
    setSearchParams(newParams, { replace: true })
  }

  function clearFilters() {
    setSearchParams({}, { replace: true })
  }

  if (isLoading) {
    return <Loader text="Loading recipes..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadRecipes} />
  }

  const searchText = search.trim().toLowerCase()
  const matchingRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchText)
    const matchesCategory = category === '' || recipe.category === category
    return matchesSearch && matchesCategory
  })
  const visibleRecipes = sortRecipes(matchingRecipes, sort)

  return (
    <section className="catalog">
      <h1>Catalog</h1>

      {recipes.length === 0 ? (
        <div>
          <p>No recipes yet.</p>
          {isAuthenticated && <Link to="/create">Create the first recipe</Link>}
        </div>
      ) : (
        <>
          <div className="catalog-filters">
            <input
              type="search"
              placeholder="Search recipes..."
              aria-label="Search recipes"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
            />
            <select
              aria-label="Category"
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <select
              aria-label="Sort by"
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <p className="catalog-count">
            {visibleRecipes.length === 1 ? '1 recipe' : `${visibleRecipes.length} recipes`}
          </p>

          {visibleRecipes.length === 0 ? (
            <div>
              <p>No recipes match your filters.</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <div className="recipe-grid">
              {visibleRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default Catalog
