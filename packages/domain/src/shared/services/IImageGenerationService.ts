import type { AspectRatio } from '../../Store/store.enum'

/**
 * @fileoverview Image Generation Service Interface
 *
 * Defines the contract for AI image generation services.
 * This service generates marketing images using a locked model identity
 * and garment images.
 */

/**
 * Parameters for generating images
 */
export interface GenerationParams {
	/** URL to the locked model identity */
	readonly modelIdentityUrl: string
	/** URL to the garment image */
	readonly garmentImageUrl: string
	/** Text prompt describing the scene */
	readonly scenePrompt: string
	/** Aspect ratios to generate */
	readonly aspectRatios: AspectRatio[]
	/** Number of images to generate per aspect ratio */
	readonly count: number
}

/**
 * A single generated image result
 */
export interface GeneratedImageResult {
	/** Unique identifier for this generated image */
	readonly id: string
	/** Aspect ratio of this image */
	readonly aspectRatio: AspectRatio
	/** URL to access the generated image */
	readonly url: string
	/** URL to thumbnail version (optional) */
	readonly thumbnailUrl?: string
	/** Raw image data (optional, for direct upload) */
	readonly imageData?: Buffer
	/** Generation metadata */
	readonly metadata?: {
		readonly width: number
		readonly height: number
		readonly seed?: number
	}
}

/**
 * Result of image generation
 */
export interface GenerationResult {
	/** Whether the generation was successful */
	readonly success: boolean
	/** Generated images */
	readonly images: GeneratedImageResult[]
	/** Error message if failed */
	readonly error?: string
	/** Processing time in milliseconds */
	readonly processingTimeMs?: number
	/** AI model version used */
	readonly modelVersion?: string
}

/**
 * Image Generation Service Interface
 *
 * Service for generating marketing images using AI models and garments.
 */
export interface IImageGenerationService {
	/**
	 * Generate marketing images
	 * @param params - Generation parameters
	 * @returns Generation result with generated images
	 */
	generateImages(params: GenerationParams): Promise<GenerationResult>
}
