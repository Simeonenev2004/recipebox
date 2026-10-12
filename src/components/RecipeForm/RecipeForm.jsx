import { useState } from 'react'
import { CATEGORIES } from '../../constants/categories.js'
import './RecipeForm.css'

const URL_REGEX = /^https?:\/\/\S+$/i

function RecipeForm({ initialValues, onSubmit, submitLabel }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(e) {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  function getIngredients() {
    return values.ingredients
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '')
  }

  function validate() {
    const newErrors = {}
    const title = values.title.trim()
    const prepTime = Number(values.prepTime)
    const servings = Number(values.servings)

    if (title.length < 3 || title.length > 80) {
      newErrors.title = 'Title must be between 3 and 80 characters.'
    }

    if (!CATEGORIES.includes(values.category)) {
      newErrors.category = 'Choose a category.'
    }

    if (values.imageUrl.trim() !== '' && !URL_REGEX.test(values.imageUrl.trim())) {
      newErrors.imageUrl = 'Image URL must start with http:// or https://.'
    }

    if (!Number.isInteger(prepTime) || prepTime < 1 || prepTime > 1440) {
      newErrors.prepTime = 'Preparation time must be a whole number from 1 to 1440 minutes.'
    }

    if (!Number.isInteger(servings) || servings < 1 || servings > 50) {
      newErrors.servings = 'Servings must be a whole number from 1 to 50.'
    }

    if (getIngredients().length === 0) {
      newErrors.ingredients = 'Add at least one ingredient.'
    }

    if (values.instructions.trim().length < 10) {
      newErrors.instructions = 'Instructions must be at least 10 characters.'
    }

    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsSaving(true)
    try {
      await onSubmit({
        title: values.title.trim(),
        category: values.category,
        imageUrl: values.imageUrl.trim(),
        prepTime: Number(values.prepTime),
        servings: Number(values.servings),
        ingredients: getIngredients(),
        instructions: values.instructions.trim(),
      })
    } catch (error) {
      if (error.code === 'permission-denied') {
        setFormError('You are not allowed to do this.')
      } else {
        setFormError('Could not save the recipe. Please try again.')
      }
      setIsSaving(false)
    }
  }

  return (
    <form className="recipe-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="title">Title</label>
      <input id="title" name="title" type="text" value={values.title} onChange={handleChange} />
      {errors.title && <span className="field-error">{errors.title}</span>}

      <label htmlFor="category">Category</label>
      <select id="category" name="category" value={values.category} onChange={handleChange}>
        <option value="">Select a category</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      {errors.category && <span className="field-error">{errors.category}</span>}

      <label htmlFor="imageUrl">Image URL (optional)</label>
      <input id="imageUrl" name="imageUrl" type="text" value={values.imageUrl} onChange={handleChange} />
      {errors.imageUrl && <span className="field-error">{errors.imageUrl}</span>}

      <div className="recipe-form-row">
        <div>
          <label htmlFor="prepTime">Preparation time (minutes)</label>
          <input id="prepTime" name="prepTime" type="number" value={values.prepTime} onChange={handleChange} />
          {errors.prepTime && <span className="field-error">{errors.prepTime}</span>}
        </div>
        <div>
          <label htmlFor="servings">Servings</label>
          <input id="servings" name="servings" type="number" value={values.servings} onChange={handleChange} />
          {errors.servings && <span className="field-error">{errors.servings}</span>}
        </div>
      </div>

      <label htmlFor="ingredients">Ingredients (one per line)</label>
      <textarea id="ingredients" name="ingredients" value={values.ingredients} onChange={handleChange} />
      {errors.ingredients && <span className="field-error">{errors.ingredients}</span>}

      <label htmlFor="instructions">Instructions</label>
      <textarea id="instructions" name="instructions" value={values.instructions} onChange={handleChange} />
      {errors.instructions && <span className="field-error">{errors.instructions}</span>}

      {formError && <p className="form-error">{formError}</p>}

      <button className="btn" type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}

export default RecipeForm
