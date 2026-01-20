'use client'

/**
 * @fileoverview Stores Hooks
 *
 * React hooks for store management with real-time Firestore updates
 * and Cloud Functions for mutations.
 */

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import {
	type CreateStoreInput,
	createStore,
	getStoreById,
	type StoreDocument,
	subscribeToStores,
	updateStoreSettings,
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
				return { storeId: result.data.storeId }
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
 * Hook to update store settings
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
				await updateStoreSettings({ storeId, settings })
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

// ==================== Store Context ====================

interface StoreContextValue {
	currentStore: StoreDocument | null
	stores: StoreDocument[]
	isLoading: boolean
	selectStore: (storeId: string) => void
	refresh: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

interface StoreProviderProps {
	children: ReactNode
	userId: string | null
}

/**
 * Store context provider for managing the current active store
 */
export function StoreProvider({ children, userId }: StoreProviderProps) {
	const { stores, isLoading, refresh } = useStores(userId)
	const [currentStoreId, setCurrentStoreId] = useState<string | null>(null)

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

	const currentStore = stores.find((s) => s.id === currentStoreId) ?? null

	const selectStore = useCallback((storeId: string) => {
		setCurrentStoreId(storeId)
	}, [])

	return (
		<StoreContext.Provider
			value={{
				currentStore,
				stores,
				isLoading,
				selectStore,
				refresh,
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
