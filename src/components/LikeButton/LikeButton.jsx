import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { addLike, getLikes, removeLike } from '../../services/likeService.js'
import './LikeButton.css'

function LikeButton({ recipeId, ownerId }) {
  const { user, isAuthenticated } = useAuth()
  const [likes, setLikes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // ignore stops an old request from updating state after unmount or when the recipe changes
    let ignore = false

    getLikes(recipeId)
      .then((result) => {
        if (!ignore) {
          setLikes(result)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Could not load likes.')
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [recipeId])

  const hasLiked = isAuthenticated && likes.includes(user.uid)
  const isOwner = isAuthenticated && user.uid === ownerId
  const countText = likes.length === 1 ? '1 like' : `${likes.length} likes`

  async function handleClick() {
    setIsBusy(true)
    setError('')
    try {
      if (hasLiked) {
        await removeLike(recipeId, user.uid)
        setLikes(likes.filter((uid) => uid !== user.uid))
      } else {
        await addLike(recipeId, user.uid)
        setLikes([...likes, user.uid])
      }
    } catch {
      setError('Could not update your like. Please try again.')
    }
    setIsBusy(false)
  }

  if (isLoading) {
    return <p className="like-box">Loading likes...</p>
  }

  return (
    <div className="like-box">
      {isAuthenticated && !isOwner ? (
        <button className="btn like-btn" onClick={handleClick} disabled={isBusy}>
          {hasLiked ? '❤️ Unlike' : '🤍 Like'}
        </button>
      ) : (
        <span>{likes.length > 0 ? '❤️' : '🤍'}</span>
      )}
      <span className="like-count">{countText}</span>
      {!isAuthenticated && <Link to="/login">Login to like</Link>}
      {error && <span className="like-error">{error}</span>}
    </div>
  )
}

export default LikeButton
