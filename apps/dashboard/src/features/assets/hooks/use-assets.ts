'use client'

/**
 * @fileoverview Assets Hooks
 *
 * React hooks for asset management with real-time Firestore updates
 * and Cloud Functions for mutations.
 */

import { useCallback, useEffect, useState } from 'react'
import {
	type AssetDocument,
	confirmUpload,
	deleteAsset,
	getAsset,
	getDownloadUrl,
	type RequestUploadUrlInput,
	requestUploadUrl,
	subscribeToAssets,
} from '@/lib/firebase'

// ==================== Types ====================

export interface UseAssetsOptions {
	category?: AssetDocument['category']
	status?: AssetDocument['status']
	includeDeleted?: boolean
	limit?: number
}

export interface UseAssetsResult {
	assets: AssetDocument[]
	isLoading: boolean
	error: Error | null
	refresh: () => void
}

export interface UseAssetResult {
	asset: AssetDocument | null
	isLoading: boolean
	error: Error | null
	refresh: () => Promise<void>
}

export interface UploadResult {
	assetId: string
	cdnUrl?: string
}

export interface UseUploadResult {
	upload: (file: File, category: AssetDocument['category'], metadata?: Record<string, unknown>) => Promise<UploadResult>
	isUploading: boolean
	progress: number
	error: Error | null
}

export interface UseAssetActionsResult {
	getDownloadUrl: (assetId: string) => Promise<string>
	deleteAsset: (assetId: string) => Promise<void>
	isLoading: boolean
	error: Error | null
}

// ==================== Hooks ====================

/**
 * Hook to subscribe to assets for a store
 */
export function useAssets(storeId: string | null, options?: UseAssetsOptions): UseAssetsResult {
	const [assets, setAssets] = useState<AssetDocument[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)
	const [_refreshTrigger, setRefreshTrigger] = useState(0)

	useEffect(() => {
		if (!storeId) {
			setAssets([])
			setIsLoading(false)
			return
		}

		setIsLoading(true)
		setError(null)

		const unsubscribe = subscribeToAssets(
			storeId,
			(fetchedAssets) => {
				setAssets(fetchedAssets)
				setIsLoading(false)
			},
			{
				category: options?.category,
				status: options?.status,
				includeDeleted: options?.includeDeleted,
				limitCount: options?.limit,
			},
		)

		return () => unsubscribe()
	}, [storeId, options?.category, options?.status, options?.includeDeleted, options?.limit])

	const refresh = useCallback(() => {
		setRefreshTrigger((prev) => prev + 1)
	}, [])

	return { assets, isLoading, error, refresh }
}

/**
 * Hook to get a single asset by ID
 */
export function useAsset(assetId: string | null): UseAssetResult {
	const [asset, setAsset] = useState<AssetDocument | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchAsset = useCallback(async () => {
		if (!assetId) {
			setAsset(null)
			setIsLoading(false)
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const fetchedAsset = await getAsset(assetId)
			setAsset(fetchedAsset)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch asset'))
		} finally {
			setIsLoading(false)
		}
	}, [assetId])

	useEffect(() => {
		fetchAsset()
	}, [fetchAsset])

	return { asset, isLoading, error, refresh: fetchAsset }
}

/**
 * Hook to upload assets to Firebase Storage
 */
export function useUpload(storeId: string | null, userId: string | null): UseUploadResult {
	const [isUploading, setIsUploading] = useState(false)
	const [progress, setProgress] = useState(0)
	const [error, setError] = useState<Error | null>(null)

	const upload = useCallback(
		async (
			file: File,
			category: AssetDocument['category'],
			metadata?: Record<string, unknown>,
		): Promise<UploadResult> => {
			if (!storeId || !userId) {
				throw new Error('Store ID and User ID are required')
			}

			// Validate file type
			const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] as const
			if (!allowedTypes.includes(file.type as any)) {
				throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP')
			}

			// Validate file size (max 50MB)
			const maxSize = 50 * 1024 * 1024
			if (file.size > maxSize) {
				throw new Error('File too large. Maximum size is 50MB')
			}

			setIsUploading(true)
			setProgress(0)
			setError(null)

			try {
				// Request upload URL
				setProgress(10)
				const urlResult = await requestUploadUrl({
					storeId,
					category,
					filename: file.name,
					mimeType: file.type as RequestUploadUrlInput['mimeType'],
					sizeBytes: file.size,
					uploadedBy: userId,
					metadata,
				})

				if (!urlResult.data.success) {
					throw new Error('Failed to get upload URL')
				}

				const { assetId, uploadUrl, headers } = urlResult.data

				// Upload file to Firebase Storage
				setProgress(30)
				const uploadResponse = await fetch(uploadUrl, {
					method: 'PUT',
					headers: {
						'Content-Type': file.type,
						...headers,
					},
					body: file,
				})

				if (!uploadResponse.ok) {
					throw new Error(`Upload failed: ${uploadResponse.statusText}`)
				}

				setProgress(70)

				// Confirm upload
				const confirmResult = await confirmUpload({ assetId, storeId })

				setProgress(100)

				return {
					assetId,
					cdnUrl: confirmResult.data.cdnUrl,
				}
			} catch (err) {
				const error = err instanceof Error ? err : new Error('Upload failed')
				setError(error)
				throw error
			} finally {
				setIsUploading(false)
			}
		},
		[storeId, userId],
	)

	return { upload, isUploading, progress, error }
}

/**
 * Hook for asset actions (download, delete)
 */
export function useAssetActions(storeId: string | null): UseAssetActionsResult {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const download = useCallback(
		async (assetId: string): Promise<string> => {
			if (!storeId) {
				throw new Error('Store ID is required')
			}

			setIsLoading(true)
			setError(null)

			try {
				const result = await getDownloadUrl({ assetId, storeId })
				return result.data.downloadUrl
			} catch (err) {
				const error = err instanceof Error ? err : new Error('Failed to get download URL')
				setError(error)
				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[storeId],
	)

	const remove = useCallback(
		async (assetId: string): Promise<void> => {
			if (!storeId) {
				throw new Error('Store ID is required')
			}

			setIsLoading(true)
			setError(null)

			try {
				await deleteAsset({ assetId, storeId })
			} catch (err) {
				const error = err instanceof Error ? err : new Error('Failed to delete asset')
				setError(error)
				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[storeId],
	)

	return {
		getDownloadUrl: download,
		deleteAsset: remove,
		isLoading,
		error,
	}
}

/**
 * Hook to resolve multiple asset IDs to their CDN URLs
 * Useful for displaying reference images that are stored as asset IDs
 * Falls back to thumbnailUrl if cdnUrl is not available
 */
export function useResolvedAssetUrls(assetIds: string[]): {
	urls: Map<string, string>
	isLoading: boolean
	error: Error | null
} {
	const [urls, setUrls] = useState<Map<string, string>>(new Map())
	// Start with isLoading true if there are IDs to resolve
	const [isLoading, setIsLoading] = useState(assetIds.length > 0)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if (!assetIds || assetIds.length === 0) {
			setUrls(new Map())
			setIsLoading(false)
			return
		}

		// Set loading true when we have IDs to process
		setIsLoading(true)

		let cancelled = false

		const fetchAssets = async () => {
			setError(null)

			try {
				const results = await Promise.all(
					assetIds.map(async (id) => {
						try {
							const asset = await getAsset(id)
							// Try cdnUrl first, then thumbnailUrl as fallback
							const url = asset?.cdnUrl ?? asset?.thumbnailUrl ?? null
							return { id, url }
						} catch {
							return { id, url: null }
						}
					})
				)

				if (!cancelled) {
					const urlMap = new Map<string, string>()
					for (const result of results) {
						if (result.url) {
							urlMap.set(result.id, result.url)
						}
					}
					setUrls(urlMap)
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err : new Error('Failed to resolve asset URLs'))
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		fetchAssets()

		return () => {
			cancelled = true
		}
	}, [assetIds.join(',')])

	return { urls, isLoading, error }
}

/**
 * Hook to resolve Firebase Storage paths to download URLs
 * Used for reference images that are stored as storage paths
 */
export function useStorageUrls(storagePaths: string[]): {
	urls: Map<string, string>
	isLoading: boolean
	error: Error | null
} {
	const [urls, setUrls] = useState<Map<string, string>>(new Map())
	// Start with isLoading true if there are paths to resolve
	const [isLoading, setIsLoading] = useState(storagePaths.length > 0)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if (!storagePaths || storagePaths.length === 0) {
			setUrls(new Map())
			setIsLoading(false)
			return
		}

		// Set loading true when we have paths to process
		setIsLoading(true)

		let cancelled = false

		const fetchUrls = async () => {
			setIsLoading(true)
			setError(null)

			try {
				// Dynamic import to avoid issues with SSR
				const { ref, getDownloadURL } = await import('firebase/storage')
				const { storage } = await import('@/lib/firebase/storage')

				const results = await Promise.all(
					storagePaths.map(async (path) => {
						try {
							const storageRef = ref(storage, path)
							const url = await getDownloadURL(storageRef)
							return { path, url }
						} catch {
							return { path, url: null }
						}
					})
				)

				if (!cancelled) {
					const urlMap = new Map<string, string>()
					for (const result of results) {
						if (result.url) {
							urlMap.set(result.path, result.url)
						}
					}
					setUrls(urlMap)
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err : new Error('Failed to get storage URLs'))
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		fetchUrls()

		return () => {
			cancelled = true
		}
	}, [storagePaths.join(',')])

	return { urls, isLoading, error }
}

/**
 * Hook to get asset statistics for a store
 */
export function useAssetStats(storeId: string | null) {
	const { assets, isLoading } = useAssets(storeId)

	const stats = {
		total: assets.length,
		byCategory: {
			modelReference: assets.filter((a) => a.category === 'MODEL_REFERENCE').length,
			garment: assets.filter((a) => a.category === 'GARMENT').length,
			generated: assets.filter((a) => a.category === 'GENERATED').length,
			calibration: assets.filter((a) => a.category === 'CALIBRATION').length,
			storeLogo: assets.filter((a) => a.category === 'STORE_LOGO').length,
		},
		byStatus: {
			pendingUpload: assets.filter((a) => a.status === 'PENDING_UPLOAD').length,
			uploaded: assets.filter((a) => a.status === 'UPLOADED').length,
			processing: assets.filter((a) => a.status === 'PROCESSING').length,
			ready: assets.filter((a) => a.status === 'READY').length,
			failed: assets.filter((a) => a.status === 'FAILED').length,
		},
		totalSizeBytes: assets.reduce((acc, a) => acc + a.sizeBytes, 0),
	}

	return { stats, isLoading }
}
