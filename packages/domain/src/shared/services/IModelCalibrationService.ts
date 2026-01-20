import type { AgeRange, BodyType, CameraFraming, Ethnicity, Gender, LightingPreset } from '../../Model/model.enum'

/**
 * @fileoverview Model Calibration Service Interface
 *
 * Defines the contract for AI model calibration services.
 * This service generates calibration images used to create and lock
 * the identity of an AI influencer model.
 */

/**
 * Fashion configuration for calibration
 */
export interface CalibrationFashionConfig {
	/** Lighting preset for calibration images */
	readonly lightingPreset: LightingPreset
	/** Camera framing for calibration images */
	readonly cameraFraming: CameraFraming
	/** Texture preferences to apply to calibration images */
	readonly texturePreferences: readonly string[]
}

/**
 * Parameters for generating calibration images
 */
export interface CalibrationParams {
	/** Text prompt describing the model (optional if reference images provided) */
	readonly prompt?: string
	/**
	 * URLs of reference images (optional, max 14 per Seedream 4.5 API)
	 * These images are used for multi-image character consistency.
	 */
	readonly referenceImageUrls?: string[]
	/** Gender presentation */
	readonly gender: Gender
	/** Apparent age range */
	readonly ageRange: AgeRange
	/** Ethnic appearance */
	readonly ethnicity: Ethnicity
	/** Body type */
	readonly bodyType: BodyType
	/** Number of calibration images to generate (typically 4-8) */
	readonly count: number
	/**
	 * Use sequential generation for batch output (Seedream 4.5 feature)
	 * When enabled, generates related images in sequence for better consistency.
	 */
	readonly useSequentialGeneration?: boolean
	/** Seedream 4.5 Fashion configuration (optional, defaults will be applied if not provided) */
	readonly fashionConfig?: CalibrationFashionConfig
}

/**
 * A single calibration image result
 */
export interface CalibrationImage {
	/** Unique identifier for this calibration image */
	readonly id: string
	/** URL to access the generated image */
	readonly url: string
	/** URL to thumbnail version (optional) */
	readonly thumbnailUrl?: string
	/** Generation metadata */
	readonly metadata?: {
		readonly width: number
		readonly height: number
		readonly seed?: number
	}
}

/**
 * Result of calibration image generation
 */
export interface CalibrationResult {
	/** Whether the generation was successful */
	readonly success: boolean
	/** Generated calibration images */
	readonly images: CalibrationImage[]
	/** URL to the locked identity (used for subsequent generations) */
	readonly lockedIdentityUrl?: string
	/** Error message if failed */
	readonly error?: string
	/** Processing time in milliseconds */
	readonly processingTimeMs?: number
	/** AI model version used */
	readonly modelVersion?: string
}

/**
 * Model Calibration Service Interface
 *
 * Service for generating calibration images to create AI influencer identities.
 */
export interface IModelCalibrationService {
	/**
	 * Generate calibration images for a new model
	 * @param params - Calibration parameters
	 * @returns Calibration result with generated images
	 */
	generateCalibrationImages(params: CalibrationParams): Promise<CalibrationResult>

	/**
	 * Lock the model identity using selected calibration images
	 * @param modelId - The model ID
	 * @param selectedImageIds - IDs of selected calibration images
	 * @returns URL to the locked identity
	 */
	lockIdentity(modelId: string, selectedImageIds: string[]): Promise<string>
}
