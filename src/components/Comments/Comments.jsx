import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { addComment, deleteComment, getComments } from '../../services/commentService.js'
import Loader from '../Loader/Loader.jsx'
import ErrorMessage from '../ErrorMessage/ErrorMessage.jsx'
import './Comments.css'

const MAX_LENGTH = 500

function Comments({ recipeId, recipeOwnerId }) {
  const { user, isAuthenticated } = useAuth()
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [text, setText] = useState('')
  const [textError, setTextError] = useState('')
  const [formError, setFormError] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  useEffect(() => {
    // ignore stops an old request from updating state after unmount or when the recipe changes
    let ignore = false

    getComments(recipeId)
      .then((result) => {
        if (!ignore) {
          setComments(result)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoadError('Could not load comments.')
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [recipeId])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const trimmedText = text.trim()
    if (trimmedText.length === 0) {
      setTextError('Comment cannot be empty.')
      return
    }
    if (trimmedText.length > MAX_LENGTH) {
      setTextError(`Comment can be at most ${MAX_LENGTH} characters.`)
      return
    }
    setTextError('')

    setIsPosting(true)
    try {
      const newComment = await addComment(recipeId, trimmedText, user)
      setComments([...comments, newComment])
      setText('')
    } catch {
      setFormError('Could not post your comment. Please try again.')
    }
    setIsPosting(false)
  }

  async function handleDelete(commentId) {
    if (!window.confirm('Delete this comment?')) {
      return
    }

    try {
      await deleteComment(recipeId, commentId)
      setComments(comments.filter((comment) => comment.id !== commentId))
    } catch {
      setFormError('Could not delete the comment. Please try again.')
    }
  }

  function canDelete(comment) {
    return isAuthenticated && (user.uid === comment.authorId || user.uid === recipeOwnerId)
  }

  return (
    <section className="comments">
      <h2>Comments ({comments.length})</h2>

      {isLoading && <Loader text="Loading comments..." />}
      {loadError && <ErrorMessage message={loadError} />}
      {!isLoading && !loadError && comments.length === 0 && <p>No comments yet.</p>}

      <ul className="comment-list">
        {comments.map((comment) => (
          <li key={comment.id} className="comment">
            <div className="comment-header">
              <Link to={`/profile/${comment.authorId}`}>{comment.authorName}</Link>
              <span className="comment-date">
                {comment.createdAt.toDate().toLocaleDateString()}
              </span>
              {canDelete(comment) && (
                <button className="btn btn-danger btn-small" onClick={() => handleDelete(comment.id)}>
                  Delete
                </button>
              )}
            </div>
            <p className="comment-text">{comment.text}</p>
          </li>
        ))}
      </ul>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="comment">Your comment</label>
          <textarea
            id="comment" aria-invalid={textError ? 'true' : undefined}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className={text.length > MAX_LENGTH ? 'comment-counter over' : 'comment-counter'}>
            {text.length}/{MAX_LENGTH}
          </p>
          {textError && <span className="field-error">{textError}</span>}
          {formError && <p className="form-error">{formError}</p>}
          <button className="btn btn-primary" type="submit" disabled={isPosting}>
            {isPosting ? 'Posting...' : 'Post comment'}
          </button>
        </form>
      ) : (
        <p>
          <Link to="/login">Login to leave a comment</Link>
        </p>
      )}
    </section>
  )
}

export default Comments
