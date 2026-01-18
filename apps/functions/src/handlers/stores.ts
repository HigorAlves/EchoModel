/**
 * @fileoverview Store Cloud Function Handlers
 *
 * Handles store creation and management operations.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'
import { db } from '../lib/firebase'
import { FirestoreStoreRepository } from '../repositories'
import { Store, AspectRatio, isValidAspectRatio } from '@foundry/domain'
import { CreateStoreInputSchema, type CreateStoreInput } from './schemas'

// Initialize repositories
const storeRepository = new FirestoreStoreRepository(db)

/**
 * Create a new store
 */
export const createStore = onCall<CreateStoreInput>(
	{ maxInstances: 10, timeoutSeconds: 30 },
	async (request) => {
		logger.info('createStore called', { data: request.data })

		const userId = request.auth?.uid
		if (!userId) {
			throw new HttpsError('unauthenticated', 'Authentication required')
		}

		const parseResult = CreateStoreInputSchema.safeParse(request.data)
		if (!parseResult.success) {
			logger.warn('Invalid input', { errors: parseResult.error.errors })
			throw new HttpsError('invalid-argument', parseResult.error?.errors[0]?.message ?? 'Invalid input')
		}

		const input = parseResult.data

		// Verify the user is creating a store for themselves
		if (input.ownerId !== userId) {
			throw new HttpsError('permission-denied', 'Cannot create store for another user')
		}

		try {
			// Create the store
			const store = Store.create({
				name: input.name,
				description: input.description,
				defaultStyle: input.defaultStyle,
				ownerId: input.ownerId,
			})

			const storeId = await storeRepository.create(store)

			logger.info('Store created successfully', { storeId, ownerId: input.ownerId })

			return {
				success: true,
				storeId,
				status: store.status,
			}
		} catch (error) {
			logger.error('Failed to create store', { error })
			throw new HttpsError('internal', 'Failed to create store')
		}
	},
)

/**
 * Get stores for the current user
 */
export const getMyStores = onCall(
	{ maxInstances: 20, timeoutSeconds: 10 },
	async (request) => {
		logger.info('getMyStores called')

		const userId = request.auth?.uid
		if (!userId) {
			throw new HttpsError('unauthenticated', 'Authentication required')
		}

		try {
			const stores = await storeRepository.findByOwnerId(userId)

			return {
				success: true,
				stores: stores.map((store) => ({
					id: store.id.value,
					name: store.name.value,
					description: store.description?.value ?? null,
					defaultStyle: store.defaultStyle?.value ?? null,
					logoAssetId: store.logoAssetId,
					status: store.status,
					settings: store.settings,
					createdAt: store.createdAt.toISOString(),
					updatedAt: store.updatedAt.toISOString(),
				})),
			}
		} catch (error) {
			logger.error('Failed to get stores', { error })
			throw new HttpsError('internal', 'Failed to get stores')
		}
	},
)

/**
 * Get a specific store
 */
export const getStore = onCall<{ storeId: string }>(
	{ maxInstances: 20, timeoutSeconds: 10 },
	async (request) => {
		logger.info('getStore called', { data: request.data })

		const userId = request.auth?.uid
		if (!userId) {
			throw new HttpsError('unauthenticated', 'Authentication required')
		}

		const { storeId } = request.data

		if (!storeId) {
			throw new HttpsError('invalid-argument', 'Store ID is required')
		}

		try {
			const store = await storeRepository.findById(storeId)

			if (!store) {
				throw new HttpsError('not-found', 'Store not found')
			}

			if (store.ownerId !== userId) {
				throw new HttpsError('permission-denied', 'Not authorized to view this store')
			}

			return {
				success: true,
				store: {
					id: store.id.value,
					name: store.name.value,
					description: store.description?.value ?? null,
					defaultStyle: store.defaultStyle?.value ?? null,
					logoAssetId: store.logoAssetId,
					status: store.status,
					settings: store.settings,
					createdAt: store.createdAt.toISOString(),
					updatedAt: store.updatedAt.toISOString(),
				},
			}
		} catch (error) {
			logger.error('Failed to get store', { error })

			if (error instanceof HttpsError) {
				throw error
			}

			throw new HttpsError('internal', 'Failed to get store')
		}
	},
)

/**
 * Update store settings
 */
export const updateStoreSettings = onCall<{
	storeId: string
	settings: {
		defaultAspectRatio?: string
		defaultImageCount?: number
		watermarkEnabled?: boolean
	}
}>(
	{ maxInstances: 10, timeoutSeconds: 30 },
	async (request) => {
		logger.info('updateStoreSettings called', { data: request.data })

		const userId = request.auth?.uid
		if (!userId) {
			throw new HttpsError('unauthenticated', 'Authentication required')
		}

		const { storeId, settings } = request.data

		if (!storeId) {
			throw new HttpsError('invalid-argument', 'Store ID is required')
		}

		try {
			const store = await storeRepository.findById(storeId)

			if (!store) {
				throw new HttpsError('not-found', 'Store not found')
			}

			if (store.ownerId !== userId) {
				throw new HttpsError('permission-denied', 'Not authorized to update this store')
			}

			// Convert string aspect ratio to enum if provided
			const validatedSettings: {
				defaultAspectRatio?: AspectRatio
				defaultImageCount?: number
				watermarkEnabled?: boolean
			} = {}

			if (settings.defaultAspectRatio) {
				if (!isValidAspectRatio(settings.defaultAspectRatio)) {
					throw new HttpsError('invalid-argument', 'Invalid aspect ratio')
				}
				validatedSettings.defaultAspectRatio = settings.defaultAspectRatio as AspectRatio
			}
			if (settings.defaultImageCount !== undefined) {
				validatedSettings.defaultImageCount = settings.defaultImageCount
			}
			if (settings.watermarkEnabled !== undefined) {
				validatedSettings.watermarkEnabled = settings.watermarkEnabled
			}

			const updatedStore = store.updateSettings(validatedSettings)
			await storeRepository.update(updatedStore)

			logger.info('Store settings updated', { storeId })

			return {
				success: true,
				storeId,
				settings: updatedStore.settings,
			}
		} catch (error) {
			logger.error('Failed to update store settings', { error })

			if (error instanceof HttpsError) {
				throw error
			}

			throw new HttpsError('internal', 'Failed to update store settings')
		}
	},
)
