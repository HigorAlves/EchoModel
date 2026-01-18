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

let app: FirebaseApp | undefined
let auth: Auth | undefined
let emulatorConnected = false

export function getFirebaseApp(): FirebaseApp {
	if (app) return app

	const existingApps = getApps()
	if (existingApps.length > 0) {
		app = existingApps[0]
		return app
	}

	app = initializeApp(firebaseConfig)
	return app
}

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
