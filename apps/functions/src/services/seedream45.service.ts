/**
 * @fileoverview Seedream 4.5 Unified Image Generation Service
 *
 * Implements IImageGenerationService and IModelCalibrationService interfaces
 * using the official BytePlus Seedream 4.5 API.
 *
 * Key features:
 * - Multi-image references (up to 14 images)
 * - Sequential batch generation for related images
 * - Automatic retry with exponential backoff
 * - Mock mode for development/testing
 *
 * Documentation: https://docs.byteplus.com/en/docs/ModelArk/1541523
 */

import { randomUUID } from 'node:crypto'
import type {
	CalibrationFashionConfig,
	CalibrationImage,
	CalibrationParams,
	CalibrationResult,
	FashionConfig,
	GeneratedImageResult,
	GenerationParams,
	GenerationResult,
	IImageGenerationService,
	IModelCalibrationService,
} from '@foundry/domain'
import { AspectRatio, CameraFraming, LightingPreset } from '@foundry/domain'
import * as logger from 'firebase-functions/logger'
import {
	BYTEPLUS_REGION_URLS,
	BytePlusRegion,
	DEFAULT_IMAGE_SIZE,
	DEFAULT_RESPONSE_FORMAT,
	IMAGE_CONSTRAINTS,
	type ImageMetadata,
	type ImageValidationResult,
	MAX_REFERENCE_IMAGES,
	MAX_TOTAL_IMAGES,
	type Seedream45Config,
	type Seedream45Error,
	Seedream45Model,
	type Seedream45Request,
	type Seedream45Response,
	type Seedream45StreamEvent,
} from './seedream45.types'

/**
 * Aspect ratio to pixel dimensions mapping for Seedream 4.5
 */
const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
	[AspectRatio.PORTRAIT_4_5]: { width: 1600, height: 2000 },
	[AspectRatio.PORTRAIT_9_16]: { width: 1152, height: 2048 },
	[AspectRatio.SQUARE_1_1]: { width: 1920, height: 1920 },
	[AspectRatio.LANDSCAPE_16_9]: { width: 2048, height: 1152 },
}

/**
 * Seedream 4.5 Unified Service
 *
 * Provides AI image generation and model calibration services using
 * the official BytePlus Seedream 4.5 API with multi-image support.
 */
export class Seedream45Service implements IImageGenerationService, IModelCalibrationService {
	private readonly apiKey: string | undefined
	private readonly baseUrl: string
	private readonly timeout: number
	private readonly maxRetries: number
	private readonly useMock: boolean

	constructor(config: Seedream45Config = {}) {
		this.apiKey = config.apiKey ?? process.env.BYTEPLUS_API_KEY
		this.timeout = config.timeout ?? 60000
		this.maxRetries = config.maxRetries ?? 3
		this.useMock = config.useMock ?? !this.apiKey

		// Determine base URL
		if (config.baseUrl) {
			this.baseUrl = config.baseUrl
		} else {
			const region = config.region ?? (process.env.BYTEPLUS_REGION as BytePlusRegion) ?? BytePlusRegion.AP_SOUTHEAST
			this.baseUrl = BYTEPLUS_REGION_URLS[region]
		}

		if (this.useMock) {
			logger.info('Seedream45Service initialized in mock mode')
		} else {
			logger.info('Seedream45Service initialized', { region: config.region ?? 'ap-southeast' })
		}
	}

	/**
	 * Generate marketing images using AI
	 */
	async generateImages(params: GenerationParams): Promise<GenerationResult> {
		if (this.useMock) {
			return this.mockGenerateImages(params)
		}

		return this.realGenerateImages(params)
	}

	/**
	 * Generate calibration images for a new model
	 *
	 * Supports up to 14 reference images for multi-image character consistency.
	 */
	async generateCalibrationImages(params: CalibrationParams): Promise<CalibrationResult> {
		if (this.useMock) {
			return this.mockGenerateCalibrationImages(params)
		}

		return this.realGenerateCalibrationImages(params)
	}

	/**
	 * Lock the model identity using selected calibration images
	 */
	async lockIdentity(modelId: string, selectedImageIds: string[]): Promise<string> {
		if (this.useMock) {
			return this.mockLockIdentity(modelId, selectedImageIds)
		}

		return this.realLockIdentity(modelId, selectedImageIds)
	}

	// ==================== REAL API IMPLEMENTATIONS ====================

	/**
	 * Real implementation - Generate marketing images
	 */
	private async realGenerateImages(params: GenerationParams): Promise<GenerationResult> {
		const startTime = Date.now()

		try {
			const composedPrompt = this.composeGenerationPrompt(params.scenePrompt, params.fashionConfig)
			const images: GeneratedImageResult[] = []

			for (const aspectRatio of params.aspectRatios) {
				const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio]

				const request: Seedream45Request = {
					model: Seedream45Model.SEEDREAM_4_5,
					prompt: composedPrompt,
					image: params.modelIdentityUrl,
					size: `${dimensions.width}x${dimensions.height}`,
					response_format: DEFAULT_RESPONSE_FORMAT,
					watermark: false,
					n: params.count,
					optimize_prompt_options: { mode: 'standard' },
				}

				logger.info('Generating images with Seedream 4.5', {
					aspectRatio,
					count: params.count,
					hasModelIdentity: !!params.modelIdentityUrl,
					hasGarmentImage: !!params.garmentImageUrl,
				})

				const response = await this.makeRequest<Seedream45Response>('/images/generations', request)

				for (const img of response.data) {
					images.push({
						id: randomUUID(),
						aspectRatio,
						url: img.url ?? '',
						metadata: {
							width: dimensions.width,
							height: dimensions.height,
						},
					})
				}
			}

			return {
				success: true,
				images,
				processingTimeMs: Date.now() - startTime,
				modelVersion: Seedream45Model.SEEDREAM_4_5,
			}
		} catch (error) {
			logger.error('Failed to generate images', { error })
			return {
				success: false,
				images: [],
				error: error instanceof Error ? error.message : 'Unknown error occurred',
				processingTimeMs: Date.now() - startTime,
			}
		}
	}

	/**
	 * Real implementation - Generate calibration images with multi-image support
	 */
	private async realGenerateCalibrationImages(params: CalibrationParams): Promise<CalibrationResult> {
		const startTime = Date.now()

		try {
			const composedPrompt = this.composeCalibrationPrompt(params)

			// Prepare reference images (max 14)
			const referenceImages = params.referenceImageUrls?.slice(0, MAX_REFERENCE_IMAGES)

			// Calculate max output images (total input + output <= 15)
			const inputImageCount = referenceImages?.length ?? 0
			const maxOutputImages = Math.min(params.count, MAX_TOTAL_IMAGES - inputImageCount)

			const request: Seedream45Request = {
				model: Seedream45Model.SEEDREAM_4_5,
				prompt: composedPrompt,
				image:
					referenceImages && referenceImages.length > 0
						? referenceImages.length === 1
							? referenceImages[0]
							: referenceImages
						: undefined,
				size: DEFAULT_IMAGE_SIZE,
				response_format: DEFAULT_RESPONSE_FORMAT,
				watermark: false,
				n: maxOutputImages,
				// Use sequential generation for batch calibration output
				sequential_image_generation: params.useSequentialGeneration ? 'auto' : 'disabled',
				sequential_image_generation_options: params.useSequentialGeneration
					? { max_images: maxOutputImages }
					: undefined,
				optimize_prompt_options: { mode: 'standard' },
			}

			logger.info('Generating calibration images with Seedream 4.5', {
				referenceImageCount: inputImageCount,
				maxOutputImages,
				useSequentialGeneration: params.useSequentialGeneration ?? false,
				gender: params.gender,
				ageRange: params.ageRange,
			})

			const response = await this.makeRequest<Seedream45Response>('/images/generations', request)

			const images: CalibrationImage[] = response.data.map((img) => ({
				id: randomUUID(),
				url: img.url ?? '',
				metadata: {
					width: 2048,
					height: 2048,
				},
			}))

			return {
				success: true,
				images,
				processingTimeMs: Date.now() - startTime,
				modelVersion: Seedream45Model.SEEDREAM_4_5,
			}
		} catch (error) {
			logger.error('Failed to generate calibration images', { error })
			return {
				success: false,
				images: [],
				error: error instanceof Error ? error.message : 'Unknown error occurred',
				processingTimeMs: Date.now() - startTime,
			}
		}
	}

	/**
	 * Real implementation - Lock model identity
	 *
	 * Creates a locked identity URL from selected calibration images.
	 * In Seedream 4.5, this is done by combining the selected image URLs
	 * into a reference that can be used for subsequent generations.
	 */
	private async realLockIdentity(modelId: string, selectedImageIds: string[]): Promise<string> {
		// For Seedream 4.5, the "locked identity" is represented by the collection
		// of reference images that will be used for subsequent generations.
		// We return a storage URL that references the model's identity configuration.
		logger.info('Locking model identity', {
			modelId,
			selectedImageCount: selectedImageIds.length,
		})

		// The locked identity URL is a reference to the model's calibrated state
		// In production, this would be a URL to a stored identity configuration
		return `https://storage.googleapis.com/echomodel-identities/${modelId}/locked-identity.json`
	}

	// ==================== MOCK IMPLEMENTATIONS ====================

	/**
	 * Mock implementation - Generate marketing images
	 */
	private async mockGenerateImages(params: GenerationParams): Promise<GenerationResult> {
		await this.delay(2000)

		const images: GeneratedImageResult[] = []

		for (const aspectRatio of params.aspectRatios) {
			const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio]

			for (let i = 0; i < params.count; i++) {
				images.push({
					id: randomUUID(),
					aspectRatio,
					url: `https://picsum.photos/${dimensions.width}/${dimensions.height}?random=${randomUUID()}`,
					thumbnailUrl: `https://picsum.photos/${Math.floor(dimensions.width / 4)}/${Math.floor(dimensions.height / 4)}?random=${randomUUID()}`,
					metadata: {
						width: dimensions.width,
						height: dimensions.height,
						seed: Math.floor(Math.random() * 1000000),
					},
				})
			}
		}

		return {
			success: true,
			images,
			processingTimeMs: 2000,
			modelVersion: 'mock-v1',
		}
	}

	/**
	 * Mock implementation - Generate calibration images
	 */
	private async mockGenerateCalibrationImages(params: CalibrationParams): Promise<CalibrationResult> {
		await this.delay(3000)

		const referenceCount = params.referenceImageUrls?.length ?? 0
		const maxOutput = Math.min(params.count, MAX_TOTAL_IMAGES - referenceCount)

		const images: CalibrationImage[] = []
		for (let i = 0; i < maxOutput; i++) {
			images.push({
				id: randomUUID(),
				url: `https://picsum.photos/2048/2048?random=${randomUUID()}`,
				thumbnailUrl: `https://picsum.photos/512/512?random=${randomUUID()}`,
				metadata: {
					width: 2048,
					height: 2048,
					seed: Math.floor(Math.random() * 1000000),
				},
			})
		}

		logger.info('Mock calibration completed', {
			referenceImageCount: referenceCount,
			generatedCount: images.length,
			useSequentialGeneration: params.useSequentialGeneration ?? false,
		})

		return {
			success: true,
			images,
			lockedIdentityUrl: `https://storage.example.com/identities/${randomUUID()}.json`,
			processingTimeMs: 3000,
			modelVersion: 'mock-v1',
		}
	}

	/**
	 * Mock implementation - Lock model identity
	 */
	private async mockLockIdentity(modelId: string, _selectedImageIds: string[]): Promise<string> {
		await this.delay(1000)
		return `https://storage.example.com/identities/${modelId}-locked.json`
	}

	// ==================== API HELPER METHODS ====================

	/**
	 * Make HTTP request to BytePlus API with retry logic
	 */
	private async makeRequest<T>(endpoint: string, payload: Seedream45Request, attempt = 1): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`

		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), this.timeout)

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
				signal: controller.signal,
			})

			clearTimeout(timeoutId)

			// Handle rate limiting with exponential backoff
			if (response.status === 429 && attempt < this.maxRetries) {
				const retryAfter = Number.parseInt(response.headers.get('Retry-After') ?? '5', 10)
				const backoffDelay = Math.min(2 ** attempt * 1000, retryAfter * 1000)

				logger.warn('Rate limited, retrying', {
					attempt,
					backoffDelay,
					maxRetries: this.maxRetries,
				})

				await this.delay(backoffDelay)
				return this.makeRequest(endpoint, payload, attempt + 1)
			}

			// Handle other errors
			if (!response.ok) {
				const error = (await response.json()) as Seedream45Error
				throw new Error(`Seedream 4.5 API error: ${error.error.message} (${error.error.code})`)
			}

			return (await response.json()) as T
		} catch (error) {
			clearTimeout(timeoutId)

			// Retry on network errors
			if (attempt < this.maxRetries && (error instanceof TypeError || (error as Error).name === 'AbortError')) {
				const backoffDelay = 2 ** attempt * 1000

				logger.warn('Network error, retrying', {
					attempt,
					backoffDelay,
					error: (error as Error).message,
				})

				await this.delay(backoffDelay)
				return this.makeRequest(endpoint, payload, attempt + 1)
			}

			throw error
		}
	}

	// ==================== PROMPT COMPOSITION METHODS ====================

	/**
	 * Get default fashion configuration
	 */
	private getDefaultFashionConfig(): FashionConfig {
		return {
			lightingPreset: LightingPreset.SOFT_STUDIO,
			cameraFraming: CameraFraming.WAIST_UP_50MM,
			texturePreferences: [],
		}
	}

	/**
	 * Get default calibration fashion configuration
	 */
	private getDefaultCalibrationFashionConfig(): CalibrationFashionConfig {
		return {
			lightingPreset: LightingPreset.SOFT_STUDIO,
			cameraFraming: CameraFraming.WAIST_UP_50MM,
			texturePreferences: [],
		}
	}

	/**
	 * Get lighting description for prompt engineering
	 */
	private getLightingDescription(preset: LightingPreset): string {
		switch (preset) {
			case LightingPreset.SOFT_STUDIO:
				return 'soft diffused studio lighting'
			case LightingPreset.EDITORIAL_CONTRAST:
				return 'high contrast editorial lighting with dramatic shadows'
			case LightingPreset.NATURAL_DAYLIGHT:
				return 'natural daylight, window light'
			case LightingPreset.CUSTOM:
				return 'studio lighting'
			default:
				return 'studio lighting'
		}
	}

	/**
	 * Get camera description for prompt engineering
	 */
	private getCameraDescription(framing: CameraFraming): string {
		switch (framing) {
			case CameraFraming.WAIST_UP_50MM:
				return 'waist-up shot, 50mm lens, professional fashion photography framing'
			case CameraFraming.FULL_BODY_35MM:
				return 'full body shot, 35mm lens, showing complete outfit'
			case CameraFraming.PORTRAIT_85MM:
				return 'portrait shot, 85mm lens, face and upper body focus'
			case CameraFraming.CUSTOM:
				return 'professional fashion photography'
			default:
				return 'professional fashion photography'
		}
	}

	/**
	 * Compose a prompt for image generation
	 */
	private composeGenerationPrompt(scenePrompt: string, fashionConfig?: FashionConfig): string {
		const config = fashionConfig ?? this.getDefaultFashionConfig()

		const parts = [
			'Professional fashion photography',
			scenePrompt,
			this.getLightingDescription(config.lightingPreset),
			this.getCameraDescription(config.cameraFraming),
		]

		if (config.texturePreferences.length > 0) {
			parts.push(`material textures: ${config.texturePreferences.join(', ')}`)
		}

		parts.push('high quality', '8k resolution')

		return parts.filter(Boolean).join(', ')
	}

	/**
	 * Compose a prompt for calibration image generation
	 */
	private composeCalibrationPrompt(params: CalibrationParams): string {
		const fashionConfig = params.fashionConfig ?? this.getDefaultCalibrationFashionConfig()

		const parts = [
			'Professional fashion model portrait',
			params.prompt,
			`${params.gender.toLowerCase()} presenting`,
			`${params.ageRange.toLowerCase().replace('_', ' ')} appearance`,
			`${params.ethnicity.toLowerCase().replace('_', ' ')}`,
			`${params.bodyType.toLowerCase().replace('_', ' ')} body type`,
			this.getLightingDescription(fashionConfig.lightingPreset),
			this.getCameraDescription(fashionConfig.cameraFraming),
		]

		if (fashionConfig.texturePreferences.length > 0) {
			parts.push(`material textures: ${fashionConfig.texturePreferences.join(', ')}`)
		}

		parts.push('neutral background', '8k resolution')

		return parts.filter(Boolean).join(', ')
	}

	/**
	 * Delay helper
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	// ==================== IMAGE VALIDATION METHODS ====================

	/**
	 * Validate image input against BytePlus API constraints
	 *
	 * @param metadata - Image metadata to validate
	 * @returns Validation result with any errors
	 */
	validateImageInput(metadata: ImageMetadata): ImageValidationResult {
		const errors: string[] = []

		const { width, height, sizeBytes, mimeType } = metadata
		const totalPixels = width * height
		const aspectRatio = width / height

		// Validate MIME type
		if (!IMAGE_CONSTRAINTS.ALLOWED_FORMATS.includes(mimeType as (typeof IMAGE_CONSTRAINTS.ALLOWED_FORMATS)[number])) {
			errors.push(`Unsupported format: ${mimeType}. Allowed: ${IMAGE_CONSTRAINTS.ALLOWED_FORMATS.join(', ')}`)
		}

		// Validate file size (10 MB max)
		if (sizeBytes > IMAGE_CONSTRAINTS.MAX_FILE_SIZE_BYTES) {
			const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2)
			errors.push(`File too large: ${sizeMB} MB (max 10 MB)`)
		}

		// Validate minimum dimensions (14px)
		if (width < IMAGE_CONSTRAINTS.MIN_DIMENSION_PX) {
			errors.push(`Width too small: ${width}px (min ${IMAGE_CONSTRAINTS.MIN_DIMENSION_PX}px)`)
		}
		if (height < IMAGE_CONSTRAINTS.MIN_DIMENSION_PX) {
			errors.push(`Height too small: ${height}px (min ${IMAGE_CONSTRAINTS.MIN_DIMENSION_PX}px)`)
		}

		// Validate aspect ratio (1:16 to 16:1)
		if (aspectRatio < IMAGE_CONSTRAINTS.ASPECT_RATIO_RANGE.min) {
			errors.push(`Aspect ratio too narrow: ${aspectRatio.toFixed(3)} (min 1:16)`)
		}
		if (aspectRatio > IMAGE_CONSTRAINTS.ASPECT_RATIO_RANGE.max) {
			errors.push(`Aspect ratio too wide: ${aspectRatio.toFixed(3)} (max 16:1)`)
		}

		// Validate Seedream 4.5 specific constraints
		if (totalPixels > IMAGE_CONSTRAINTS.SEEDREAM_45.MAX_TOTAL_PIXELS) {
			const megapixels = (totalPixels / 1_000_000).toFixed(2)
			errors.push(`Too many pixels: ${megapixels} MP (max 16.78 MP for Seedream 4.5)`)
		}

		return {
			valid: errors.length === 0,
			errors,
		}
	}

	/**
	 * Validate image URL by fetching metadata
	 *
	 * @param url - Image URL to validate
	 * @returns Validation result with any errors
	 */
	async validateImageUrl(url: string): Promise<ImageValidationResult> {
		try {
			// Fetch just the headers to get content info
			const response = await fetch(url, { method: 'HEAD' })

			if (!response.ok) {
				return {
					valid: false,
					errors: [`Failed to fetch image: ${response.status} ${response.statusText}`],
				}
			}

			const contentType = response.headers.get('content-type') ?? ''
			const contentLength = Number.parseInt(response.headers.get('content-length') ?? '0', 10)

			// Basic validation without dimensions (would need to download full image)
			const errors: string[] = []

			if (
				!IMAGE_CONSTRAINTS.ALLOWED_FORMATS.includes(contentType as (typeof IMAGE_CONSTRAINTS.ALLOWED_FORMATS)[number])
			) {
				errors.push(`Unsupported format: ${contentType}. Allowed: ${IMAGE_CONSTRAINTS.ALLOWED_FORMATS.join(', ')}`)
			}

			if (contentLength > IMAGE_CONSTRAINTS.MAX_FILE_SIZE_BYTES) {
				const sizeMB = (contentLength / (1024 * 1024)).toFixed(2)
				errors.push(`File too large: ${sizeMB} MB (max 10 MB)`)
			}

			return {
				valid: errors.length === 0,
				errors,
			}
		} catch (error) {
			return {
				valid: false,
				errors: [`Failed to validate image URL: ${error instanceof Error ? error.message : 'Unknown error'}`],
			}
		}
	}

	// ==================== STREAMING METHODS ====================

	/**
	 * Generate images with streaming support for progressive delivery
	 *
	 * Yields images as they complete, allowing clients to display
	 * results progressively instead of waiting for all images.
	 *
	 * @param params - Generation parameters
	 * @yields Generated image results as they complete
	 */
	async *generateImagesStreaming(params: GenerationParams): AsyncGenerator<GeneratedImageResult> {
		if (this.useMock) {
			yield* this.mockGenerateImagesStreaming(params)
			return
		}

		const composedPrompt = this.composeGenerationPrompt(params.scenePrompt, params.fashionConfig)

		for (const aspectRatio of params.aspectRatios) {
			const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio]

			const request: Seedream45Request = {
				model: Seedream45Model.SEEDREAM_4_5,
				prompt: composedPrompt,
				image: params.modelIdentityUrl,
				size: `${dimensions.width}x${dimensions.height}`,
				response_format: DEFAULT_RESPONSE_FORMAT,
				watermark: false,
				n: params.count,
				optimize_prompt_options: { mode: 'standard' },
			}

			logger.info('Starting streaming generation', {
				aspectRatio,
				count: params.count,
			})

			try {
				const response = await this.makeStreamingRequest('/images/generations', request)

				for await (const event of this.parseSSEStream(response)) {
					if (event.type === 'image_generation.partial_succeeded' && event.data.image) {
						yield {
							id: randomUUID(),
							aspectRatio,
							url: event.data.image.url ?? '',
							metadata: {
								width: dimensions.width,
								height: dimensions.height,
							},
						}
					}
				}
			} catch (error) {
				logger.error('Streaming generation failed', { error, aspectRatio })
				throw error
			}
		}
	}

	/**
	 * Make streaming HTTP request to BytePlus API
	 */
	private async makeStreamingRequest(
		endpoint: string,
		payload: Seedream45Request,
	): Promise<ReadableStream<Uint8Array>> {
		const url = `${this.baseUrl}${endpoint}`

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json',
				Accept: 'text/event-stream',
			},
			body: JSON.stringify({ ...payload, stream: true }),
		})

		if (!response.ok) {
			const error = (await response.json()) as Seedream45Error
			throw new Error(`Seedream 4.5 API error: ${error.error.message} (${error.error.code})`)
		}

		if (!response.body) {
			throw new Error('No response body for streaming request')
		}

		return response.body
	}

	/**
	 * Parse Server-Sent Events stream from BytePlus API
	 */
	private async *parseSSEStream(stream: ReadableStream<Uint8Array>): AsyncGenerator<Seedream45StreamEvent> {
		const reader = stream.getReader()
		const decoder = new TextDecoder()
		let buffer = ''

		try {
			while (true) {
				const { done, value } = await reader.read()

				if (done) {
					break
				}

				buffer += decoder.decode(value, { stream: true })

				// Parse SSE events from buffer
				const lines = buffer.split('\n')
				buffer = lines.pop() ?? '' // Keep incomplete line in buffer

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6).trim()

						if (data === '[DONE]') {
							return
						}

						try {
							const event = JSON.parse(data) as Seedream45StreamEvent
							yield event
						} catch {
							logger.warn('Failed to parse SSE event', { data })
						}
					}
				}
			}
		} finally {
			reader.releaseLock()
		}
	}

	/**
	 * Mock streaming generation
	 */
	private async *mockGenerateImagesStreaming(params: GenerationParams): AsyncGenerator<GeneratedImageResult> {
		for (const aspectRatio of params.aspectRatios) {
			const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio]

			for (let i = 0; i < params.count; i++) {
				// Simulate delay between images
				await this.delay(500 + Math.random() * 1000)

				yield {
					id: randomUUID(),
					aspectRatio,
					url: `https://picsum.photos/${dimensions.width}/${dimensions.height}?random=${randomUUID()}`,
					thumbnailUrl: `https://picsum.photos/${Math.floor(dimensions.width / 4)}/${Math.floor(dimensions.height / 4)}?random=${randomUUID()}`,
					metadata: {
						width: dimensions.width,
						height: dimensions.height,
						seed: Math.floor(Math.random() * 1000000),
					},
				}
			}
		}
	}

	// ==================== STATIC UTILITY METHODS ====================

	/**
	 * Get estimated cost for a generation request
	 */
	static estimateCost(model: Seedream45Model, numImages = 1): number {
		const pricePerImage = model === Seedream45Model.SEEDREAM_4_5 ? 0.045 : 0.035
		return pricePerImage * numImages
	}

	/**
	 * Validate API key by checking configuration
	 */
	async validateApiKey(): Promise<boolean> {
		if (this.useMock) {
			return true
		}

		try {
			// Make a minimal test request
			const request: Seedream45Request = {
				model: Seedream45Model.SEEDREAM_4_5,
				prompt: 'test validation',
				n: 1,
				size: '2K',
			}

			await this.makeRequest('/images/generations', request)
			return true
		} catch (error) {
			logger.error('API key validation failed', { error })
			return false
		}
	}
}
