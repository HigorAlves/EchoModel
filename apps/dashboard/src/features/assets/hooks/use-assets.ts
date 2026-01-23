'use client'

/**
 * @fileoverview Assets Hooks
 *
 * React hooks for resolving asset URLs from Firebase Storage and Firestore.
 */

import { useEffect, useState } from 'react'
import { getAsset } from '@/lib/firebase'

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
					}),
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
					}),
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
