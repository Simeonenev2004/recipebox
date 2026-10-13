import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { getUserProfile } from '../../services/userService.js'
import { getRecipesByOwner } from '../../services/recipeService.js'
import RecipeCard from '../../components/RecipeCard/RecipeCard.jsx'
import Loader from '../../components/Loader/Loader.jsx'
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage.jsx'
import './Profile.css'

function Profile() {
  const { userId } = useParams()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  let username = null
  if (profile) {
    username = profile.username
  } else if (recipes.length > 0) {
    username = recipes[0].ownerName
  }

  useDocumentTitle(username || 'Profile')

  // Update example: the effect runs again whenever userId changes
  useEffect(() => {
    // ignore stops an old request from updating state after unmount or when the user changes
    let ignore = false

    setIsLoading(true)
    setError('')
    Promise.all([getUserProfile(userId), getRecipesByOwner(userId)])
      .then(([profileResult, recipesResult]) => {
        if (!ignore) {
          setProfile(profileResult)
          setRecipes(recipesResult)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Could not load the profile. Please try again later.')
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [userId])

  if (isLoading) {
    return <Loader text="Loading profile..." />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!username) {
    return (
      <section>
        <h1>User not found</h1>
        <Link to="/catalog">Back to catalog</Link>
      </section>
    )
  }

  const isMyProfile = user !== null && user.uid === userId

  return (
    <section className="profile">
      <div className="profile-header">
        <div className="profile-avatar">{username[0].toUpperCase()}</div>
        <div>
          <h1>{isMyProfile ? 'My Profile' : username}</h1>
          {isMyProfile && <p className="profile-meta">{username}</p>}
          {profile && profile.createdAt && (
            <p className="profile-meta">
              Member since {profile.createdAt.toDate().toLocaleDateString()}
            </p>
          )}
          <p className="profile-meta">
            {recipes.length === 1 ? '1 recipe' : `${recipes.length} recipes`}
          </p>
        </div>
        {isMyProfile && <Link to="/create" className="btn btn-primary">Add recipe</Link>}
      </div>

      {recipes.length === 0 ? (
        <p>No recipes yet.</p>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Profile
