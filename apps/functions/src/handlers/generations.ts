/**
 * @fileoverview Generation Cloud Function Handlers
 *
 * Handles image generation requests and processing.
 */

import { randomUUID } from 'node:crypto'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { onMessagePublished } from 'firebase-functions/v2/pubsub'
import * as logger from 'firebase-functions/logger'
import { db, storage } from '../lib/firebase'
import {
	FirestoreGenerationRepository,
	FirestoreModelRepository,
	FirestoreAssetRepository,
} from '../repositories'
import { FirebaseStorageService, SeedreamService } from '../services'
import {
	Generation,
	Asset,
	ModelStatus,
	AssetStatus,
	AssetCategory,
	type GeneratedImage,
	type AssetMetadata,
	type AllowedMimeType,
} from '@foundry/domain'
import {
	CreateGenerationInputSchema,
	GenerationCallbackInputSchema,
	type CreateGenerationInput,
	type GenerationCallbackInput,
} from './schemas'

// Initialize repositories and services
const generationRepository = new FirestoreGenerationRepository(db)
const modelRepository = new FirestoreModelRepository(db)
const assetRepository = new FirestoreAssetRepository(db)
const storageService = new FirebaseStorageService(storage)
const seedreamService = new SeedreamService()

/**
 * Create a new image generation request
 */
export const createGeneration = onCall<CreateGenerationInput>(
	{ maxInstances: 10, timeoutSeconds: 30 },
	async (request) => {
		logger.info('createGeneration called', { data: request.data })

		const userId = request.auth?.uid
		if (!userId) {
			throw new HttpsError('unauthenticated', 'Authentication required')
		}

		const parseResult = CreateGenerationInputSchema.safeParse(request.data)
		if (!parseResult.success) {
			logger.warn('Invalid input', { errors: parseResult.error.errors })
			throw new HttpsError('invalid-argument', parseResult.error?.errors[0]?.message ?? 'Invalid input')
		}

		const input = parseResult.data

		try {
			// Generate idempotency key if not provided
			const idempotencyKey = input.idempotencyKey ?? randomUUID()

			// Check for existing generation with same idempotency key
			const existingGeneration = await generationRepository.findByIdempotencyKey(idempotencyKey)
			if (existingGeneration) {
				logger.info('Returning existing generation', {
					generationId: existingGeneration.id.value,
					idempotencyKey,
				})

				return {
					success: true,
					generationId: existingGeneration.id.value,
					status: existingGeneration.status,
					isExisting: true,
				}
			}

			// Validate model exists and is active
			const model = await modelRepository.findById(input.modelId)
			if (!model) {
				throw new HttpsError('not-found', 'Model not found')
			}

			if (model.storeId !== input.storeId) {
				throw new HttpsError('permission-denied', 'Model does not belong to this store')
			}

			if (model.status !== ModelStatus.ACTIVE) {
				throw new HttpsError('failed-precondition', 'Model is not active')
			}

			// Validate garment asset exists and is ready
			const garmentAsset = await assetRepository.findById(input.garmentAssetId)
			if (!garmentAsset) {
				throw new HttpsError('not-found', 'Garment asset not found')
			}

			if (garmentAsset.storeId !== input.storeId) {
				throw new HttpsError('permission-denied', 'Asset does not belong to this store')
			}

			if (garmentAsset.status !== AssetStatus.READY) {
				throw new HttpsError('failed-precondition', 'Garment asset is not ready')
			}

			// Create the generation request
			const generation = Generation.createFromDTO({
				storeId: input.storeId,
				modelId: input.modelId,
				idempotencyKey,
				garmentAssetId: input.garmentAssetId,
				scenePrompt: input.scenePrompt,
				aspectRatios: input.aspectRatios,
				imageCount: input.imageCount,
			})

			const generationId = await generationRepository.create(generation)

			logger.info('Generation created', { generationId, storeId: input.storeId })

			return {
				success: true,
				generationId,
				status: generation.status,
				isExisting: false,
			}
		} catch (error) {
			logger.error('Failed to create generation', { error })

			if (error instanceof HttpsError) {
				throw error
			}

			throw new HttpsError('internal', 'Failed to create generation')
		}
	},
)

/**
 * Process a pending generation (can be triggered via Pub/Sub or directly)
 */
export const processGeneration = onCall<{ generationId: string }>(
	{ maxInstances: 5, timeoutSeconds: 300 },
	async (request) => {
		logger.info('processGeneration called', { data: request.data })

		const userId = request.auth?.uid
		if (!userId) {
			throw new HttpsError('unauthenticated', 'Authentication required')
		}

		const { generationId } = request.data

		if (!generationId) {
			throw new HttpsError('invalid-argument', 'Generation ID is required')
		}

		try {
			return await executeGenerationProcessing(generationId)
		} catch (error) {
			logger.error('Failed to process generation', { error, generationId })

			if (error instanceof HttpsError) {
				throw error
			}

			throw new HttpsError('internal', 'Failed to process generation')
		}
	},
)

/**
 * Handle generation callback from external service
 */
export const handleGenerationCallback = onCall<GenerationCallbackInput>(
	{ maxInstances: 10, timeoutSeconds: 60 },
	async (request) => {
		logger.info('handleGenerationCallback called', { data: request.data })

		const parseResult = GenerationCallbackInputSchema.safeParse(request.data)
		if (!parseResult.success) {
			throw new HttpsError('invalid-argument', parseResult.error?.errors[0]?.message ?? 'Invalid input')
		}

		const input = parseResult.data

		try {
			const generation = await generationRepository.findById(input.generationId)
			if (!generation) {
				throw new HttpsError('not-found', 'Generation not found')
			}

			if (!generation.isProcessing) {
				logger.warn('Generation is not in processing state', {
					generationId: input.generationId,
					status: generation.status,
				})
				throw new HttpsError('failed-precondition', 'Generation is not in processing state')
			}

			if (input.success && input.images) {
				// Process successful callback
				let updatedGeneration = generation

				for (const image of input.images) {
					// Create asset for generated image
					const asset = await createGeneratedAsset(
						generation.storeId,
						generation.id.value,
						image.url,
						image.aspectRatio,
						'system', // Callback uploads are system-level
					)

					const generatedImage: GeneratedImage = {
						id: image.id,
						assetId: asset.id.value,
						aspectRatio: image.aspectRatio,
						url: asset.cdnUrl,
						thumbnailUrl: image.thumbnailUrl ?? asset.thumbnailUrl,
						createdAt: new Date(),
					}

					updatedGeneration = updatedGeneration.addGeneratedImage(generatedImage)
				}

				// Complete the generation
				const completedGeneration = updatedGeneration.complete()
				await generationRepository.update(completedGeneration)

				logger.info('Generation completed via callback', {
					generationId: input.generationId,
					imageCount: input.images.length,
				})

				return {
					success: true,
					generationId: input.generationId,
					status: completedGeneration.status,
				}
			}
			// Handle failure callback
			const failedGeneration = generation.fail(input.error ?? 'Generation failed')
			await generationRepository.update(failedGeneration)

			logger.error('Generation failed via callback', {
				generationId: input.generationId,
				error: input.error,
			})

			return {
				success: true,
				generationId: input.generationId,
				status: failedGeneration.status,
			}
		} catch (error) {
			logger.error('Failed to handle generation callback', { error })

			if (error instanceof HttpsError) {
				throw error
			}

			throw new HttpsError('internal', 'Failed to handle callback')
		}
	},
)

/**
 * Pub/Sub triggered generation processor
 * Listens to 'generation-requests' topic
 */
export const processGenerationPubSub = onMessagePublished(
	{ topic: 'generation-requests', maxInstances: 5, timeoutSeconds: 300 },
	async (event) => {
		const message = event.data.message
		const data = message.json as { generationId: string } | undefined

		if (!data?.generationId) {
			logger.error('Invalid Pub/Sub message', { data })
			return
		}

		logger.info('Processing generation from Pub/Sub', { generationId: data.generationId })

		try {
			await executeGenerationProcessing(data.generationId)
		} catch (error) {
			logger.error('Failed to process generation from Pub/Sub', {
				error,
				generationId: data.generationId,
			})
		}
	},
)

/**
 * Core generation processing logic
 */
async function executeGenerationProcessing(
	generationId: string,
): Promise<{ success: boolean; generationId: string; status: string; images?: unknown[] }> {
	const generation = await generationRepository.findById(generationId)
	if (!generation) {
		throw new HttpsError('not-found', 'Generation not found')
	}

	if (!generation.isPending) {
		logger.warn('Generation is not pending', { generationId, status: generation.status })
		return {
			success: true,
			generationId,
			status: generation.status,
		}
	}

	// Get the model
	const model = await modelRepository.findById(generation.modelId)
	if (!model || !model.lockedIdentityUrl) {
		const failedGeneration = generation.fail('Model not found or not calibrated')
		await generationRepository.update(failedGeneration)
		throw new HttpsError('failed-precondition', 'Model not found or not calibrated')
	}

	// Get the garment asset URL
	const garmentAsset = await assetRepository.findById(generation.garmentAssetId)
	if (!garmentAsset || garmentAsset.status !== AssetStatus.READY) {
		const failedGeneration = generation.fail('Garment asset not found or not ready')
		await generationRepository.update(failedGeneration)
		throw new HttpsError('failed-precondition', 'Garment asset not found or not ready')
	}

	const garmentUrl = await storageService.generateDownloadUrl(garmentAsset.storagePath.value)

	// Start processing
	let processingGeneration = generation.startProcessing()
	await generationRepository.update(processingGeneration)

	// Generate images
	const result = await seedreamService.generateImages({
		modelIdentityUrl: model.lockedIdentityUrl,
		garmentImageUrl: garmentUrl,
		scenePrompt: generation.scenePrompt.value,
		aspectRatios: [...generation.aspectRatios],
		count: generation.imageCount,
	})

	if (!result.success) {
		const failedGeneration = processingGeneration.fail(result.error ?? 'Generation failed')
		await generationRepository.update(failedGeneration)

		logger.error('Generation failed', { generationId, error: result.error })

		return {
			success: false,
			generationId,
			status: failedGeneration.status,
		}
	}

	// Store generated images
	const generatedImages: GeneratedImage[] = []

	for (const image of result.images) {
		const asset = await createGeneratedAsset(
			generation.storeId,
			generationId,
			image.url,
			image.aspectRatio,
			'system',
		)

		const generatedImage: GeneratedImage = {
			id: image.id,
			assetId: asset.id.value,
			aspectRatio: image.aspectRatio,
			url: asset.cdnUrl,
			thumbnailUrl: image.thumbnailUrl ?? asset.thumbnailUrl,
			createdAt: new Date(),
		}

		generatedImages.push(generatedImage)
		processingGeneration = processingGeneration.addGeneratedImage(generatedImage)
	}

	// Complete the generation
	const completedGeneration = processingGeneration.complete()
	await generationRepository.update(completedGeneration)

	logger.info('Generation completed', { generationId, imageCount: generatedImages.length })

	return {
		success: true,
		generationId,
		status: completedGeneration.status,
		images: generatedImages,
	}
}

/**
 * Helper function to create an asset for a generated image
 */
async function createGeneratedAsset(
	storeId: string,
	generationId: string,
	imageUrl: string,
	aspectRatio: string,
	uploadedBy: string,
): Promise<Asset> {
	const assetId = randomUUID()
	const filename = `generated-${assetId}.jpg`

	const metadata: AssetMetadata = {
		generationId,
	}

	const asset = Asset.requestUpload({
		storeId,
		category: AssetCategory.GENERATED,
		filename,
		mimeType: 'image/jpeg' as AllowedMimeType,
		sizeBytes: 0,
		uploadedBy,
		metadata,
	})

	// Download image from URL and upload to storage
	const storagePath = asset.storagePath.value
	await storageService.uploadFromUrl(storagePath, imageUrl, 'image/jpeg')

	// Get CDN URL
	const cdnUrl = await storageService.getCdnUrl(storagePath)

	// Mark asset as ready
	const readyAsset = asset.confirmUpload().markReady(cdnUrl ?? undefined)

	await assetRepository.create(readyAsset)

	return readyAsset
}
