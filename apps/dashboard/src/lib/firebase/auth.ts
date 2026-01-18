import {
	createUserWithEmailAndPassword,
	signOut as firebaseSignOut,
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signInWithPopup,
	type User,
} from 'firebase/auth'
import { getFirebaseAuth } from './config'

export interface AuthResult {
	user: User | null
	error: Error | null
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
	try {
		const auth = getFirebaseAuth()
		const userCredential = await createUserWithEmailAndPassword(auth, email, password)
		return { user: userCredential.user, error: null }
	} catch (error) {
		return { user: null, error: error as Error }
	}
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
	try {
		const auth = getFirebaseAuth()
		const userCredential = await signInWithEmailAndPassword(auth, email, password)
		return { user: userCredential.user, error: null }
	} catch (error) {
		return { user: null, error: error as Error }
	}
}

export async function signInWithGoogle(): Promise<AuthResult> {
	try {
		const auth = getFirebaseAuth()
		const provider = new GoogleAuthProvider()
		const userCredential = await signInWithPopup(auth, provider)
		return { user: userCredential.user, error: null }
	} catch (error) {
		return { user: null, error: error as Error }
	}
}

export async function signOut(): Promise<{ error: Error | null }> {
	try {
		const auth = getFirebaseAuth()
		await firebaseSignOut(auth)
		return { error: null }
	} catch (error) {
		return { error: error as Error }
	}
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
	const auth = getFirebaseAuth()
	return onAuthStateChanged(auth, callback)
}
