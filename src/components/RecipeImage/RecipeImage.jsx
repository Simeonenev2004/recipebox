import { useState } from 'react'
import './RecipeImage.css'

function RecipeImage({ imageUrl, title, className = '' }) {
  const [hasError, setHasError] = useState(false)

  if (!imageUrl || hasError) {
    return (
      <div className={`recipe-image recipe-image-placeholder ${className}`}>
        <span role="img" aria-label="No image">
          🍽️
        </span>
      </div>
    )
  }

  return (
    <img
      className={`recipe-image ${className}`}
      src={imageUrl}
      alt={title}
      onError={() => setHasError(true)}
    />
  )
}

export default RecipeImage
