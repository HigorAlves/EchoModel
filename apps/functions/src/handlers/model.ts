/**
 * @fileoverview Model Firestore Trigger Handlers
 *
 * Handles Firestore events for the Model collection.
 * Implements the calibration workflow when a new model is created.
 */

import { randomUUID } from 'node:crypto'
import { Asset, createContext, Model } from '@foundry/application'
import { type CalibrationFashionConfig, type CalibrationParams, ModelStatus } from '@foundry/domain'
import * as logger from 'firebase-functions/logger'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { db, StoragePaths, storage } from '../lib/firebase'
import { FirestoreAssetRepository, FirestoreModelRepository } from '../repositories'
import { Seedream45Service } from '../services/seedream45.service'
import { FirebaseStorageService } from '../services/storage.service'

// Initialize repositories
const modelRepository = new FirestoreModelRepository(db)
const assetRepository = new FirestoreAssetRepository(db)

// Initialize services
const seedreamService = new Seedream45Service()
const storageService = new FirebaseStorageService(storage)

// Initialize application layer commands/queries
const getModelByIdQuery = new Model.GetModelByIdQuery(modelRepository)
const completeCalibrationCommand = new Model.CompleteCalibrationCommand(modelRepository)
const failCalibrationCommand = new Model.FailCalibrationCommand(modelRepository)
const getAssetByIdQuery = new Asset.GetAssetByIdQuery(assetRepository)

/**
 * Resolve reference images to signed download URLs
 *
 * Supports two formats:
 * - Storage paths (contain '/') - e.g., 'stores/{storeId}/model-references/{modelId}/{filename}'
 * - Asset IDs (no '/') - legacy format, looks up in Asset collection
 *
 * Returns signed URLs that Seedream can access (bypasses storage rules)
 */
async function resolveReferenceImages(
	referenceImageIds: readonly string[],
	storageService: FirebaseStorageService,
): Promise<string[]> {
	const urls: string[] = []

	for (const idOrPath of referenceImageIds) {
		try {
			// Check if it's a storage path (contains '/') or an asset ID
			if (idOrPath.includes('/')) {
				// Direct storage path - generate signed URL directly
				const url = await storageService.generateDownloadUrl(idOrPath, 3600)
				urls.push(url)
			} else {
				// Legacy asset ID format - look up in Asset collection
				const asset = await getAssetByIdQuery.execute({ assetId: idOrPath })
				if (asset) {
					const url = await storageService.generateDownloadUrl(asset.storagePath, 3600)
					urls.push(url)
				} else {
					logger.warn('Asset not found for reference image', { assetId: idOrPath })
				}
			}
		} catch (error) {
			logger.error('Failed to resolve reference image', {
				idOrPath,
				error: error instanceof Error ? error.message : String(error),
			})
		}
	}

	return urls
}

/**
 * Store generated calibration images in Firebase Storage
 * Returns array of asset IDs for the stored images
 */
async function storeCalibrationImages(
	images: Array<{ id: string; url: string }>,
	storeId: string,
	modelId: string,
): Promise<string[]> {
	const assetIds: string[] = []

	for (const image of images) {
		const assetId = randomUUID()
		const filename = `calibration-${assetId}.png`
		const storagePath = StoragePaths.getCalibrationPath(storeId, modelId, filename)

		try {
			// Download the image from the temporary URL and upload to Firebase Storage
			await storageService.uploadFromUrl(storagePath, image.url, 'image/png')
			assetIds.push(assetId)

			logger.info('Stored calibration image', {
				assetId,
				storagePath,
				modelId,
			})
		} catch (error) {
			logger.error('Failed to store calibration image', {
				assetId,
				storagePath,
				error: error instanceof Error ? error.message : String(error),
			})
			// Continue with other images even if one fails
		}
	}

	return assetIds
}

/**
 * Build calibration parameters from model data
 */
function buildCalibrationParams(model: Model.ModelOutput, referenceImageUrls: string[]): CalibrationParams {
	// Build fashion config from model configuration
	const fashionConfig: CalibrationFashionConfig = {
		lightingPreset: model.lightingConfig.preset,
		cameraFraming: model.cameraConfig.framing,
		texturePreferences: [...model.texturePreferences],
	}

	return {
		prompt: model.prompt ?? undefined,
		referenceImageUrls: referenceImageUrls.length > 0 ? referenceImageUrls : undefined,
		gender: model.gender,
		ageRange: model.ageRange,
		ethnicity: model.ethnicity,
		bodyType: model.bodyType,
		count: 6, // Generate 6 calibration images
		useSequentialGeneration: true, // Use sequential generation for better consistency
		fashionConfig,
	}
}

/**
 * Firestore trigger - called when a new model document is created
 *
 * This function is triggered whenever a new document is added to the models collection.
 * It implements the calibration workflow:
 * 1. Validate the model is in CALIBRATING status
 * 2. Fetch model data via application layer
 * 3. Build calibration prompt from model attributes
 * 4. Resolve reference images to URLs
 * 5. Call Seedream45Service to generate 6 calibration images
 * 6. Store generated images in Firebase Storage
 * 7. Update model with calibration images via application layer
 * 8. Handle errors by setting status to FAILED
 */
export const onModelCreated = onDocumentCreated(
	{
		document: 'models/{modelId}',
		maxInstances: 10,
		timeoutSeconds: 540, // 9 minutes for image generation
		secrets: ['BYTEPLUS_API_KEY', 'BYTEPLUS_ENDPOINT_ID'],
	},
	async (event) => {
		const snapshot = event.data
		if (!snapshot) {
			logger.warn('onModelCreated triggered with no document data')
			return
		}

		const modelId = event.params.modelId
		const modelData = snapshot.data()
		const correlationId = `calibration-${modelId}-${Date.now()}`
		const ctx = createContext({ correlationId })

		logger.info('onModelCreated triggered', {
			modelId,
			storeId: modelData.storeId,
			name: modelData.name,
			status: modelData.status,
			correlationId,
		})

		try {
			// 1. Fetch model via application layer query
			const model = await getModelByIdQuery.execute({ modelId })
			if (!model) {
				logger.warn('Model not found', { modelId, correlationId })
				return
			}

			// 2. Skip if not CALIBRATING or already has calibration images
			if (model.status !== ModelStatus.CALIBRATING) {
				logger.info('Model not in CALIBRATING status, skipping', {
					modelId,
					status: model.status,
					correlationId,
				})
				return
			}

			if (model.calibrationImages.length > 0) {
				logger.info('Model already has calibration images, skipping', {
					modelId,
					calibrationImageCount: model.calibrationImages.length,
					correlationId,
				})
				return
			}

			// 3. Resolve reference images to URLs
			const referenceImageUrls = await resolveReferenceImages(model.referenceImages, storageService)

			logger.info('Resolved reference images', {
				modelId,
				referenceImageCount: referenceImageUrls.length,
				correlationId,
			})

			// 4. Build CalibrationParams and call Seedream
			const calibrationParams = buildCalibrationParams(model, referenceImageUrls)

			logger.info('Starting calibration image generation', {
				modelId,
				hasPrompt: !!calibrationParams.prompt,
				referenceImageCount: calibrationParams.referenceImageUrls?.length ?? 0,
				count: calibrationParams.count,
				correlationId,
			})

			const result = await seedreamService.generateCalibrationImages(calibrationParams)

			if (!result.success) {
				throw new Error(result.error ?? 'Calibration image generation failed')
			}

			logger.info('Calibration images generated', {
				modelId,
				imageCount: result.images.length,
				processingTimeMs: result.processingTimeMs,
				correlationId,
			})

			// 5. Store images in Firebase Storage
			const calibrationImageIds = await storeCalibrationImages(result.images, model.storeId, modelId)

			if (calibrationImageIds.length === 0) {
				throw new Error('Failed to store any calibration images')
			}

			logger.info('Calibration images stored', {
				modelId,
				storedCount: calibrationImageIds.length,
				correlationId,
			})

			// 6. Update model via application layer command
			await completeCalibrationCommand.execute({ modelId, calibrationImageIds }, ctx)

			logger.info('Model calibration completed', {
				modelId,
				calibrationImageCount: calibrationImageIds.length,
				correlationId,
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)

			logger.error('Failed to process model calibration', {
				modelId,
				correlationId,
				error: errorMessage,
				stack: error instanceof Error ? error.stack : undefined,
			})

			// 7. Mark as failed via application layer command
			try {
				await failCalibrationCommand.execute({ modelId, reason: errorMessage }, ctx)
				logger.info('Model marked as FAILED', { modelId, correlationId })
			} catch (failError) {
				logger.error('Failed to mark model as FAILED', {
					modelId,
					correlationId,
					error: failError instanceof Error ? failError.message : String(failError),
				})
			}

			// Do not re-throw to prevent infinite retries
		}
	},
)
