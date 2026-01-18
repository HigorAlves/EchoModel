import { type FirebaseApp, getApps, initializeApp } from 'firebase/app'
import { type Auth, connectAuthEmulator, getAuth } from 'firebase/auth'

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

function shouldUseEmulator(): boolean {
	if (typeof window === 'undefined') return false

	const useEmulatorEnv = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true'
	const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

	return useEmulatorEnv || isLocalhost
}

let _app: FirebaseApp | undefined
let auth: Auth | undefined
let emulatorConnected = false

export function getFirebaseApp(): FirebaseApp {
	if (_app) return _app

	const existingApps = getApps()
	const existingApp = existingApps[0]
	if (existingApp) {
		_app = existingApp
		return _app
	}

	_app = initializeApp(firebaseConfig)
	return _app
}

// Export initialized app for direct use
export const app = getFirebaseApp()

export function getFirebaseAuth(): Auth {
	if (auth) return auth

	const firebaseApp = getFirebaseApp()
	auth = getAuth(firebaseApp)

	if (shouldUseEmulator() && !emulatorConnected) {
		connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
		emulatorConnected = true
	}

	return auth
}
