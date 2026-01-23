'use client'

/**
 * @fileoverview Models Hooks
 *
 * React hooks for model management with real-time Firestore updates.
 */

import { useCallback, useEffect, useState } from 'react'
import { getModel, type ModelDocument, subscribeToModels } from '@/lib/firebase'

// ==================== Types ====================

export interface UseModelsOptions {
	includeArchived?: boolean
	includeDeleted?: boolean
	status?: ModelDocument['status']
	limit?: number
}

export interface UseModelsResult {
	models: ModelDocument[]
	isLoading: boolean
	error: Error | null
	refresh: () => void
}

export interface UseModelResult {
	model: ModelDocument | null
	isLoading: boolean
	error: Error | null
	refresh: () => Promise<void>
}

// ==================== Hooks ====================

/**
 * Hook to subscribe to models for a store
 */
export function useModels(storeId: string | null, options?: UseModelsOptions): UseModelsResult {
	const [models, setModels] = useState<ModelDocument[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)
	const [_refreshTrigger, setRefreshTrigger] = useState(0)

	useEffect(() => {
		if (!storeId) {
			setModels([])
			setIsLoading(false)
			return
		}

		setIsLoading(true)
		setError(null)

		const unsubscribe = subscribeToModels(
			storeId,
			(fetchedModels) => {
				setModels(fetchedModels)
				setIsLoading(false)
			},
			{
				includeArchived: options?.includeArchived,
				includeDeleted: options?.includeDeleted,
				status: options?.status,
				limitCount: options?.limit,
			},
		)

		return () => unsubscribe()
	}, [storeId, options?.includeArchived, options?.includeDeleted, options?.status, options?.limit])

	const refresh = useCallback(() => {
		setRefreshTrigger((prev) => prev + 1)
	}, [])

	return { models, isLoading, error, refresh }
}

/**
 * Hook to get a single model by ID
 */
export function useModel(modelId: string | null): UseModelResult {
	const [model, setModel] = useState<ModelDocument | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchModel = useCallback(async () => {
		if (!modelId) {
			setModel(null)
			setIsLoading(false)
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const fetchedModel = await getModel(modelId)
			setModel(fetchedModel)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch model'))
		} finally {
			setIsLoading(false)
		}
	}, [modelId])

	useEffect(() => {
		fetchModel()
	}, [fetchModel])

	return { model, isLoading, error, refresh: fetchModel }
}
