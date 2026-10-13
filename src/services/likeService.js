import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'

export async function getLikes(recipeId) {
  const snapshot = await getDocs(collection(db, 'recipes', recipeId, 'likes'))
  return snapshot.docs.map((likeDoc) => likeDoc.id)
}

export async function addLike(recipeId, uid) {
  await setDoc(doc(db, 'recipes', recipeId, 'likes', uid), {
    createdAt: serverTimestamp(),
  })
}

export async function removeLike(recipeId, uid) {
  await deleteDoc(doc(db, 'recipes', recipeId, 'likes', uid))
}
