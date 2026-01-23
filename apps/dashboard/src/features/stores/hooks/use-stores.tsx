'use client'

/**
 * @fileoverview Stores Hooks
 *
 * React hooks for store management with real-time Firestore updates.
 * Uses Firestore directly for reads and writes to leverage real-time sync.
 */

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import {
	type CreateStoreInput,
	createStore,
	getStoreById,
	type StoreDocument,
	subscribeToStore,
	subscribeToStores,
	updateStoreInfo,
	updateStoreSettingsFirestore,
} from '@/lib/firebase'

// ==================== Types ====================

export interface UseStoresResult {
	stores: StoreDocument[]
	isLoading: boolean
	error: Error | null
	refresh: () => void
}

export interface UseStoreResult {
	store: StoreDocument | null
	isLoading: boolean
	error: Error | null
	refresh: () => Promise<void>
}

export interface UseCreateStoreResult {
	createStore: (input: Omit<CreateStoreInput, 'ownerId'>) => Promise<{ storeId: string }>
	isLoading: boolean
	error: Error | null
}

export interface UseStoreSettingsResult {
	updateSettings: (settings: {
		defaultAspectRatio?: string
		defaultImageCount?: number
		watermarkEnabled?: boolean
	}) => Promise<void>
	isLoading: boolean
	error: Error | null
}

// ==================== Hooks ====================

/**
 * Hook to subscribe to stores for a user
 */
export function useStores(userId: string | null): UseStoresResult {
	const [stores, setStores] = useState<StoreDocument[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)
	const [_refreshTrigger, setRefreshTrigger] = useState(0)

	useEffect(() => {
		if (!userId) {
			setStores([])
			setIsLoading(false)
			return
		}

		setIsLoading(true)
		setError(null)

		const unsubscribe = subscribeToStores(userId, (fetchedStores) => {
			setStores(fetchedStores)
			setIsLoading(false)
		})

		return () => unsubscribe()
	}, [userId])

	const refresh = useCallback(() => {
		setRefreshTrigger((prev) => prev + 1)
	}, [])

	return { stores, isLoading, error, refresh }
}

/**
 * Hook to get a single store by ID
 */
export function useStore(storeId: string | null): UseStoreResult {
	const [store, setStore] = useState<StoreDocument | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchStore = useCallback(async () => {
		if (!storeId) {
			setStore(null)
			setIsLoading(false)
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const fetchedStore = await getStoreById(storeId)
			setStore(fetchedStore)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch store'))
		} finally {
			setIsLoading(false)
		}
	}, [storeId])

	useEffect(() => {
		fetchStore()
	}, [fetchStore])

	return { store, isLoading, error, refresh: fetchStore }
}

/**
 * Hook to create a new store
 */
export function useCreateStore(userId: string | null): UseCreateStoreResult {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const create = useCallback(
		async (input: Omit<CreateStoreInput, 'ownerId'>) => {
			if (!userId) {
				throw new Error('User ID is required')
			}

			setIsLoading(true)
			setError(null)

			try {
				const result = await createStore({ ...input, ownerId: userId })
				return { storeId: result.storeId }
			} catch (err) {
				const error = err instanceof Error ? err : new Error('Failed to create store')
				setError(error)
				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[userId],
	)

	return { createStore: create, isLoading, error }
}

/**
 * Hook to update store settings via Firestore
 */
export function useStoreSettings(storeId: string | null): UseStoreSettingsResult {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const update = useCallback(
		async (settings: { defaultAspectRatio?: string; defaultImageCount?: number; watermarkEnabled?: boolean }) => {
			if (!storeId) {
				throw new Error('Store ID is required')
			}

			setIsLoading(true)
			setError(null)

			try {
				await updateStoreSettingsFirestore(storeId, settings)
			} catch (err) {
				const error = err instanceof Error ? err : new Error('Failed to update settings')
				setError(error)
				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[storeId],
	)

	return { updateSettings: update, isLoading, error }
}

export interface UseStoreInfoResult {
	updateInfo: (data: { name?: string; description?: string | null; defaultStyle?: string | null }) => Promise<void>
	isLoading: boolean
	error: Error | null
}

/**
 * Hook to update store basic information via Firestore
 */
export function useStoreInfo(storeId: string | null): UseStoreInfoResult {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const update = useCallback(
		async (data: { name?: string; description?: string | null; defaultStyle?: string | null }) => {
			if (!storeId) {
				throw new Error('Store ID is required')
			}

			setIsLoading(true)
			setError(null)

			try {
				await updateStoreInfo(storeId, data)
			} catch (err) {
				const error = err instanceof Error ? err : new Error('Failed to update store info')
				setError(error)
				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[storeId],
	)

	return { updateInfo: update, isLoading, error }
}

// ==================== Store Context ====================

interface StoreContextValue {
	/** The currently selected store with real-time updates */
	currentStore: StoreDocument | null
	/** All stores owned by the user */
	stores: StoreDocument[]
	/** Loading state for stores list */
	isLoading: boolean
	/** Loading state for current store */
	isCurrentStoreLoading: boolean
	/** Select a different store */
	selectStore: (storeId: string) => void
	/** Refresh the stores list */
	refresh: () => void
	/** Update current store basic info */
	updateStoreInfo: (data: { name?: string; description?: string | null; defaultStyle?: string | null }) => Promise<void>
	/** Update current store settings */
	updateStoreSettings: (settings: {
		defaultAspectRatio?: string
		defaultImageCount?: number
		watermarkEnabled?: boolean
	}) => Promise<void>
	/** Whether an update operation is in progress */
	isUpdating: boolean
	/** Error from the last update operation */
	updateError: Error | null
}

const StoreContext = createContext<StoreContextValue | null>(null)

interface StoreProviderProps {
	children: ReactNode
	userId: string | null
}

/**
 * Store context provider for managing the current active store
 * Provides real-time subscription to the current store and update methods.
 */
export function StoreProvider({ children, userId }: StoreProviderProps) {
	const { stores, isLoading, refresh } = useStores(userId)
	const [currentStoreId, setCurrentStoreId] = useState<string | null>(null)
	const [currentStore, setCurrentStore] = useState<StoreDocument | null>(null)
	const [isCurrentStoreLoading, setIsCurrentStoreLoading] = useState(false)
	const [isUpdating, setIsUpdating] = useState(false)
	const [updateError, setUpdateError] = useState<Error | null>(null)

	// Auto-select first store if none selected
	useEffect(() => {
		const firstStore = stores[0]
		if (!currentStoreId && firstStore) {
			setCurrentStoreId(firstStore.id)
		}
	}, [stores, currentStoreId])

	// Persist selected store in localStorage
	useEffect(() => {
		if (typeof window !== 'undefined' && currentStoreId) {
			localStorage.setItem('selectedStoreId', currentStoreId)
		}
	}, [currentStoreId])

	// Load selected store from localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedStoreId = localStorage.getItem('selectedStoreId')
			if (savedStoreId && stores.some((s) => s.id === savedStoreId)) {
				setCurrentStoreId(savedStoreId)
			}
		}
	}, [stores])

	// Subscribe to current store for real-time updates
	useEffect(() => {
		if (!currentStoreId) {
			setCurrentStore(null)
			return
		}

		setIsCurrentStoreLoading(true)

		const unsubscribe = subscribeToStore(currentStoreId, (store) => {
			setCurrentStore(store)
			setIsCurrentStoreLoading(false)
		})

		return () => unsubscribe()
	}, [currentStoreId])

	const selectStore = useCallback((storeId: string) => {
		setCurrentStoreId(storeId)
	}, [])

	const handleUpdateStoreInfo = useCallback(
		async (data: { name?: string; description?: string | null; defaultStyle?: string | null }) => {
			if (!currentStoreId) {
				throw new Error('No store selected')
			}

			setIsUpdating(true)
			setUpdateError(null)

			try {
				await updateStoreInfo(currentStoreId, data)
			} catch (err) {
				const error = err instanceof Error ? err : new Error('Failed to update store info')
				setUpdateError(error)
				throw error
			} finally {
				setIsUpdating(false)
			}
		},
		[currentStoreId],
	)

	const handleUpdateStoreSettings = useCallback(
		async (settings: { defaultAspectRatio?: string; defaultImageCount?: number; watermarkEnabled?: boolean }) => {
			if (!currentStoreId) {
				throw new Error('No store selected')
			}

			setIsUpdating(true)
			setUpdateError(null)

			try {
				await updateStoreSettingsFirestore(currentStoreId, settings)
			} catch (err) {
				const error = err instanceof Error ? err : new Error('Failed to update store settings')
				setUpdateError(error)
				throw error
			} finally {
				setIsUpdating(false)
			}
		},
		[currentStoreId],
	)

	return (
		<StoreContext.Provider
			value={{
				currentStore,
				stores,
				isLoading,
				isCurrentStoreLoading,
				selectStore,
				refresh,
				updateStoreInfo: handleUpdateStoreInfo,
				updateStoreSettings: handleUpdateStoreSettings,
				isUpdating,
				updateError,
			}}>
			{children}
		</StoreContext.Provider>
	)
}

/**
 * Hook to access the current store context
 */
export function useCurrentStore(): StoreContextValue {
	const context = useContext(StoreContext)
	if (!context) {
		throw new Error('useCurrentStore must be used within a StoreProvider')
	}
	return context
}
