/**
 * @fileoverview Application Context
 *
 * Context passed to commands and queries containing request metadata.
 */

/**
 * Application context containing request metadata
 */
export interface Context {
	/** Correlation ID for request tracing */
	readonly correlationId: string
	/** User ID (Firebase Auth UID) if authenticated */
	readonly userId?: string
	/** Tenant/Store ID if applicable */
	readonly tenantId?: string
	/** User permissions if applicable */
	readonly permissions?: readonly string[]
}

/**
 * Create a context with default values
 */
export function createContext(partial: Partial<Context> & { correlationId: string }): Context {
	return {
		correlationId: partial.correlationId,
		userId: partial.userId,
		tenantId: partial.tenantId,
		permissions: partial.permissions,
	}
}
