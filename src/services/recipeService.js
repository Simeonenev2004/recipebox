import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase.js'

const recipesCollection = collection(db, 'recipes')

export async function getAllRecipes() {
  const recipesQuery = query(recipesCollection, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(recipesQuery)
  return snapshot.docs.map((recipeDoc) => ({ id: recipeDoc.id, ...recipeDoc.data() }))
}

export async function getLatestRecipes(count) {
  const latestQuery = query(recipesCollection, orderBy('createdAt', 'desc'), limit(count))
  const snapshot = await getDocs(latestQuery)
  return snapshot.docs.map((recipeDoc) => ({ id: recipeDoc.id, ...recipeDoc.data() }))
}

export async function getRecipesByOwner(ownerId) {
  // No orderBy here, so no composite index is needed. Sorting is done in JavaScript.
  const ownerQuery = query(recipesCollection, where('ownerId', '==', ownerId))
  const snapshot = await getDocs(ownerQuery)
  const recipes = snapshot.docs.map((recipeDoc) => ({ id: recipeDoc.id, ...recipeDoc.data() }))
  return recipes.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
}

export async function getRecipeById(id) {
  const snapshot = await getDoc(doc(db, 'recipes', id))
  if (!snapshot.exists()) {
    return null
  }
  return { id: snapshot.id, ...snapshot.data() }
}

export async function createRecipe(data, user) {
  const newRecipe = {
    ...data,
    ownerId: user.uid,
    ownerName: user.username,
    createdAt: serverTimestamp(),
  }
  const docRef = await addDoc(recipesCollection, newRecipe)
  return docRef.id
}

export async function updateRecipe(id, data) {
  // Only the editable fields are sent, so the owner and creation date never change
  await updateDoc(doc(db, 'recipes', id), {
    title: data.title,
    category: data.category,
    imageUrl: data.imageUrl,
    prepTime: data.prepTime,
    servings: data.servings,
    ingredients: data.ingredients,
    instructions: data.instructions,
  })
}

export async function deleteRecipe(id) {
  // Firestore does not delete subcollections automatically. The likes, the comments
  // and the recipe are deleted in one batch, so either everything is deleted or nothing.
  // A batch can hold 500 operations, which is enough for this project.
  const likes = await getDocs(collection(db, 'recipes', id, 'likes'))
  const comments = await getDocs(collection(db, 'recipes', id, 'comments'))

  const batch = writeBatch(db)
  likes.docs.forEach((likeDoc) => batch.delete(likeDoc.ref))
  comments.docs.forEach((commentDoc) => batch.delete(commentDoc.ref))
  batch.delete(doc(db, 'recipes', id))
  await batch.commit()
}
