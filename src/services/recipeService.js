import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase.js'

const recipesCollection = collection(db, 'recipes')

export async function getAllRecipes() {
  const recipesQuery = query(recipesCollection, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(recipesQuery)
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
  // Firestore does not delete subcollections automatically, so remove them first
  for (const name of ['likes', 'comments']) {
    const snapshot = await getDocs(collection(db, 'recipes', id, name))
    await Promise.all(snapshot.docs.map((subDoc) => deleteDoc(subDoc.ref)))
  }
  await deleteDoc(doc(db, 'recipes', id))
}
