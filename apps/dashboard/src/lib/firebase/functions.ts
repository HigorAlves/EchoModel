/**
 * @fileoverview Firebase Functions Client
 *
 * Provides typed callable functions for Cloud Functions integration.
 */

import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './config'

// Initialize Firebase Functions
const functions = getFunctions(app)

// Connect to emulator in development (must be called before any function calls)
// This works on both server and client side in Next.js
if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
	try {
		connectFunctionsEmulator(functions, 'localhost', 5001)
		if (typeof window !== 'undefined') {
			console.log('[Firebase Functions] Connected to emulator at localhost:5001')
		}
	} catch (error) {
		// Ignore if already connected
		const errorMessage = error instanceof Error ? error.message : String(error)
		if (typeof window !== 'undefined' && !errorMessage.includes('already been called')) {
			console.error('[Firebase Functions] Failed to connect to emulator:', error)
		}
	}
}

// ==================== Type Definitions ====================

// Asset types
export interface RequestUploadUrlInput {
	storeId: string
	category: 'MODEL_REFERENCE' | 'GARMENT' | 'GENERATED' | 'CALIBRATION' | 'STORE_LOGO'
	filename: string
	mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
	sizeBytes: number
	uploadedBy: string
	metadata?: Record<string, unknown>
}

export interface RequestUploadUrlResult {
	success: boolean
	assetId: string
	uploadUrl: string
	headers?: Record<string, string>
	expiresAt: string
	storagePath: string
}

export interface ConfirmUploadInput {
	assetId: string
	storeId: string
}

export interface ConfirmUploadResult {
	success: boolean
	assetId: string
	status: string
	cdnUrl?: string
}

// ==================== Callable Functions ====================

// Asset functions
export const requestUploadUrl = httpsCallable<RequestUploadUrlInput, RequestUploadUrlResult>(
	functions,
	'requestUploadUrl',
)
export const confirmUpload = httpsCallable<ConfirmUploadInput, ConfirmUploadResult>(functions, 'confirmUpload')

export { functions }
