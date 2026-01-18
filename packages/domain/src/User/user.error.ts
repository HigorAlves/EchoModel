/**
 * @fileoverview User Domain Errors
 *
 * Domain errors represent business rule violations and exceptional situations
 * that can occur within the domain. They should:
 * - Use business language and concepts
 * - Be specific and actionable
 * - Provide enough context for handling
 * - Be typed for better error handling
 *
 * Domain errors help:
 * - Communicate business rule violations clearly
 * - Provide consistent error handling
 * - Enable proper error recovery strategies
 * - Maintain domain integrity
 */

/**
 * User Error Codes
 *
 * Standard error codes for user-related operations.
 * These codes provide consistent error identification across the domain.
 */
export const UserErrorCodes = {
	// Entity lifecycle errors
	NOT_FOUND: 'USER_NOT_FOUND',
	ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
	CREATION_FAILED: 'USER_CREATION_FAILED',
	UPDATE_FAILED: 'USER_UPDATE_FAILED',
	DELETE_FAILED: 'USER_DELETE_FAILED',

	// Validation errors
	INVALID_INPUT: 'USER_INVALID_INPUT',
	INVALID_STATUS: 'USER_INVALID_STATUS',
	INVALID_TRANSITION: 'USER_INVALID_TRANSITION',

	// Business rule violations
	BUSINESS_RULE_VIOLATION: 'USER_BUSINESS_RULE_VIOLATION',
	INSUFFICIENT_PERMISSIONS: 'USER_INSUFFICIENT_PERMISSIONS',
	OPERATION_NOT_ALLOWED: 'USER_OPERATION_NOT_ALLOWED',
} as const

/**
 * User Error Messages
 *
 * Human-readable error messages corresponding to error codes.
 */
export const UserErrorMessages = {
	[UserErrorCodes.NOT_FOUND]: 'User not found',
	[UserErrorCodes.ALREADY_EXISTS]: 'User already exists',
	[UserErrorCodes.CREATION_FAILED]: 'Failed to create user',
	[UserErrorCodes.UPDATE_FAILED]: 'Failed to update user',
	[UserErrorCodes.DELETE_FAILED]: 'Failed to delete user',
	[UserErrorCodes.INVALID_INPUT]: 'Invalid user input provided',
	[UserErrorCodes.INVALID_STATUS]: 'Invalid user status',
	[UserErrorCodes.INVALID_TRANSITION]: 'Invalid status transition attempted',
	[UserErrorCodes.BUSINESS_RULE_VIOLATION]: 'Business rule violation detected',
	[UserErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for this operation',
	[UserErrorCodes.OPERATION_NOT_ALLOWED]: 'Operation not allowed in current state',
} as const

/**
 * Base domain error class for User operations
 */
export abstract class UserDomainError extends Error {
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
 * Error thrown when a user is not found
 */
export class UserNotFoundError extends UserDomainError {
	readonly code = UserErrorCodes.NOT_FOUND
	readonly statusCode = 404

	constructor(id: string, context?: Record<string, unknown>) {
		super(`User with ID '${id}' not found`, context)
	}
}

/**
 * Error thrown when trying to create a user that already exists
 */
export class UserAlreadyExistsError extends UserDomainError {
	readonly code = UserErrorCodes.ALREADY_EXISTS
	readonly statusCode = 409

	constructor(identifier: string, context?: Record<string, unknown>) {
		super(`User with identifier '${identifier}' already exists`, context)
	}
}

/**
 * Error thrown when user validation fails
 */
export class UserValidationError extends UserDomainError {
	readonly code = UserErrorCodes.INVALID_INPUT
	readonly statusCode = 400

	constructor(validationErrors: string[], context?: Record<string, unknown>) {
		super(`User validation failed: ${validationErrors.join(', ')}`, { ...context, validationErrors })
	}
}

/**
 * Error thrown when a business rule is violated
 */
export class UserBusinessRuleError extends UserDomainError {
	readonly code = UserErrorCodes.BUSINESS_RULE_VIOLATION
	readonly statusCode = 422

	constructor(rule: string, context?: Record<string, unknown>) {
		super(`User business rule violation: ${rule}`, { ...context, rule })
	}
}

/**
 * Error thrown when an invalid status transition is attempted
 */
export class UserInvalidTransitionError extends UserDomainError {
	readonly code = UserErrorCodes.INVALID_TRANSITION
	readonly statusCode = 422

	constructor(fromStatus: string, toStatus: string, context?: Record<string, unknown>) {
		super(`Invalid user status transition from '${fromStatus}' to '${toStatus}'`, { ...context, fromStatus, toStatus })
	}
}

/**
 * Type guard to check if an error is a User domain error
 */
export function isUserDomainError(error: unknown): error is UserDomainError {
	return error instanceof UserDomainError
}

/**
 * Get error message for a given error code
 */
export function getUserErrorMessage(code: string): string {
	return UserErrorMessages[code as keyof typeof UserErrorMessages] || 'Unknown error'
}
