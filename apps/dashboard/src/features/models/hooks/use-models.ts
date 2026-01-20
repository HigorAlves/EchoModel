'use client'

/**
 * @fileoverview Models Hooks
 *
 * React hooks for model management with real-time Firestore updates
 * and Cloud Functions for mutations.
 */

import { useCallback, useEffect, useState } from 'react'
import {
	approveCalibration,
	type CreateModelInput,
	createModel,
	getModel,
	type ModelDocument,
	rejectCalibration,
	startCalibration,
	subscribeToModels,
} from '@/lib/firebase'

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

export interface UseCreateModelResult {
	createModel: (input: Omit<CreateModelInput, 'storeId'>) => Promise<{ modelId: string }>
	isLoading: boolean
	error: Error | null
}

export interface UseCalibrationResult {
	startCalibration: () => Promise<void>
	approveCalibration: (selectedImageIds: string[]) => Promise<void>
	rejectCalibration: (reason: string) => Promise<void>
	isLoading: boolean
	error: Error | null
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

/**
 * Hook to create a new model
 */
export function useCreateModel(storeId: string | null): UseCreateModelResult {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const create = useCallback(
		async (input: Omit<CreateModelInput, 'storeId'>) => {
			if (!storeId) {
				throw new Error('Store ID is required')
			}

			setIsLoading(true)
			setError(null)

			try {
				const result = await createModel({ ...input, storeId })
				return { modelId: result.data.modelId }
			} catch (err) {
				const error = err instanceof Error ? err : new Error('Failed to create model')
				setError(error)
				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[storeId],
	)

	return { createModel: create, isLoading, error }
}

/**
 * Hook to manage model calibration
 */
export function useCalibration(modelId: string | null, storeId: string | null): UseCalibrationResult {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const start = useCallback(async () => {
		if (!modelId || !storeId) {
			throw new Error('Model ID and Store ID are required')
		}

		setIsLoading(true)
		setError(null)

		try {
			const result = await startCalibration({ modelId, storeId })
			if (!result.data.success) {
				throw new Error(result.data.error ?? 'Calibration failed')
			}
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Failed to start calibration')
			setError(error)
			throw error
		} finally {
			setIsLoading(false)
		}
	}, [modelId, storeId])

	const approve = useCallback(
		async (selectedImageIds: string[]) => {
			if (!modelId || !storeId) {
				throw new Error('Model ID and Store ID are required')
			}

			setIsLoading(true)
			setError(null)

			try {
				await approveCalibration({ modelId, storeId, selectedImageIds })
			} catch (err) {
				const error = err instanceof Error ? err : new Error('Failed to approve calibration')
				setError(error)
				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[modelId, storeId],
	)

	const reject = useCallback(
		async (reason: string) => {
			if (!modelId || !storeId) {
				throw new Error('Model ID and Store ID are required')
			}

			setIsLoading(true)
			setError(null)

			try {
				await rejectCalibration({ modelId, storeId, reason })
			} catch (err) {
				const error = err instanceof Error ? err : new Error('Failed to reject calibration')
				setError(error)
				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[modelId, storeId],
	)

	return {
		startCalibration: start,
		approveCalibration: approve,
		rejectCalibration: reject,
		isLoading,
		error,
	}
}
