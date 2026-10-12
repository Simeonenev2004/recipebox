import { Link } from 'react-router-dom'
import RecipeImage from '../RecipeImage/RecipeImage.jsx'
import './RecipeCard.css'

function RecipeCard({ recipe }) {
  return (
    <Link to={`/catalog/${recipe.id}`} className="recipe-card">
      <div className="recipe-card-image">
        <RecipeImage imageUrl={recipe.imageUrl} title={recipe.title} />
      </div>
      <div className="recipe-card-body">
        <h2>{recipe.title}</h2>
        <p className="recipe-card-meta">
          {recipe.category} &middot; {recipe.prepTime} min
        </p>
        <p className="recipe-card-author">by {recipe.ownerName}</p>
      </div>
    </Link>
  )
}

export default RecipeCard
