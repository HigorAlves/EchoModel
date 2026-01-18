'use client'

/**
 * @fileoverview Generations Hooks
 *
 * React hooks for generation management with real-time Firestore updates
 * and Cloud Functions for mutations.
 */

import { useState, useEffect, useCallback } from 'react'
import {
	subscribeToGenerations,
	getGeneration,
	createGeneration,
	processGeneration,
	type GenerationDocument,
	type CreateGenerationInput,
} from '@/lib/firebase'

// ==================== Types ====================

export interface UseGenerationsOptions {
	modelId?: string
	status?: GenerationDocument['status']
	limit?: number
}

export interface UseGenerationsResult {
	generations: GenerationDocument[]
	isLoading: boolean
	error: Error | null
	refresh: () => void
}

export interface UseGenerationResult {
	generation: GenerationDocument | null
	isLoading: boolean
	error: Error | null
	refresh: () => Promise<void>
}

export interface UseCreateGenerationResult {
	createGeneration: (input: Omit<CreateGenerationInput, 'storeId'>) => Promise<{
		generationId: string
		isExisting: boolean
	}>
	isLoading: boolean
	error: Error | null
}

export interface UseProcessGenerationResult {
	processGeneration: (generationId: string) => Promise<void>
	isLoading: boolean
	error: Error | null
}

// ==================== Hooks ====================

/**
 * Hook to subscribe to generations for a store
 */
export function useGenerations(storeId: string | null, options?: UseGenerationsOptions): UseGenerationsResult {
	const [generations, setGenerations] = useState<GenerationDocument[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)
	const [refreshTrigger, setRefreshTrigger] = useState(0)

	useEffect(() => {
		if (!storeId) {
			setGenerations([])
			setIsLoading(false)
			return
		}

		setIsLoading(true)
		setError(null)

		const unsubscribe = subscribeToGenerations(
			storeId,
			(fetchedGenerations) => {
				setGenerations(fetchedGenerations)
				setIsLoading(false)
			},
			{
				modelId: options?.modelId,
				status: options?.status,
				limitCount: options?.limit,
			}
		)

		return () => unsubscribe()
	}, [storeId, options?.modelId, options?.status, options?.limit, refreshTrigger])

	const refresh = useCallback(() => {
		setRefreshTrigger((prev) => prev + 1)
	}, [])

	return { generations, isLoading, error, refresh }
}

/**
 * Hook to get a single generation by ID
 */
export function useGeneration(generationId: string | null): UseGenerationResult {
	const [generation, setGeneration] = useState<GenerationDocument | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchGeneration = useCallback(async () => {
		if (!generationId) {
			setGeneration(null)
			setIsLoading(false)
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const fetchedGeneration = await getGeneration(generationId)
			setGeneration(fetchedGeneration)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch generation'))
		} finally {
			setIsLoading(false)
		}
	}, [generationId])

	useEffect(() => {
		fetchGeneration()
	}, [fetchGeneration])

	return { generation, isLoading, error, refresh: fetchGeneration }
}

/**
 * Hook to create a new generation request
 */
export function useCreateGeneration(storeId: string | null): UseCreateGenerationResult {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const create = useCallback(
		async (input: Omit<CreateGenerationInput, 'storeId'>) => {
			if (!storeId) {
				throw new Error('Store ID is required')
			}

			setIsLoading(true)
			setError(null)

			try {
				const result = await createGeneration({ ...input, storeId })
				return {
					generationId: result.data.generationId,
					isExisting: result.data.isExisting,
				}
			} catch (err) {
				const error = err instanceof Error ? err : new Error('Failed to create generation')
				setError(error)
				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[storeId]
	)

	return { createGeneration: create, isLoading, error }
}

/**
 * Hook to process a generation
 */
export function useProcessGeneration(): UseProcessGenerationResult {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const process = useCallback(async (generationId: string) => {
		setIsLoading(true)
		setError(null)

		try {
			await processGeneration({ generationId })
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Failed to process generation')
			setError(error)
			throw error
		} finally {
			setIsLoading(false)
		}
	}, [])

	return { processGeneration: process, isLoading, error }
}

/**
 * Hook to get generation statistics for a store
 */
export function useGenerationStats(storeId: string | null) {
	const { generations, isLoading } = useGenerations(storeId)

	const stats = {
		total: generations.length,
		pending: generations.filter((g) => g.status === 'PENDING').length,
		processing: generations.filter((g) => g.status === 'PROCESSING').length,
		completed: generations.filter((g) => g.status === 'COMPLETED').length,
		failed: generations.filter((g) => g.status === 'FAILED').length,
		totalImages: generations.reduce((acc, g) => acc + g.generatedImages.length, 0),
	}

	return { stats, isLoading }
}
