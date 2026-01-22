/**
 * @fileoverview Upload Storage Utility
 *
 * Manages localStorage persistence for model creation uploads
 * Allows resuming failed uploads without re-uploading successful images
 */

export interface UploadedImageState {
	imageId: string
	assetId: string
	storagePath: string
	timestamp: number
}

const STORAGE_KEY = 'model-wizard-uploads'
const EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Save uploaded image state to localStorage
 */
export function saveUploadedImage(imageId: string, assetId: string, storagePath: string): void {
	if (typeof window === 'undefined') return

	try {
		const existing = getUploadedImages()
		const updated: UploadedImageState[] = [
			...existing.filter((img) => img.imageId !== imageId),
			{ imageId, assetId, storagePath, timestamp: Date.now() },
		]

		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
	} catch {
		// Silently fail if localStorage is unavailable
	}
}

/**
 * Get all uploaded images from localStorage
 * Filters out expired entries (> 24 hours old)
 */
export function getUploadedImages(): UploadedImageState[] {
	if (typeof window === 'undefined') return []

	try {
		const data = localStorage.getItem(STORAGE_KEY)
		if (!data) return []

		const uploads: UploadedImageState[] = JSON.parse(data)
		const now = Date.now()

		// Filter out expired uploads
		return uploads.filter((upload) => now - upload.timestamp < EXPIRY_MS)
	} catch {
		return []
	}
}

/**
 * Get assetId for a specific imageId
 */
export function getUploadedImageAssetId(imageId: string): string | null {
	const uploads = getUploadedImages()
	const upload = uploads.find((u) => u.imageId === imageId)
	return upload?.assetId ?? null
}

/**
 * Get storage path for a specific imageId
 */
export function getUploadedImageStoragePath(imageId: string): string | null {
	const uploads = getUploadedImages()
	const upload = uploads.find((u) => u.imageId === imageId)
	return upload?.storagePath ?? null
}

/**
 * Clear all uploaded images from localStorage
 */
export function clearUploadedImages(): void {
	if (typeof window === 'undefined') return

	try {
		localStorage.removeItem(STORAGE_KEY)
	} catch {
		// Silently fail if localStorage is unavailable
	}
}

/**
 * Clear specific uploaded image from localStorage
 */
export function clearUploadedImage(imageId: string): void {
	if (typeof window === 'undefined') return

	try {
		const existing = getUploadedImages()
		const updated = existing.filter((img) => img.imageId !== imageId)
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
	} catch {
		// Silently fail if localStorage is unavailable
	}
}
