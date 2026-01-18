/**
 * @fileoverview Asset Domain Errors
 *
 * Domain errors represent business rule violations and exceptional situations
 * that can occur within the Asset bounded context.
 */

/**
 * Asset Error Codes
 */
export const AssetErrorCodes = {
	// Entity lifecycle errors
	NOT_FOUND: 'ASSET_NOT_FOUND',
	ALREADY_EXISTS: 'ASSET_ALREADY_EXISTS',
	CREATION_FAILED: 'ASSET_CREATION_FAILED',
	UPDATE_FAILED: 'ASSET_UPDATE_FAILED',
	DELETE_FAILED: 'ASSET_DELETE_FAILED',

	// Validation errors
	INVALID_INPUT: 'ASSET_INVALID_INPUT',
	INVALID_STATUS: 'ASSET_INVALID_STATUS',
	INVALID_MIME_TYPE: 'ASSET_INVALID_MIME_TYPE',
	FILE_TOO_LARGE: 'ASSET_FILE_TOO_LARGE',

	// Business rule violations
	BUSINESS_RULE_VIOLATION: 'ASSET_BUSINESS_RULE_VIOLATION',
	INSUFFICIENT_PERMISSIONS: 'ASSET_INSUFFICIENT_PERMISSIONS',
	OPERATION_NOT_ALLOWED: 'ASSET_OPERATION_NOT_ALLOWED',

	// Asset-specific errors
	UPLOAD_FAILED: 'ASSET_UPLOAD_FAILED',
	DOWNLOAD_FAILED: 'ASSET_DOWNLOAD_FAILED',
	PROCESSING_FAILED: 'ASSET_PROCESSING_FAILED',
	URL_GENERATION_FAILED: 'ASSET_URL_GENERATION_FAILED',
} as const

/**
 * Asset Error Messages
 */
export const AssetErrorMessages = {
	[AssetErrorCodes.NOT_FOUND]: 'Asset not found',
	[AssetErrorCodes.ALREADY_EXISTS]: 'Asset already exists',
	[AssetErrorCodes.CREATION_FAILED]: 'Failed to create asset',
	[AssetErrorCodes.UPDATE_FAILED]: 'Failed to update asset',
	[AssetErrorCodes.DELETE_FAILED]: 'Failed to delete asset',
	[AssetErrorCodes.INVALID_INPUT]: 'Invalid asset input provided',
	[AssetErrorCodes.INVALID_STATUS]: 'Invalid asset status',
	[AssetErrorCodes.INVALID_MIME_TYPE]: 'Invalid or unsupported MIME type',
	[AssetErrorCodes.FILE_TOO_LARGE]: 'File size exceeds maximum allowed',
	[AssetErrorCodes.BUSINESS_RULE_VIOLATION]: 'Business rule violation detected',
	[AssetErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for this operation',
	[AssetErrorCodes.OPERATION_NOT_ALLOWED]: 'Operation not allowed in current state',
	[AssetErrorCodes.UPLOAD_FAILED]: 'Failed to upload asset',
	[AssetErrorCodes.DOWNLOAD_FAILED]: 'Failed to download asset',
	[AssetErrorCodes.PROCESSING_FAILED]: 'Failed to process asset',
	[AssetErrorCodes.URL_GENERATION_FAILED]: 'Failed to generate signed URL',
} as const

/**
 * Base domain error class for Asset operations
 */
export abstract class AssetDomainError extends Error {
	abstract readonly code: string
	abstract readonly statusCode: number

	constructor(
		message: string,
		public readonly context?: Record<string, unknown>,
	) {
		super(message)
		this.name = this.constructor.name
		Error.captureStackTrace(this, this.constructor)
	}
}

/**
 * Error thrown when an asset is not found
 */
export class AssetNotFoundError extends AssetDomainError {
	readonly code = AssetErrorCodes.NOT_FOUND
	readonly statusCode = 404

	constructor(id: string, context?: Record<string, unknown>) {
		super(`Asset with ID '${id}' not found`, context)
	}
}

/**
 * Error thrown when asset validation fails
 */
export class AssetValidationError extends AssetDomainError {
	readonly code = AssetErrorCodes.INVALID_INPUT
	readonly statusCode = 400

	constructor(validationErrors: string[], context?: Record<string, unknown>) {
		super(`Asset validation failed: ${validationErrors.join(', ')}`, { ...context, validationErrors })
	}
}

/**
 * Error thrown when file is too large
 */
export class AssetFileTooLargeError extends AssetDomainError {
	readonly code = AssetErrorCodes.FILE_TOO_LARGE
	readonly statusCode = 413

	constructor(actualSize: number, maxSize: number, context?: Record<string, unknown>) {
		super(`File size ${actualSize} bytes exceeds maximum allowed ${maxSize} bytes`, { ...context, actualSize, maxSize })
	}
}

/**
 * Error thrown when MIME type is invalid
 */
export class AssetInvalidMimeTypeError extends AssetDomainError {
	readonly code = AssetErrorCodes.INVALID_MIME_TYPE
	readonly statusCode = 415

	constructor(mimeType: string, context?: Record<string, unknown>) {
		super(`Invalid or unsupported MIME type: ${mimeType}`, { ...context, mimeType })
	}
}

/**
 * Error thrown when upload fails
 */
export class AssetUploadError extends AssetDomainError {
	readonly code = AssetErrorCodes.UPLOAD_FAILED
	readonly statusCode = 500

	constructor(reason: string, context?: Record<string, unknown>) {
		super(`Asset upload failed: ${reason}`, { ...context, reason })
	}
}

/**
 * Error thrown when processing fails
 */
export class AssetProcessingError extends AssetDomainError {
	readonly code = AssetErrorCodes.PROCESSING_FAILED
	readonly statusCode = 500

	constructor(assetId: string, reason: string, context?: Record<string, unknown>) {
		super(`Asset processing failed for '${assetId}': ${reason}`, { ...context, assetId, reason })
	}
}

/**
 * Type guard to check if an error is an Asset domain error
 */
export function isAssetDomainError(error: unknown): error is AssetDomainError {
	return error instanceof AssetDomainError
}

/**
 * Get error message for a given error code
 */
export function getAssetErrorMessage(code: string): string {
	return AssetErrorMessages[code as keyof typeof AssetErrorMessages] || 'Unknown error'
}
