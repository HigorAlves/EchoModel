/**
 * @fileoverview BytePlus Image Generation Example Handler
 *
 * Demonstrates how to use BytePlus ModelArk service for image generation.
 * This is an example handler - integrate into your actual handlers as needed.
 */

import * as logger from 'firebase-functions/logger'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { BytePlusService, type GenerateImageRequest, ImageSize, SeedreamModel } from '../services/byteplus.service'

// Initialize BytePlus service
const bytePlusService = new BytePlusService({
	apiKey: process.env.BYTEPLUS_API_KEY ?? '',
	timeout: 90000, // 90 seconds for high-res images
	maxRetries: 3,
})

/**
 * Example: Generate single image with BytePlus
 */
export const generateImageWithByteplus = onCall<{
	prompt: string
	referenceImageUrl?: string
	resolution?: '1K' | '2K' | '4K'
	numImages?: number
}>({ maxInstances: 5, timeoutSeconds: 120 }, async (request) => {
	logger.info('generateImageWithByteplus called', { data: request.data })

	const userId = request.auth?.uid
	if (!userId) {
		throw new HttpsError('unauthenticated', 'Authentication required')
	}

	const { prompt, referenceImageUrl, resolution = '2K', numImages = 1 } = request.data

	if (!prompt) {
		throw new HttpsError('invalid-argument', 'Prompt is required')
	}

	try {
		const imageRequest: GenerateImageRequest = {
			prompt,
			model: SeedreamModel.SEEDREAM_4_5,
			size: resolution as ImageSize,
			numImages: Math.min(numImages, 4),
			watermark: false,
		}

		// Add reference image if provided
		if (referenceImageUrl) {
			imageRequest.image = referenceImageUrl
		}

		logger.info('Generating image', {
			userId,
			model: imageRequest.model,
			size: imageRequest.size,
			hasReference: !!referenceImageUrl,
		})

		const response = await bytePlusService.generateImage(imageRequest)

		// Calculate cost
		const cost = BytePlusService.estimateCost(SeedreamModel.SEEDREAM_4_5, numImages)

		logger.info('Image generation successful', {
			userId,
			imageCount: response.data.length,
			cost,
		})

		return {
			success: true,
			images: response.data.map((img) => ({
				url: img.url,
				revisedPrompt: img.revisedPrompt,
			})),
			metadata: {
				created: response.created,
				model: imageRequest.model,
				cost,
			},
		}
	} catch (error) {
		logger.error('Failed to generate image with BytePlus', {
			error,
			userId,
			prompt: prompt.substring(0, 100),
		})

		if (error instanceof Error) {
			throw new HttpsError('internal', `Image generation failed: ${error.message}`)
		}

		throw new HttpsError('internal', 'Failed to generate image')
	}
})

/**
 * Example: Batch generation with BytePlus
 */
export const generateBatchWithByteplus = onCall<{
	requests: Array<{
		prompt: string
		referenceImageUrl?: string
	}>
}>({ maxInstances: 3, timeoutSeconds: 300 }, async (request) => {
	logger.info('generateBatchWithByteplus called', {
		requestCount: request.data.requests.length,
	})

	const userId = request.auth?.uid
	if (!userId) {
		throw new HttpsError('unauthenticated', 'Authentication required')
	}

	const { requests } = request.data

	if (!requests || requests.length === 0) {
		throw new HttpsError('invalid-argument', 'At least one request is required')
	}

	if (requests.length > 10) {
		throw new HttpsError('invalid-argument', 'Maximum 10 requests allowed per batch')
	}

	try {
		const imageRequests: GenerateImageRequest[] = requests.map((req) => ({
			prompt: req.prompt,
			image: req.referenceImageUrl,
			model: SeedreamModel.SEEDREAM_4_5,
			size: ImageSize.HD,
			watermark: false,
		}))

		logger.info('Generating batch of images', {
			userId,
			count: imageRequests.length,
		})

		const { results, errors } = await bytePlusService.generateBatch(imageRequests)

		const totalCost = BytePlusService.estimateCost(
			SeedreamModel.SEEDREAM_4_5,
			results.reduce((sum, result) => sum + result.data.length, 0),
		)

		logger.info('Batch generation complete', {
			userId,
			successful: results.length,
			failed: errors.length,
			totalCost,
		})

		return {
			success: true,
			results: results.map((result) => ({
				images: result.data.map((img) => ({
					url: img.url,
					revisedPrompt: img.revisedPrompt,
				})),
				created: result.created,
			})),
			errors: errors.map((error) => ({
				message: error.message,
			})),
			metadata: {
				totalImages: results.reduce((sum, result) => sum + result.data.length, 0),
				totalCost,
			},
		}
	} catch (error) {
		logger.error('Failed to generate batch with BytePlus', {
			error,
			userId,
		})

		throw new HttpsError('internal', 'Failed to generate batch of images')
	}
})

/**
 * Example: Validate BytePlus API key
 */
export const validateByteplusApiKey = onCall({ maxInstances: 10, timeoutSeconds: 30 }, async (request) => {
	logger.info('validateByteplusApiKey called')

	const userId = request.auth?.uid
	if (!userId) {
		throw new HttpsError('unauthenticated', 'Authentication required')
	}

	try {
		const isValid = await bytePlusService.validateApiKey()

		return {
			success: true,
			valid: isValid,
		}
	} catch (error) {
		logger.error('API key validation failed', { error, userId })

		return {
			success: false,
			valid: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
})
