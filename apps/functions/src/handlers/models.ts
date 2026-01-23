/**
 * @fileoverview Model Cloud Function Handlers
 *
 * Handles model creation, calibration, and management operations.
 */

import { Model } from '@foundry/domain'
import * as logger from 'firebase-functions/logger'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { db } from '../lib/firebase'
import { FirestoreModelRepository, FirestoreStoreRepository } from '../repositories'
import { type CreateModelInput, CreateModelInputSchema } from './schemas'

const modelRepository = new FirestoreModelRepository(db)
const storeRepository = new FirestoreStoreRepository(db)

/**
 * Create a new AI model/influencer
 */
export const createModel = onCall<CreateModelInput>({ maxInstances: 10, timeoutSeconds: 30 }, async (request) => {
	logger.info('createModel called', { data: request.data })

	// Validate auth
	const userId = request.auth?.uid
	if (!userId) {
		throw new HttpsError('unauthenticated', 'Authentication required')
	}

	// Validate input
	const parseResult = CreateModelInputSchema.safeParse(request.data)
	if (!parseResult.success) {
		const firstError = parseResult.error.errors[0]
		logger.warn('Invalid input', {
			errors: parseResult.error.errors,
			receivedData: request.data,
		})
		throw new HttpsError('invalid-argument', firstError?.message ?? 'Invalid input')
	}

	const input = parseResult.data

	try {
		// Verify user has access to the store
		const store = await storeRepository.findById(input.storeId)
		if (!store) {
			throw new HttpsError('not-found', 'Store not found')
		}
		if (store.ownerId !== userId) {
			logger.warn('Unauthorized store access attempt', { userId, storeId: input.storeId, storeOwnerId: store.ownerId })
			throw new HttpsError('permission-denied', 'You do not have access to this store')
		}

		logger.info('Creating model with DTO', {
			hasId: !!input.id,
			hasPrompt: !!input.prompt,
			hasReferenceImages: !!input.referenceImageIds,
			referenceImageCount: input.referenceImageIds?.length || 0,
		})

		// Create the model with Seedream 4.5 Fashion configuration
		const model = Model.createFromDTO({
			id: input.id, // Pass pre-generated modelId if provided
			storeId: input.storeId,
			name: input.name,
			description: input.description,
			gender: input.gender,
			ageRange: input.ageRange,
			ethnicity: input.ethnicity,
			bodyType: input.bodyType,
			prompt: input.prompt,
			referenceImageIds: input.referenceImageIds,
			// Fashion configuration
			lightingPreset: input.lightingPreset,
			customLightingSettings: input.customLightingSettings,
			cameraFraming: input.cameraFraming,
			customCameraSettings: input.customCameraSettings,
			backgroundType: input.backgroundType,
			poseStyle: input.poseStyle,
			expression: input.expression,
			postProcessingStyle: input.postProcessingStyle,
			texturePreferences: input.texturePreferences,
			productCategories: input.productCategories,
			supportOutfitSwapping: input.supportOutfitSwapping,
		})

		logger.info('Model entity created', { modelId: model.id.value })

		// Persist the model
		const modelId = await modelRepository.create(model)

		logger.info('Model created successfully', {
			modelId,
			storeId: input.storeId,
			preGeneratedId: input.id !== undefined,
			lightingPreset: model.lightingConfig.preset,
			cameraFraming: model.cameraConfig.framing,
			supportOutfitSwapping: model.supportOutfitSwapping,
		})

		return {
			success: true,
			modelId,
			status: model.status,
		}
	} catch (error) {
		logger.error('Failed to create model', {
			error,
			errorMessage: error instanceof Error ? error.message : String(error),
			errorStack: error instanceof Error ? error.stack : undefined,
			errorName: error instanceof Error ? error.constructor.name : typeof error,
		})

		if (error instanceof HttpsError) {
			throw error
		}

		throw new HttpsError(
			'internal',
			`Failed to create model: ${error instanceof Error ? error.message : String(error)}`,
		)
	}
})
