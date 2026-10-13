import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase.js'

export async function getComments(recipeId) {
  const commentsQuery = query(
    collection(db, 'recipes', recipeId, 'comments'),
    orderBy('createdAt', 'asc')
  )
  const snapshot = await getDocs(commentsQuery)
  return snapshot.docs.map((commentDoc) => ({ id: commentDoc.id, ...commentDoc.data() }))
}

export async function addComment(recipeId, text, user) {
  const commentData = {
    text,
    authorId: user.uid,
    authorName: user.username,
  }
  const docRef = await addDoc(collection(db, 'recipes', recipeId, 'comments'), {
    ...commentData,
    createdAt: serverTimestamp(),
  })
  // The real server time is not known yet, so the local time is used for display
  return { id: docRef.id, ...commentData, createdAt: Timestamp.now() }
}

export async function deleteComment(recipeId, commentId) {
  await deleteDoc(doc(db, 'recipes', recipeId, 'comments', commentId))
}
