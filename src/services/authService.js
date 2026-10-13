import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from './firebase.js'
import { createUserProfile } from './userService.js'

export async function register(email, password, username) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName: username })
  await createUserProfile(result.user.uid, username)
  return result.user
}

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function logout() {
  return signOut(auth)
}

// Turns a Firebase error into a message that is safe to show to the user
export function getAuthErrorMessage(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/invalid-credential':
      return 'Wrong email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
