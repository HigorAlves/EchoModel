/**
 * @fileoverview Seedream API Integration Service
 *
 * Implements IImageGenerationService and IModelCalibrationService interfaces
 * for AI image generation using the Seedream API.
 *
 * Note: This implementation includes a mock mode for development/testing.
 * Set SEEDREAM_API_KEY environment variable to use the real API.
 */

import { randomUUID } from 'node:crypto'
import type {
	IImageGenerationService,
	IModelCalibrationService,
	GenerationParams,
	GenerationResult,
	GeneratedImageResult,
	CalibrationParams,
	CalibrationResult,
	CalibrationImage,
} from '@foundry/domain'
import { AspectRatio } from '@foundry/domain'

/**
 * Seedream API configuration
 */
interface SeedreamConfig {
	apiKey?: string
	baseUrl?: string
	useMock?: boolean
}

/**
 * Aspect ratio to pixel dimensions mapping
 */
const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
	[AspectRatio.PORTRAIT_4_5]: { width: 768, height: 960 },
	[AspectRatio.PORTRAIT_9_16]: { width: 576, height: 1024 },
	[AspectRatio.SQUARE_1_1]: { width: 768, height: 768 },
	[AspectRatio.LANDSCAPE_16_9]: { width: 1024, height: 576 },
}

/**
 * Seedream API Service implementation
 *
 * Provides AI image generation and model calibration services.
 */
export class SeedreamService implements IImageGenerationService, IModelCalibrationService {
	private readonly apiKey: string | undefined
	private readonly baseUrl: string
	private readonly useMock: boolean

	constructor(config: SeedreamConfig = {}) {
		this.apiKey = config.apiKey ?? process.env.SEEDREAM_API_KEY
		this.baseUrl = config.baseUrl ?? process.env.SEEDREAM_BASE_URL ?? 'https://api.seedream.ai/v1'
		this.useMock = config.useMock ?? !this.apiKey
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
			// Compose the generation prompt
			const composedPrompt = this.composeGenerationPrompt(params.scenePrompt)

			// Generate images for each aspect ratio
			const images: GeneratedImageResult[] = []

			for (const aspectRatio of params.aspectRatios) {
				const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio]

				for (let i = 0; i < params.count; i++) {
					const response = await fetch(`${this.baseUrl}/generate`, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							prompt: composedPrompt,
							model_identity_url: params.modelIdentityUrl,
							garment_image_url: params.garmentImageUrl,
							width: dimensions.width,
							height: dimensions.height,
							num_outputs: 1,
						}),
					})

					if (!response.ok) {
						throw new Error(`Seedream API error: ${response.statusText}`)
					}

					const result = await response.json() as {
						id: string
						output_url: string
						thumbnail_url?: string
						seed?: number
					}

					images.push({
						id: result.id || randomUUID(),
						aspectRatio,
						url: result.output_url,
						thumbnailUrl: result.thumbnail_url,
						metadata: {
							width: dimensions.width,
							height: dimensions.height,
							seed: result.seed,
						},
					})
				}
			}

			return {
				success: true,
				images,
				processingTimeMs: Date.now() - startTime,
				modelVersion: 'seedream-v1',
			}
		} catch (error) {
			return {
				success: false,
				images: [],
				error: error instanceof Error ? error.message : 'Unknown error occurred',
				processingTimeMs: Date.now() - startTime,
			}
		}
	}

	/**
	 * Real implementation - Generate calibration images
	 */
	private async realGenerateCalibrationImages(params: CalibrationParams): Promise<CalibrationResult> {
		const startTime = Date.now()

		try {
			// Compose the calibration prompt
			const composedPrompt = this.composeCalibrationPrompt(params)

			const response = await fetch(`${this.baseUrl}/calibrate`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					prompt: composedPrompt,
					reference_image_urls: params.referenceImageUrls,
					num_outputs: params.count,
					gender: params.gender.toLowerCase(),
					age_range: params.ageRange.toLowerCase(),
					ethnicity: params.ethnicity.toLowerCase(),
					body_type: params.bodyType.toLowerCase(),
				}),
			})

			if (!response.ok) {
				throw new Error(`Seedream API error: ${response.statusText}`)
			}

			const result = await response.json() as {
				images: Array<{
					id: string
					url: string
					thumbnail_url?: string
					width: number
					height: number
					seed?: number
				}>
				locked_identity_url?: string
			}

			const images: CalibrationImage[] = result.images.map((img) => ({
				id: img.id || randomUUID(),
				url: img.url,
				thumbnailUrl: img.thumbnail_url,
				metadata: {
					width: img.width,
					height: img.height,
					seed: img.seed,
				},
			}))

			return {
				success: true,
				images,
				lockedIdentityUrl: result.locked_identity_url,
				processingTimeMs: Date.now() - startTime,
				modelVersion: 'seedream-v1',
			}
		} catch (error) {
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
	 */
	private async realLockIdentity(modelId: string, selectedImageIds: string[]): Promise<string> {
		const response = await fetch(`${this.baseUrl}/lock-identity`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model_id: modelId,
				selected_image_ids: selectedImageIds,
			}),
		})

		if (!response.ok) {
			throw new Error(`Seedream API error: ${response.statusText}`)
		}

		const result = await response.json() as { locked_identity_url: string }
		return result.locked_identity_url
	}

	// ==================== MOCK IMPLEMENTATIONS ====================

	/**
	 * Mock implementation - Generate marketing images
	 */
	private async mockGenerateImages(params: GenerationParams): Promise<GenerationResult> {
		// Simulate processing delay
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
		// Simulate processing delay
		await this.delay(3000)

		const images: CalibrationImage[] = []

		for (let i = 0; i < params.count; i++) {
			images.push({
				id: randomUUID(),
				url: `https://picsum.photos/768/1024?random=${randomUUID()}`,
				thumbnailUrl: `https://picsum.photos/192/256?random=${randomUUID()}`,
				metadata: {
					width: 768,
					height: 1024,
					seed: Math.floor(Math.random() * 1000000),
				},
			})
		}

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

	// ==================== HELPER METHODS ====================

	/**
	 * Compose a prompt for image generation
	 */
	private composeGenerationPrompt(scenePrompt: string): string {
		return `Professional fashion photography, ${scenePrompt}, high quality, studio lighting, 8k resolution`
	}

	/**
	 * Compose a prompt for calibration image generation
	 */
	private composeCalibrationPrompt(params: CalibrationParams): string {
		const parts = [
			'Professional fashion model portrait',
			params.prompt,
			`${params.gender.toLowerCase()} presenting`,
			`${params.ageRange.toLowerCase().replace('_', ' ')} appearance`,
			`${params.ethnicity.toLowerCase().replace('_', ' ')}`,
			`${params.bodyType.toLowerCase().replace('_', ' ')} body type`,
			'high quality studio photography',
			'neutral background',
			'8k resolution',
		].filter(Boolean)

		return parts.join(', ')
	}

	/**
	 * Delay helper for mock implementations
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}
}
