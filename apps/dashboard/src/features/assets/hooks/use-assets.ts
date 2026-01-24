'use client'

/**
 * @fileoverview Assets Hooks
 *
 * React hooks for resolving asset URLs from Firebase Storage and Firestore.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { getAsset } from '@/lib/firebase'

// Shared empty Map instance to avoid creating new references
const EMPTY_MAP = new Map<string, string>()

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
	const [urls, setUrls] = useState<Map<string, string>>(EMPTY_MAP)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	// Memoize the asset IDs to prevent unnecessary effect runs
	const stableKey = useMemo(() => assetIds.join(','), [assetIds])
	const stableAssetIds = useRef(assetIds)

	// Update ref when key changes
	useEffect(() => {
		stableAssetIds.current = assetIds
	}, [stableKey, assetIds])

	useEffect(() => {
		const ids = stableAssetIds.current
		if (!ids || ids.length === 0) {
			setUrls(EMPTY_MAP)
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
					ids.map(async (id) => {
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
	}, [stableKey])

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
	const [urls, setUrls] = useState<Map<string, string>>(EMPTY_MAP)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	// Memoize the storage paths to prevent unnecessary effect runs
	const stableKey = useMemo(() => storagePaths.join(','), [storagePaths])
	const stablePaths = useRef(storagePaths)

	// Update ref when key changes
	useEffect(() => {
		stablePaths.current = storagePaths
	}, [stableKey, storagePaths])

	useEffect(() => {
		const paths = stablePaths.current
		if (!paths || paths.length === 0) {
			setUrls(EMPTY_MAP)
			setIsLoading(false)
			return
		}

		// Set loading true when we have paths to process
		setIsLoading(true)

		let cancelled = false

		const fetchUrls = async () => {
			setError(null)

			try {
				// Dynamic import to avoid issues with SSR
				const { ref, getDownloadURL } = await import('firebase/storage')
				const { storage } = await import('@/lib/firebase/storage')

				const results = await Promise.all(
					paths.map(async (path) => {
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
	}, [stableKey])

	return { urls, isLoading, error }
}
