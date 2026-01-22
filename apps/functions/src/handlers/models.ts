/**
 * @fileoverview Model Cloud Function Handlers
 *
 * Handles model creation, calibration, and management operations.
 */

import { AssetCategory, AssetStatus, Model } from '@foundry/domain'
import * as logger from 'firebase-functions/logger'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { db, storage } from '../lib/firebase'
import { FirestoreAssetRepository, FirestoreModelRepository, FirestoreStoreRepository } from '../repositories'
import { FirebaseStorageService, Seedream45Service } from '../services'
import {
	type ApproveCalibrationInput,
	ApproveCalibrationInputSchema,
	type CreateModelInput,
	CreateModelInputSchema,
	type RejectCalibrationInput,
	RejectCalibrationInputSchema,
	type StartCalibrationInput,
	StartCalibrationInputSchema,
} from './schemas'

// Initialize repositories and services
const modelRepository = new FirestoreModelRepository(db)
const assetRepository = new FirestoreAssetRepository(db)
const storeRepository = new FirestoreStoreRepository(db)
const storageService = new FirebaseStorageService(storage)
const seedream45Service = new Seedream45Service()

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
		logger.warn('Invalid input', { errors: parseResult.error.errors })
		throw new HttpsError('invalid-argument', parseResult.error?.errors[0]?.message ?? 'Invalid input')
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

		// Create the model with Seedream 4.5 Fashion configuration
		const model = Model.createFromDTO({
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

		// Persist the model
		const modelId = await modelRepository.create(model)

		logger.info('Model created successfully', {
			modelId,
			storeId: input.storeId,
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
		logger.error('Failed to create model', { error })
		throw new HttpsError('internal', 'Failed to create model')
	}
})

/**
 * Start the calibration process for a model
 */
export const startCalibration = onCall<StartCalibrationInput>(
	{ maxInstances: 10, timeoutSeconds: 120 },
	async (request) => {
		logger.info('startCalibration called', { data: request.data })

		const userId = request.auth?.uid
		if (!userId) {
			throw new HttpsError('unauthenticated', 'Authentication required')
		}

		const parseResult = StartCalibrationInputSchema.safeParse(request.data)
		if (!parseResult.success) {
			throw new HttpsError('invalid-argument', parseResult.error?.errors[0]?.message ?? 'Invalid input')
		}

		const { modelId, storeId } = parseResult.data

		try {
			// Get the model
			const model = await modelRepository.findById(modelId)
			if (!model) {
				throw new HttpsError('not-found', 'Model not found')
			}

			if (model.storeId !== storeId) {
				throw new HttpsError('permission-denied', 'Model does not belong to this store')
			}

			// Get reference image URLs if any
			let referenceImageUrls: string[] = []
			if (model.referenceImages.length > 0) {
				const referenceAssets = await Promise.all(
					model.referenceImages.map((assetId) => assetRepository.findById(assetId)),
				)

				referenceImageUrls = await Promise.all(
					referenceAssets
						.filter((asset): asset is NonNullable<typeof asset> => asset !== null && asset.status === AssetStatus.READY)
						.map((asset) => storageService.generateDownloadUrl(asset.storagePath.value)),
				)
			}

			// Transition model to calibrating
			const calibratingModel = model.startCalibration()
			await modelRepository.update(calibratingModel)

			// Generate calibration images with Seedream 4.5 multi-image support
			const calibrationResult = await seedream45Service.generateCalibrationImages({
				prompt: model.prompt?.value,
				referenceImageUrls: referenceImageUrls.length > 0 ? referenceImageUrls : undefined,
				gender: model.gender,
				ageRange: model.ageRange,
				ethnicity: model.ethnicity,
				bodyType: model.bodyType,
				count: 4, // Generate 4 calibration images
				// Enable sequential generation for batch calibration output
				useSequentialGeneration: true,
				// Pass model's fashion configuration to calibration
				fashionConfig: {
					lightingPreset: model.lightingConfig.preset,
					cameraFraming: model.cameraConfig.framing,
					texturePreferences: [...model.texturePreferences.value],
				},
			})

			if (!calibrationResult.success) {
				// Mark model as failed
				const failedModel = calibratingModel.rejectCalibration(
					calibrationResult.error ?? 'Calibration generation failed',
				)
				await modelRepository.update(failedModel)

				logger.error('Calibration failed', { modelId, error: calibrationResult.error })

				return {
					success: false,
					error: calibrationResult.error,
				}
			}

			// Store calibration images and update model
			const calibrationImageIds: string[] = []
			let updatedModel = calibratingModel

			for (const image of calibrationResult.images) {
				// Create asset for calibration image
				const asset = await createCalibrationAsset(storeId, modelId, image.url, userId)
				calibrationImageIds.push(asset.id.value)
				updatedModel = updatedModel.addCalibrationImage(asset.id.value)
			}

			await modelRepository.update(updatedModel)

			logger.info('Calibration completed', {
				modelId,
				imageCount: calibrationImageIds.length,
			})

			return {
				success: true,
				modelId,
				calibrationImages: calibrationResult.images,
				lockedIdentityUrl: calibrationResult.lockedIdentityUrl,
			}
		} catch (error) {
			logger.error('Failed to start calibration', { error, modelId })

			if (error instanceof HttpsError) {
				throw error
			}

			throw new HttpsError('internal', 'Failed to start calibration')
		}
	},
)

/**
 * Approve calibration and activate the model
 */
export const approveCalibration = onCall<ApproveCalibrationInput>(
	{ maxInstances: 10, timeoutSeconds: 60 },
	async (request) => {
		logger.info('approveCalibration called', { data: request.data })

		const userId = request.auth?.uid
		if (!userId) {
			throw new HttpsError('unauthenticated', 'Authentication required')
		}

		const parseResult = ApproveCalibrationInputSchema.safeParse(request.data)
		if (!parseResult.success) {
			throw new HttpsError('invalid-argument', parseResult.error?.errors[0]?.message ?? 'Invalid input')
		}

		const { modelId, storeId, selectedImageIds } = parseResult.data

		try {
			const model = await modelRepository.findById(modelId)
			if (!model) {
				throw new HttpsError('not-found', 'Model not found')
			}

			if (model.storeId !== storeId) {
				throw new HttpsError('permission-denied', 'Model does not belong to this store')
			}

			if (!model.isCalibrating) {
				throw new HttpsError('failed-precondition', 'Model is not in calibrating state')
			}

			// Lock the identity using selected images
			const lockedIdentityUrl = await seedream45Service.lockIdentity(modelId, selectedImageIds)

			// Approve and activate the model
			const activeModel = model.approveCalibration(lockedIdentityUrl)
			await modelRepository.update(activeModel)

			logger.info('Model approved and activated', { modelId, lockedIdentityUrl })

			return {
				success: true,
				modelId,
				status: activeModel.status,
				lockedIdentityUrl,
			}
		} catch (error) {
			logger.error('Failed to approve calibration', { error, modelId })

			if (error instanceof HttpsError) {
				throw error
			}

			throw new HttpsError('internal', 'Failed to approve calibration')
		}
	},
)

/**
 * Reject calibration and mark model as failed
 */
export const rejectCalibration = onCall<RejectCalibrationInput>(
	{ maxInstances: 10, timeoutSeconds: 30 },
	async (request) => {
		logger.info('rejectCalibration called', { data: request.data })

		const userId = request.auth?.uid
		if (!userId) {
			throw new HttpsError('unauthenticated', 'Authentication required')
		}

		const parseResult = RejectCalibrationInputSchema.safeParse(request.data)
		if (!parseResult.success) {
			throw new HttpsError('invalid-argument', parseResult.error?.errors[0]?.message ?? 'Invalid input')
		}

		const { modelId, storeId, reason } = parseResult.data

		try {
			const model = await modelRepository.findById(modelId)
			if (!model) {
				throw new HttpsError('not-found', 'Model not found')
			}

			if (model.storeId !== storeId) {
				throw new HttpsError('permission-denied', 'Model does not belong to this store')
			}

			if (!model.isCalibrating) {
				throw new HttpsError('failed-precondition', 'Model is not in calibrating state')
			}

			// Reject calibration
			const failedModel = model.rejectCalibration(reason)
			await modelRepository.update(failedModel)

			logger.info('Calibration rejected', { modelId, reason })

			return {
				success: true,
				modelId,
				status: failedModel.status,
			}
		} catch (error) {
			logger.error('Failed to reject calibration', { error, modelId })

			if (error instanceof HttpsError) {
				throw error
			}

			throw new HttpsError('internal', 'Failed to reject calibration')
		}
	},
)

import { randomUUID } from 'node:crypto'
/**
 * Helper function to create an asset for a calibration image
 */
import { type AllowedMimeType, Asset, type AssetMetadata } from '@foundry/domain'

async function createCalibrationAsset(
	storeId: string,
	modelId: string,
	imageUrl: string,
	uploadedBy: string,
): Promise<Asset> {
	const assetId = randomUUID()
	const filename = `calibration-${assetId}.jpg`

	const metadata: AssetMetadata = {
		modelId,
	}

	const asset = Asset.requestUpload({
		storeId,
		category: AssetCategory.CALIBRATION,
		filename,
		mimeType: 'image/jpeg' as AllowedMimeType,
		sizeBytes: 0, // Will be updated after download
		uploadedBy,
		metadata,
	})

	// Download image from URL and upload to storage
	const storagePath = asset.storagePath.value
	await storageService.uploadFromUrl(storagePath, imageUrl, 'image/jpeg')

	// Get actual file metadata
	const _fileMetadata = await storageService.getFileMetadata(storagePath)
	const cdnUrl = await storageService.getCdnUrl(storagePath)

	// Mark asset as ready
	const readyAsset = asset.confirmUpload().markReady(cdnUrl ?? undefined)

	await assetRepository.create(readyAsset)

	return readyAsset
}
