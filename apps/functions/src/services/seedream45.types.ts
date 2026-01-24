/**
 * @fileoverview Seedream 4.5 API Type Definitions
 *
 * Type definitions for the official BytePlus Seedream 4.5 API.
 * Documentation: https://docs.byteplus.com/en/docs/ModelArk/1541523
 *
 * Key Seedream 4.5 features:
 * - Multi-image references: up to 14 images via `image` parameter
 * - Sequential batch generation: generates related images
 * - Max total images: input + output <= 15
 */

/**
 * Seedream model versions
 */
export enum Seedream45Model {
	/** Seedream 4.0 model */
	SEEDREAM_4_0 = 'seedream-4-0-250828',
	/** Seedream 4.5 model (latest) */
	SEEDREAM_4_5 = 'seedream-4-5-251128',
}

/**
 * BytePlus region endpoints
 */
export enum BytePlusRegion {
	/** Beijing region (China) */
	CN_BEIJING = 'cn-beijing',
	/** Southeast Asia region */
	AP_SOUTHEAST = 'ap-southeast',
}

/**
 * Region to base URL mapping
 */
export const BYTEPLUS_REGION_URLS: Record<BytePlusRegion, string> = {
	[BytePlusRegion.CN_BEIJING]: 'https://ark.cn-beijing.volces.com/api/v3',
	[BytePlusRegion.AP_SOUTHEAST]: 'https://ark.ap-southeast.bytepluses.com/api/v3',
}

/**
 * Image size presets
 */
export type Seedream45Size = '2K' | '4K' | `${number}x${number}`

/**
 * Response format options
 */
export type Seedream45ResponseFormat = 'url' | 'b64_json'

/**
 * Prompt optimization modes
 */
export type Seedream45PromptOptimizeMode = 'standard' | 'fast'

/**
 * Sequential image generation modes
 */
export type Seedream45SequentialMode = 'auto' | 'disabled'

/**
 * Prompt optimization options
 */
export interface Seedream45PromptOptimizeOptions {
	/** Optimization mode: 'standard' for better quality, 'fast' for speed */
	mode?: Seedream45PromptOptimizeMode
}

/**
 * Sequential image generation options
 */
export interface Seedream45SequentialOptions {
	/** Maximum number of images to generate in sequence */
	max_images?: number
}

/**
 * Seedream 4.5 API request parameters
 */
export interface Seedream45Request {
	/** Model to use for generation */
	model: Seedream45Model | string
	/** Image description or editing instruction */
	prompt: string
	/**
	 * Reference images for image-to-image operations
	 * - Single image: string URL
	 * - Multiple images: array of URLs (max 14)
	 */
	image?: string | string[]
	/**
	 * Image resolution
	 * - '2K': ~2048x2048 (default)
	 * - '4K': ~4096x4096
	 * - 'WxH': Custom pixel dimensions (min 3,686,400px, max 16,777,216px total)
	 */
	size?: Seedream45Size
	/** Response format: 'url' or 'b64_json' */
	response_format?: Seedream45ResponseFormat
	/** Whether to add watermark (default: true) */
	watermark?: boolean
	/** Number of images to generate (1-4) */
	n?: number
	/**
	 * Sequential image generation mode
	 * - 'auto': Generate related images in sequence
	 * - 'disabled': Generate independent images (default)
	 *
	 * NOTE: Total input + output images must be <= 15
	 */
	sequential_image_generation?: Seedream45SequentialMode
	/** Options for sequential generation */
	sequential_image_generation_options?: Seedream45SequentialOptions
	/** Options for prompt optimization */
	optimize_prompt_options?: Seedream45PromptOptimizeOptions
}

/**
 * Generated image data in response
 */
export interface Seedream45Image {
	/** Image URL (when response_format is 'url') */
	url?: string
	/** Base64 encoded image data (when response_format is 'b64_json') */
	b64_json?: string
	/** Revised/enhanced prompt used for generation */
	revised_prompt?: string
}

/**
 * Seedream 4.5 API response
 */
export interface Seedream45Response {
	/** Unix timestamp of creation */
	created: number
	/** Generated images */
	data: Seedream45Image[]
}

/**
 * BytePlus API error response
 */
export interface Seedream45Error {
	error: {
		code: string
		message: string
		type: string
	}
}

/**
 * Seedream 4.5 service configuration
 */
export interface Seedream45Config {
	/** BytePlus API key */
	apiKey?: string
	/** Endpoint ID (e.g., 'ep-xxxxxxxx') - overrides default model */
	endpointId?: string
	/** API region (determines base URL) */
	region?: BytePlusRegion
	/** Custom base URL (overrides region-based URL) */
	baseUrl?: string
	/** Request timeout in milliseconds (default: 60000) */
	timeout?: number
	/** Maximum retry attempts (default: 3) */
	maxRetries?: number
	/** Force mock mode (default: false, auto-enabled when no API key) */
	useMock?: boolean
}

/**
 * Maximum number of reference images allowed by Seedream 4.5
 */
export const MAX_REFERENCE_IMAGES = 14

/**
 * Maximum total images (input + output) allowed by Seedream 4.5
 */
export const MAX_TOTAL_IMAGES = 15

/**
 * Default image size
 */
export const DEFAULT_IMAGE_SIZE: Seedream45Size = '2K'

/**
 * Default response format
 */
export const DEFAULT_RESPONSE_FORMAT: Seedream45ResponseFormat = 'url'

/**
 * Image validation constraints from official BytePlus documentation
 * @see https://docs.byteplus.com/en/docs/ModelArk/1541523
 */
export const IMAGE_CONSTRAINTS = {
	/** Allowed MIME types for image uploads */
	ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff', 'image/gif'] as const,

	/** Maximum file size in bytes (10 MB per BytePlus docs) */
	MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,

	/** Minimum dimension for any side (14 pixels) */
	MIN_DIMENSION_PX: 14,

	/** Maximum total pixels (36,000,000 = 6000x6000) */
	MAX_TOTAL_PIXELS: 36_000_000,

	/** Aspect ratio constraints */
	ASPECT_RATIO_RANGE: {
		/** Minimum aspect ratio (1:16) */
		min: 1 / 16,
		/** Maximum aspect ratio (16:1) */
		max: 16,
	},

	/** Seedream 4.5 specific pixel constraints */
	SEEDREAM_45: {
		/** Minimum total pixels for Seedream 4.5 (2560x1440 = 3,686,400) */
		MIN_TOTAL_PIXELS: 3_686_400,
		/** Maximum total pixels for Seedream 4.5 (4096x4096 = 16,777,216) */
		MAX_TOTAL_PIXELS: 16_777_216,
	},

	/** Rate limit: 500 images per minute */
	RATE_LIMIT: {
		/** Maximum images per window */
		MAX_IMAGES_PER_MINUTE: 500,
		/** Window duration in seconds */
		WINDOW_SECONDS: 60,
	},

	/** URL retention: 24 hours before automatic cleanup */
	URL_RETENTION_HOURS: 24,
} as const

/**
 * Image format type from allowed formats
 */
export type AllowedImageFormat = (typeof IMAGE_CONSTRAINTS.ALLOWED_FORMATS)[number]

/**
 * Image metadata for validation
 */
export interface ImageMetadata {
	/** Image width in pixels */
	width: number
	/** Image height in pixels */
	height: number
	/** File size in bytes */
	sizeBytes: number
	/** MIME type */
	mimeType: string
}

/**
 * Image validation result
 */
export interface ImageValidationResult {
	/** Whether the image is valid */
	valid: boolean
	/** Error messages if invalid */
	errors: string[]
}

/**
 * Streaming event types for progressive delivery
 */
export type Seedream45StreamEventType =
	| 'image_generation.started'
	| 'image_generation.partial_succeeded'
	| 'image_generation.completed'
	| 'image_generation.failed'

/**
 * Streaming event data
 */
export interface Seedream45StreamEvent {
	/** Event type */
	type: Seedream45StreamEventType
	/** Event data */
	data: {
		/** Generated image (for partial_succeeded) */
		image?: Seedream45Image
		/** Progress percentage (0-100) */
		progress?: number
		/** Error message (for failed) */
		error?: string
	}
}
