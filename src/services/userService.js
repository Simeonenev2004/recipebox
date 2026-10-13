import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'

export async function createUserProfile(uid, username) {
  await setDoc(doc(db, 'users', uid), {
    username,
    createdAt: serverTimestamp(),
  })
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid))
  if (!snapshot.exists()) {
    return null
  }
  return { id: snapshot.id, ...snapshot.data() }
}
