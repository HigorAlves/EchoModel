/**
 * @fileoverview Firebase Storage Client
 *
 * Provides Firebase Storage instance with emulator support
 */

import { connectStorageEmulator, getStorage } from 'firebase/storage'
import { app } from './config'

// Initialize Firebase Storage
const storage = getStorage(app)

let storageEmulatorConnected = false

// Connect to emulator in development
if (
	typeof window !== 'undefined' &&
	(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true')
) {
	const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

	if (isLocalhost && !storageEmulatorConnected) {
		console.log('[Firebase Storage] Connecting to emulator at localhost:9199')
		try {
			connectStorageEmulator(storage, 'localhost', 9199)
			storageEmulatorConnected = true
			console.log('[Firebase Storage] Successfully connected to emulator')
		} catch (error) {
			console.error('[Firebase Storage] Failed to connect to emulator:', error)
		}
	}
}

export { storage }
