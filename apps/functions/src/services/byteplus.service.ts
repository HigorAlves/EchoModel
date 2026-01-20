/**
 * @fileoverview BytePlus ModelArk Image Generation Service
 *
 * Implements image generation using BytePlus ModelArk (Seedream 4.0-4.5).
 * Documentation: https://docs.byteplus.com/en/docs/ModelArk/1541523
 */

import * as logger from 'firebase-functions/logger'

/**
 * BytePlus ModelArk configuration
 */
export interface BytePlusConfig {
	apiKey: string
	baseUrl?: string
	timeout?: number
	maxRetries?: number
}

/**
 * Seedream model versions
 */
export enum SeedreamModel {
	SEEDREAM_4_0 = 'seedream-4-0-250828',
	SEEDREAM_4_5 = 'seedream-4-5-251128',
}

/**
 * Image size options
 */
export enum ImageSize {
	SD = '1K', // ~1024x1024
	HD = '2K', // ~2048x2048
	UHD = '4K', // ~4096x4096
}

/**
 * Response format options
 */
export enum ResponseFormat {
	URL = 'url',
	BASE64 = 'b64_json',
}

/**
 * Image generation request parameters
 */
export interface GenerateImageRequest {
	/** Image description or editing instruction */
	prompt: string
	/** Model to use for generation */
	model?: SeedreamModel
	/** Reference image URL (for image-to-image operations) */
	image?: string
	/** Image resolution */
	size?: ImageSize
	/** Response format (URL or base64) */
	responseFormat?: ResponseFormat
	/** Whether to add watermark */
	watermark?: boolean
	/** Enable streaming response */
	stream?: boolean
	/** Number of images to generate (1-4) */
	numImages?: number
	/** Guidance scale for prompt adherence (1-20) */
	guidanceScale?: number
	/** Width in pixels (for custom size) */
	width?: number
	/** Height in pixels (for custom size) */
	height?: number
}

/**
 * Generated image data
 */
export interface GeneratedImage {
	/** Image URL or base64 data */
	url?: string
	b64Json?: string
	/** Revised/enhanced prompt used */
	revisedPrompt?: string
}

/**
 * Image generation response
 */
export interface GenerateImageResponse {
	/** Timestamp of creation */
	created: number
	/** Generated images */
	data: GeneratedImage[]
}

/**
 * Error response from BytePlus API
 */
export interface BytePlusError {
	error: {
		code: string
		message: string
		type: string
	}
}

/**
 * BytePlus ModelArk Image Generation Service
 */
export class BytePlusService {
	private readonly apiKey: string
	private readonly baseUrl: string
	private readonly timeout: number
	private readonly maxRetries: number

	constructor(config: BytePlusConfig) {
		this.apiKey = config.apiKey
		this.baseUrl = config.baseUrl ?? 'https://ark.cn-beijing.volces.com/api/v3'
		this.timeout = config.timeout ?? 60000 // 60 seconds
		this.maxRetries = config.maxRetries ?? 3
	}

	/**
	 * Generate images using text-to-image
	 */
	async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
		logger.info('Generating image with BytePlus', {
			model: request.model,
			prompt: request.prompt?.substring(0, 100),
			hasReferenceImage: !!request.image,
		})

		const payload = this.buildRequestPayload(request)

		try {
			const response = await this.makeRequest('/images/generations', payload)
			return response as GenerateImageResponse
		} catch (error) {
			logger.error('Failed to generate image', { error, request: payload })
			throw this.handleError(error)
		}
	}

	/**
	 * Generate multiple images in batch
	 */
	async generateBatch(
		requests: GenerateImageRequest[],
	): Promise<{ results: GenerateImageResponse[]; errors: Error[] }> {
		logger.info('Generating batch of images', { count: requests.length })

		const results: GenerateImageResponse[] = []
		const errors: Error[] = []

		// Process in parallel with concurrency limit
		const concurrency = 5
		for (let i = 0; i < requests.length; i += concurrency) {
			const batch = requests.slice(i, i + concurrency)
			const promises = batch.map((req) =>
				this.generateImage(req).catch((error) => {
					errors.push(error)
					return null
				}),
			)

			const batchResults = await Promise.all(promises)
			results.push(...batchResults.filter((r): r is GenerateImageResponse => r !== null))
		}

		return { results, errors }
	}

	/**
	 * Build request payload from parameters
	 */
	private buildRequestPayload(request: GenerateImageRequest): Record<string, unknown> {
		const payload: Record<string, unknown> = {
			model: request.model ?? SeedreamModel.SEEDREAM_4_5,
			prompt: request.prompt,
		}

		// Reference image for image-to-image
		if (request.image) {
			payload.image = request.image
		}

		// Size/resolution
		if (request.size) {
			payload.size = request.size
		} else if (request.width && request.height) {
			payload.width = request.width
			payload.height = request.height
		} else {
			payload.size = ImageSize.HD // Default to 2K
		}

		// Response format
		if (request.responseFormat) {
			payload.response_format = request.responseFormat
		}

		// Watermark
		if (request.watermark !== undefined) {
			payload.watermark = request.watermark
		}

		// Streaming
		if (request.stream) {
			payload.stream = request.stream
		}

		// Number of images
		if (request.numImages && request.numImages > 1) {
			payload.n = Math.min(request.numImages, 4)
		}

		// Guidance scale
		if (request.guidanceScale) {
			payload.guidance_scale = Math.max(1, Math.min(20, request.guidanceScale))
		}

		return payload
	}

	/**
	 * Make HTTP request to BytePlus API with retry logic
	 */
	private async makeRequest(endpoint: string, payload: Record<string, unknown>, attempt = 1): Promise<unknown> {
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
				const error = (await response.json()) as BytePlusError
				throw new Error(`BytePlus API error: ${error.error.message} (${error.error.code})`)
			}

			return await response.json()
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

	/**
	 * Handle and transform errors
	 */
	private handleError(error: unknown): Error {
		if (error instanceof Error) {
			return error
		}

		return new Error('Unknown error occurred during image generation')
	}

	/**
	 * Delay helper for retry logic
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	/**
	 * Validate API key by making a test request
	 */
	async validateApiKey(): Promise<boolean> {
		try {
			await this.generateImage({
				prompt: 'test',
				model: SeedreamModel.SEEDREAM_4_0,
				size: ImageSize.SD,
			})
			return true
		} catch (error) {
			logger.error('API key validation failed', { error })
			return false
		}
	}

	/**
	 * Get estimated cost for a generation request
	 */
	static estimateCost(model: SeedreamModel, numImages = 1): number {
		const pricePerImage = model === SeedreamModel.SEEDREAM_4_5 ? 0.045 : 0.035
		return pricePerImage * numImages
	}
}
