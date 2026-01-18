/**
 * @fileoverview Generation Domain Errors
 *
 * Domain errors represent business rule violations and exceptional situations
 * that can occur within the Generation bounded context.
 */

/**
 * Generation Error Codes
 */
export const GenerationErrorCodes = {
	// Entity lifecycle errors
	NOT_FOUND: 'GENERATION_NOT_FOUND',
	ALREADY_EXISTS: 'GENERATION_ALREADY_EXISTS',
	CREATION_FAILED: 'GENERATION_CREATION_FAILED',

	// Validation errors
	INVALID_INPUT: 'GENERATION_INVALID_INPUT',
	INVALID_STATUS: 'GENERATION_INVALID_STATUS',
	INVALID_TRANSITION: 'GENERATION_INVALID_TRANSITION',

	// Business rule violations
	BUSINESS_RULE_VIOLATION: 'GENERATION_BUSINESS_RULE_VIOLATION',
	INSUFFICIENT_PERMISSIONS: 'GENERATION_INSUFFICIENT_PERMISSIONS',
	OPERATION_NOT_ALLOWED: 'GENERATION_OPERATION_NOT_ALLOWED',

	// Generation-specific errors
	MODEL_NOT_ACTIVE: 'GENERATION_MODEL_NOT_ACTIVE',
	PROCESSING_FAILED: 'GENERATION_PROCESSING_FAILED',
	IDEMPOTENCY_CONFLICT: 'GENERATION_IDEMPOTENCY_CONFLICT',
	QUOTA_EXCEEDED: 'GENERATION_QUOTA_EXCEEDED',
} as const

/**
 * Generation Error Messages
 */
export const GenerationErrorMessages = {
	[GenerationErrorCodes.NOT_FOUND]: 'Generation not found',
	[GenerationErrorCodes.ALREADY_EXISTS]: 'Generation already exists',
	[GenerationErrorCodes.CREATION_FAILED]: 'Failed to create generation',
	[GenerationErrorCodes.INVALID_INPUT]: 'Invalid generation input provided',
	[GenerationErrorCodes.INVALID_STATUS]: 'Invalid generation status',
	[GenerationErrorCodes.INVALID_TRANSITION]: 'Invalid status transition attempted',
	[GenerationErrorCodes.BUSINESS_RULE_VIOLATION]: 'Business rule violation detected',
	[GenerationErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for this operation',
	[GenerationErrorCodes.OPERATION_NOT_ALLOWED]: 'Operation not allowed in current state',
	[GenerationErrorCodes.MODEL_NOT_ACTIVE]: 'Model is not active for generation',
	[GenerationErrorCodes.PROCESSING_FAILED]: 'Generation processing failed',
	[GenerationErrorCodes.IDEMPOTENCY_CONFLICT]: 'A generation with this idempotency key already exists',
	[GenerationErrorCodes.QUOTA_EXCEEDED]: 'Generation quota exceeded',
} as const

/**
 * Base domain error class for Generation operations
 */
export abstract class GenerationDomainError extends Error {
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
 * Error thrown when a generation is not found
 */
export class GenerationNotFoundError extends GenerationDomainError {
	readonly code = GenerationErrorCodes.NOT_FOUND
	readonly statusCode = 404

	constructor(id: string, context?: Record<string, unknown>) {
		super(`Generation with ID '${id}' not found`, context)
	}
}

/**
 * Error thrown when generation validation fails
 */
export class GenerationValidationError extends GenerationDomainError {
	readonly code = GenerationErrorCodes.INVALID_INPUT
	readonly statusCode = 400

	constructor(validationErrors: string[], context?: Record<string, unknown>) {
		super(`Generation validation failed: ${validationErrors.join(', ')}`, { ...context, validationErrors })
	}
}

/**
 * Error thrown when an invalid status transition is attempted
 */
export class GenerationInvalidTransitionError extends GenerationDomainError {
	readonly code = GenerationErrorCodes.INVALID_TRANSITION
	readonly statusCode = 422

	constructor(fromStatus: string, toStatus: string, context?: Record<string, unknown>) {
		super(`Invalid generation status transition from '${fromStatus}' to '${toStatus}'`, {
			...context,
			fromStatus,
			toStatus,
		})
	}
}

/**
 * Error thrown when model is not active
 */
export class GenerationModelNotActiveError extends GenerationDomainError {
	readonly code = GenerationErrorCodes.MODEL_NOT_ACTIVE
	readonly statusCode = 422

	constructor(modelId: string, context?: Record<string, unknown>) {
		super(`Model '${modelId}' is not active for generation`, { ...context, modelId })
	}
}

/**
 * Error thrown when processing fails
 */
export class GenerationProcessingFailedError extends GenerationDomainError {
	readonly code = GenerationErrorCodes.PROCESSING_FAILED
	readonly statusCode = 500

	constructor(generationId: string, reason: string, context?: Record<string, unknown>) {
		super(`Generation '${generationId}' processing failed: ${reason}`, { ...context, generationId, reason })
	}
}

/**
 * Error thrown when idempotency conflict occurs
 */
export class GenerationIdempotencyConflictError extends GenerationDomainError {
	readonly code = GenerationErrorCodes.IDEMPOTENCY_CONFLICT
	readonly statusCode = 409

	constructor(idempotencyKey: string, existingGenerationId: string, context?: Record<string, unknown>) {
		super(`A generation with idempotency key '${idempotencyKey}' already exists (ID: ${existingGenerationId})`, {
			...context,
			idempotencyKey,
			existingGenerationId,
		})
	}
}

/**
 * Error thrown when quota is exceeded
 */
export class GenerationQuotaExceededError extends GenerationDomainError {
	readonly code = GenerationErrorCodes.QUOTA_EXCEEDED
	readonly statusCode = 429

	constructor(storeId: string, context?: Record<string, unknown>) {
		super(`Generation quota exceeded for store '${storeId}'`, { ...context, storeId })
	}
}

/**
 * Type guard to check if an error is a Generation domain error
 */
export function isGenerationDomainError(error: unknown): error is GenerationDomainError {
	return error instanceof GenerationDomainError
}

/**
 * Get error message for a given error code
 */
export function getGenerationErrorMessage(code: string): string {
	return GenerationErrorMessages[code as keyof typeof GenerationErrorMessages] || 'Unknown error'
}
