/**
 * @fileoverview Application Errors
 *
 * Custom error handling for the application layer.
 */

/**
 * Application error codes
 */
export const ApplicationErrorCodes = {
	NOT_FOUND: 'NOT_FOUND',
	VALIDATION_FAILED: 'VALIDATION_FAILED',
	CONFLICT: 'CONFLICT',
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	FAILED: 'FAILED',
} as const

export type ApplicationErrorCode = (typeof ApplicationErrorCodes)[keyof typeof ApplicationErrorCodes]

/**
 * Application-level error class
 */
export class ApplicationError extends Error {
	readonly code: ApplicationErrorCode
	readonly statusCode: number
	readonly context?: Record<string, unknown>

	constructor(code: ApplicationErrorCode, message: string, statusCode: number, context?: Record<string, unknown>) {
		super(message)
		this.name = 'ApplicationError'
		this.code = code
		this.statusCode = statusCode
		this.context = context
		Error.captureStackTrace(this, this.constructor)
	}

	static notFound(entity: string, id: string): ApplicationError {
		return new ApplicationError(ApplicationErrorCodes.NOT_FOUND, `${entity} with ID '${id}' not found`, 404, {
			entity,
			id,
		})
	}

	static validation(message: string, context?: Record<string, unknown>): ApplicationError {
		return new ApplicationError(ApplicationErrorCodes.VALIDATION_FAILED, message, 400, context)
	}

	static conflict(message: string, context?: Record<string, unknown>): ApplicationError {
		return new ApplicationError(ApplicationErrorCodes.CONFLICT, message, 409, context)
	}

	static unauthorized(message = 'Unauthorized'): ApplicationError {
		return new ApplicationError(ApplicationErrorCodes.UNAUTHORIZED, message, 401)
	}

	static forbidden(message = 'Forbidden'): ApplicationError {
		return new ApplicationError(ApplicationErrorCodes.FORBIDDEN, message, 403)
	}

	static failed(message: string, context?: Record<string, unknown>): ApplicationError {
		return new ApplicationError(ApplicationErrorCodes.FAILED, message, 500, context)
	}
}

/**
 * Type guard to check if an error is an ApplicationError
 */
export function isApplicationError(error: unknown): error is ApplicationError {
	return error instanceof ApplicationError
}
