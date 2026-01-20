/**
 * @fileoverview Seedream API Integration Service
 *
 * Implements IImageGenerationService and IModelCalibrationService interfaces
 * for AI image generation using the Seedream API.
 *
 * Supports Seedream 4.5 Fashion capabilities:
 * - Lighting Control: Preset profiles (soft studio, editorial contrast, natural daylight)
 * - Camera Standardization: Fixed framing (50mm lens, waist-up shots, specific crop ratios)
 * - Texture Rendering: Surface descriptions (e.g., "matte brushed cotton", "high-gloss patent leather")
 * - Outfit Swapping: Garment substitution using clothing photos as torso references
 *
 * Note: This implementation includes a mock mode for development/testing.
 * Set SEEDREAM_API_KEY environment variable to use the real API.
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
			// Compose the generation prompt with fashion config
			const composedPrompt = this.composeGenerationPrompt(params.scenePrompt, params.fashionConfig)

			// Get fashion config with defaults
			const fashionConfig = params.fashionConfig ?? this.getDefaultFashionConfig()

			// Map fashion config to API parameters
			const lightingParam = this.mapLightingPresetToApi(fashionConfig.lightingPreset)
			const cameraParams = this.mapCameraFramingToApi(fashionConfig.cameraFraming)

			// Generate images for each aspect ratio
			const images: GeneratedImageResult[] = []

			for (const aspectRatio of params.aspectRatios) {
				const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio]

				for (let i = 0; i < params.count; i++) {
					const response = await fetch(`${this.baseUrl}/generate`, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							prompt: composedPrompt,
							model_identity_url: params.modelIdentityUrl,
							garment_image_url: params.garmentImageUrl,
							width: dimensions.width,
							height: dimensions.height,
							num_outputs: 1,
							// TODO: Seedream 4.5 Fashion API parameters (update when API docs available)
							lighting: lightingParam,
							camera: {
								framing: cameraParams.framing,
								focal_length: cameraParams.focalLength,
							},
							texture_preferences: fashionConfig.texturePreferences,
						}),
					})

					if (!response.ok) {
						throw new Error(`Seedream API error: ${response.statusText}`)
					}

					const result = (await response.json()) as {
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
			// Compose the calibration prompt with fashion config
			const composedPrompt = this.composeCalibrationPrompt(params)

			// Get fashion config with defaults
			const fashionConfig = params.fashionConfig ?? this.getDefaultCalibrationFashionConfig()

			// Map fashion config to API parameters
			const lightingParam = this.mapLightingPresetToApi(fashionConfig.lightingPreset)
			const cameraParams = this.mapCameraFramingToApi(fashionConfig.cameraFraming)

			const response = await fetch(`${this.baseUrl}/calibrate`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
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
					// TODO: Seedream 4.5 Fashion API parameters (update when API docs available)
					lighting: lightingParam,
					camera: {
						framing: cameraParams.framing,
						focal_length: cameraParams.focalLength,
					},
					texture_preferences: fashionConfig.texturePreferences,
				}),
			})

			if (!response.ok) {
				throw new Error(`Seedream API error: ${response.statusText}`)
			}

			const result = (await response.json()) as {
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
				Authorization: `Bearer ${this.apiKey}`,
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

		const result = (await response.json()) as { locked_identity_url: string }
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
	 * Map LightingPreset to Seedream API lighting parameter
	 * TODO: Update with real Seedream API parameter names when integrating
	 */
	private mapLightingPresetToApi(preset: LightingPreset): string {
		switch (preset) {
			case LightingPreset.SOFT_STUDIO:
				return 'soft'
			case LightingPreset.EDITORIAL_CONTRAST:
				return 'high_contrast'
			case LightingPreset.NATURAL_DAYLIGHT:
				return 'natural'
			case LightingPreset.CUSTOM:
				return 'custom'
			default:
				return 'soft'
		}
	}

	/**
	 * Map CameraFraming to Seedream API camera parameters
	 * TODO: Update with real Seedream API parameter names when integrating
	 */
	private mapCameraFramingToApi(framing: CameraFraming): { framing: string; focalLength: number } {
		switch (framing) {
			case CameraFraming.WAIST_UP_50MM:
				return { framing: 'waist_up', focalLength: 50 }
			case CameraFraming.FULL_BODY_35MM:
				return { framing: 'full_body', focalLength: 35 }
			case CameraFraming.PORTRAIT_85MM:
				return { framing: 'portrait', focalLength: 85 }
			case CameraFraming.CUSTOM:
				return { framing: 'custom', focalLength: 50 }
			default:
				return { framing: 'waist_up', focalLength: 50 }
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
	 * Compose a prompt for image generation with Seedream 4.5 Fashion features
	 */
	private composeGenerationPrompt(scenePrompt: string, fashionConfig?: FashionConfig): string {
		const config = fashionConfig ?? this.getDefaultFashionConfig()

		const parts = [
			'Professional fashion photography',
			scenePrompt,
			this.getLightingDescription(config.lightingPreset),
			this.getCameraDescription(config.cameraFraming),
		]

		// Add texture preferences if provided
		if (config.texturePreferences.length > 0) {
			parts.push(`material textures: ${config.texturePreferences.join(', ')}`)
		}

		parts.push('high quality', '8k resolution')

		return parts.filter(Boolean).join(', ')
	}

	/**
	 * Compose a prompt for calibration image generation with fashion config
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

		// Add texture preferences if provided
		if (fashionConfig.texturePreferences.length > 0) {
			parts.push(`material textures: ${fashionConfig.texturePreferences.join(', ')}`)
		}

		parts.push('neutral background', '8k resolution')

		return parts.filter(Boolean).join(', ')
	}

	/**
	 * Delay helper for mock implementations
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}
}
