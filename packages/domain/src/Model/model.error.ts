/**
 * @fileoverview Model Domain Errors
 *
 * Domain errors represent business rule violations and exceptional situations
 * that can occur within the Model (AI Influencer) bounded context.
 */

/**
 * Model Error Codes
 */
export const ModelErrorCodes = {
	// Entity lifecycle errors
	NOT_FOUND: 'MODEL_NOT_FOUND',
	ALREADY_EXISTS: 'MODEL_ALREADY_EXISTS',
	CREATION_FAILED: 'MODEL_CREATION_FAILED',
	UPDATE_FAILED: 'MODEL_UPDATE_FAILED',
	DELETE_FAILED: 'MODEL_DELETE_FAILED',

	// Validation errors
	INVALID_INPUT: 'MODEL_INVALID_INPUT',
	INVALID_STATUS: 'MODEL_INVALID_STATUS',
	INVALID_TRANSITION: 'MODEL_INVALID_TRANSITION',

	// Business rule violations
	BUSINESS_RULE_VIOLATION: 'MODEL_BUSINESS_RULE_VIOLATION',
	INSUFFICIENT_PERMISSIONS: 'MODEL_INSUFFICIENT_PERMISSIONS',
	OPERATION_NOT_ALLOWED: 'MODEL_OPERATION_NOT_ALLOWED',

	// Model-specific errors
	CALIBRATION_IN_PROGRESS: 'MODEL_CALIBRATION_IN_PROGRESS',
	CALIBRATION_FAILED: 'MODEL_CALIBRATION_FAILED',
	NOT_ACTIVE: 'MODEL_NOT_ACTIVE',
	ARCHIVED: 'MODEL_ARCHIVED',
	REQUIRES_PROMPT_OR_REFERENCES: 'MODEL_REQUIRES_PROMPT_OR_REFERENCES',
} as const

/**
 * Model Error Messages
 */
export const ModelErrorMessages = {
	[ModelErrorCodes.NOT_FOUND]: 'Model not found',
	[ModelErrorCodes.ALREADY_EXISTS]: 'Model already exists',
	[ModelErrorCodes.CREATION_FAILED]: 'Failed to create model',
	[ModelErrorCodes.UPDATE_FAILED]: 'Failed to update model',
	[ModelErrorCodes.DELETE_FAILED]: 'Failed to delete model',
	[ModelErrorCodes.INVALID_INPUT]: 'Invalid model input provided',
	[ModelErrorCodes.INVALID_STATUS]: 'Invalid model status',
	[ModelErrorCodes.INVALID_TRANSITION]: 'Invalid status transition attempted',
	[ModelErrorCodes.BUSINESS_RULE_VIOLATION]: 'Business rule violation detected',
	[ModelErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for this operation',
	[ModelErrorCodes.OPERATION_NOT_ALLOWED]: 'Operation not allowed in current state',
	[ModelErrorCodes.CALIBRATION_IN_PROGRESS]: 'Model calibration is already in progress',
	[ModelErrorCodes.CALIBRATION_FAILED]: 'Model calibration failed',
	[ModelErrorCodes.NOT_ACTIVE]: 'Model is not active',
	[ModelErrorCodes.ARCHIVED]: 'Model has been archived',
	[ModelErrorCodes.REQUIRES_PROMPT_OR_REFERENCES]: 'Model requires either a prompt or reference images',
} as const

/**
 * Base domain error class for Model operations
 */
export abstract class ModelDomainError extends Error {
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
 * Error thrown when a model is not found
 */
export class ModelNotFoundError extends ModelDomainError {
	readonly code = ModelErrorCodes.NOT_FOUND
	readonly statusCode = 404

	constructor(id: string, context?: Record<string, unknown>) {
		super(`Model with ID '${id}' not found`, context)
	}
}

/**
 * Error thrown when model validation fails
 */
export class ModelValidationError extends ModelDomainError {
	readonly code = ModelErrorCodes.INVALID_INPUT
	readonly statusCode = 400

	constructor(validationErrors: string[], context?: Record<string, unknown>) {
		super(`Model validation failed: ${validationErrors.join(', ')}`, { ...context, validationErrors })
	}
}

/**
 * Error thrown when an invalid status transition is attempted
 */
export class ModelInvalidTransitionError extends ModelDomainError {
	readonly code = ModelErrorCodes.INVALID_TRANSITION
	readonly statusCode = 422

	constructor(fromStatus: string, toStatus: string, context?: Record<string, unknown>) {
		super(`Invalid model status transition from '${fromStatus}' to '${toStatus}'`, { ...context, fromStatus, toStatus })
	}
}

/**
 * Error thrown when calibration is already in progress
 */
export class ModelCalibrationInProgressError extends ModelDomainError {
	readonly code = ModelErrorCodes.CALIBRATION_IN_PROGRESS
	readonly statusCode = 409

	constructor(modelId: string, context?: Record<string, unknown>) {
		super(`Model '${modelId}' calibration is already in progress`, { ...context, modelId })
	}
}

/**
 * Error thrown when calibration fails
 */
export class ModelCalibrationFailedError extends ModelDomainError {
	readonly code = ModelErrorCodes.CALIBRATION_FAILED
	readonly statusCode = 422

	constructor(modelId: string, reason: string, context?: Record<string, unknown>) {
		super(`Model '${modelId}' calibration failed: ${reason}`, { ...context, modelId, reason })
	}
}

/**
 * Error thrown when model is not active
 */
export class ModelNotActiveError extends ModelDomainError {
	readonly code = ModelErrorCodes.NOT_ACTIVE
	readonly statusCode = 422

	constructor(modelId: string, currentStatus: string, context?: Record<string, unknown>) {
		super(`Model '${modelId}' is not active (current status: ${currentStatus})`, { ...context, modelId, currentStatus })
	}
}

/**
 * Error thrown when model is archived
 */
export class ModelArchivedError extends ModelDomainError {
	readonly code = ModelErrorCodes.ARCHIVED
	readonly statusCode = 410

	constructor(modelId: string, context?: Record<string, unknown>) {
		super(`Model '${modelId}' has been archived`, { ...context, modelId })
	}
}

/**
 * Error thrown when model requires prompt or references
 */
export class ModelRequiresInputError extends ModelDomainError {
	readonly code = ModelErrorCodes.REQUIRES_PROMPT_OR_REFERENCES
	readonly statusCode = 400

	constructor(context?: Record<string, unknown>) {
		super('Model requires either a prompt or reference images for creation', context)
	}
}

/**
 * Type guard to check if an error is a Model domain error
 */
export function isModelDomainError(error: unknown): error is ModelDomainError {
	return error instanceof ModelDomainError
}

/**
 * Get error message for a given error code
 */
export function getModelErrorMessage(code: string): string {
	return ModelErrorMessages[code as keyof typeof ModelErrorMessages] || 'Unknown error'
}
