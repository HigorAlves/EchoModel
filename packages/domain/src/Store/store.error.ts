/**
 * @fileoverview Store Domain Errors
 *
 * Domain errors represent business rule violations and exceptional situations
 * that can occur within the Store bounded context.
 */

/**
 * Store Error Codes
 *
 * Standard error codes for store-related operations.
 */
export const StoreErrorCodes = {
	// Entity lifecycle errors
	NOT_FOUND: 'STORE_NOT_FOUND',
	ALREADY_EXISTS: 'STORE_ALREADY_EXISTS',
	CREATION_FAILED: 'STORE_CREATION_FAILED',
	UPDATE_FAILED: 'STORE_UPDATE_FAILED',
	DELETE_FAILED: 'STORE_DELETE_FAILED',

	// Validation errors
	INVALID_INPUT: 'STORE_INVALID_INPUT',
	INVALID_STATUS: 'STORE_INVALID_STATUS',
	INVALID_TRANSITION: 'STORE_INVALID_TRANSITION',

	// Business rule violations
	BUSINESS_RULE_VIOLATION: 'STORE_BUSINESS_RULE_VIOLATION',
	INSUFFICIENT_PERMISSIONS: 'STORE_INSUFFICIENT_PERMISSIONS',
	OPERATION_NOT_ALLOWED: 'STORE_OPERATION_NOT_ALLOWED',

	// Store-specific errors
	OWNER_MISMATCH: 'STORE_OWNER_MISMATCH',
	SUSPENDED: 'STORE_SUSPENDED',
} as const

/**
 * Store Error Messages
 *
 * Human-readable error messages corresponding to error codes.
 */
export const StoreErrorMessages = {
	[StoreErrorCodes.NOT_FOUND]: 'Store not found',
	[StoreErrorCodes.ALREADY_EXISTS]: 'Store already exists',
	[StoreErrorCodes.CREATION_FAILED]: 'Failed to create store',
	[StoreErrorCodes.UPDATE_FAILED]: 'Failed to update store',
	[StoreErrorCodes.DELETE_FAILED]: 'Failed to delete store',
	[StoreErrorCodes.INVALID_INPUT]: 'Invalid store input provided',
	[StoreErrorCodes.INVALID_STATUS]: 'Invalid store status',
	[StoreErrorCodes.INVALID_TRANSITION]: 'Invalid status transition attempted',
	[StoreErrorCodes.BUSINESS_RULE_VIOLATION]: 'Business rule violation detected',
	[StoreErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for this operation',
	[StoreErrorCodes.OPERATION_NOT_ALLOWED]: 'Operation not allowed in current state',
	[StoreErrorCodes.OWNER_MISMATCH]: 'User is not the owner of this store',
	[StoreErrorCodes.SUSPENDED]: 'Store is suspended and cannot perform this operation',
} as const

/**
 * Base domain error class for Store operations
 */
export abstract class StoreDomainError extends Error {
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
 * Error thrown when a store is not found
 */
export class StoreNotFoundError extends StoreDomainError {
	readonly code = StoreErrorCodes.NOT_FOUND
	readonly statusCode = 404

	constructor(id: string, context?: Record<string, unknown>) {
		super(`Store with ID '${id}' not found`, context)
	}
}

/**
 * Error thrown when trying to create a store that already exists
 */
export class StoreAlreadyExistsError extends StoreDomainError {
	readonly code = StoreErrorCodes.ALREADY_EXISTS
	readonly statusCode = 409

	constructor(identifier: string, context?: Record<string, unknown>) {
		super(`Store with identifier '${identifier}' already exists`, context)
	}
}

/**
 * Error thrown when store validation fails
 */
export class StoreValidationError extends StoreDomainError {
	readonly code = StoreErrorCodes.INVALID_INPUT
	readonly statusCode = 400

	constructor(validationErrors: string[], context?: Record<string, unknown>) {
		super(`Store validation failed: ${validationErrors.join(', ')}`, { ...context, validationErrors })
	}
}

/**
 * Error thrown when a business rule is violated
 */
export class StoreBusinessRuleError extends StoreDomainError {
	readonly code = StoreErrorCodes.BUSINESS_RULE_VIOLATION
	readonly statusCode = 422

	constructor(rule: string, context?: Record<string, unknown>) {
		super(`Store business rule violation: ${rule}`, { ...context, rule })
	}
}

/**
 * Error thrown when an invalid status transition is attempted
 */
export class StoreInvalidTransitionError extends StoreDomainError {
	readonly code = StoreErrorCodes.INVALID_TRANSITION
	readonly statusCode = 422

	constructor(fromStatus: string, toStatus: string, context?: Record<string, unknown>) {
		super(`Invalid store status transition from '${fromStatus}' to '${toStatus}'`, { ...context, fromStatus, toStatus })
	}
}

/**
 * Error thrown when user is not the owner of the store
 */
export class StoreOwnerMismatchError extends StoreDomainError {
	readonly code = StoreErrorCodes.OWNER_MISMATCH
	readonly statusCode = 403

	constructor(storeId: string, userId: string, context?: Record<string, unknown>) {
		super(`User '${userId}' is not the owner of store '${storeId}'`, { ...context, storeId, userId })
	}
}

/**
 * Error thrown when store is suspended
 */
export class StoreSuspendedError extends StoreDomainError {
	readonly code = StoreErrorCodes.SUSPENDED
	readonly statusCode = 403

	constructor(storeId: string, context?: Record<string, unknown>) {
		super(`Store '${storeId}' is suspended and cannot perform operations`, { ...context, storeId })
	}
}

/**
 * Type guard to check if an error is a Store domain error
 */
export function isStoreDomainError(error: unknown): error is StoreDomainError {
	return error instanceof StoreDomainError
}

/**
 * Get error message for a given error code
 */
export function getStoreErrorMessage(code: string): string {
	return StoreErrorMessages[code as keyof typeof StoreErrorMessages] || 'Unknown error'
}
