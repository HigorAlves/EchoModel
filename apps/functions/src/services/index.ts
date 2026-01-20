/**
 * @fileoverview Service Exports
 *
 * Exports all service implementations.
 */

// ==================== Queue & Rate Limiting ====================
export { type EnqueueOptions, type QueueConfig, QueueService, type QueueStatus } from './queue.service'
export { type RateLimiterConfig, RateLimiterService, type RateLimitResult } from './rate-limiter.service'
// ==================== Seedream 4.5 (Recommended) ====================
export { Seedream45Service } from './seedream45.service'
export {
	type AllowedImageFormat,
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
	type Seedream45Image,
	Seedream45Model,
	type Seedream45PromptOptimizeOptions,
	type Seedream45Request,
	type Seedream45Response,
	type Seedream45ResponseFormat,
	type Seedream45SequentialMode,
	type Seedream45SequentialOptions,
	type Seedream45Size,
	type Seedream45StreamEvent,
	type Seedream45StreamEventType,
} from './seedream45.types'
export { FirebaseStorageService } from './storage.service'

// ==================== Legacy Services (Deprecated) ====================

/**
 * @deprecated Use `Seedream45Service` instead. This service will be removed in a future version.
 */
export {
	type BytePlusConfig,
	BytePlusService,
	type GeneratedImage,
	type GenerateImageRequest,
	type GenerateImageResponse,
	ImageSize,
	ResponseFormat,
	SeedreamModel,
} from './byteplus.service'
/**
 * @deprecated Use `Seedream45Service` instead. This service will be removed in a future version.
 */
export { SeedreamService } from './seedream.service'
