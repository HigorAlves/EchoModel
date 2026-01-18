/**
 * @fileoverview User Status Enumeration
 *
 * Enums in the domain layer represent a set of named constants that have business meaning.
 * They should:
 * - Use business language that stakeholders understand
 * - Be immutable and well-defined
 * - Include all valid states for the concept
 * - Use string values for better serialization and debugging
 *
 * Domain enums help:
 * - Prevent invalid state assignments
 * - Make code more readable and self-documenting
 * - Centralize valid values for business concepts
 * - Enable type checking at compile time
 *
 * Note: This enum is synced with the database schema (infra/database)
 */

/**
 * User Status Enumeration
 *
 * Represents the valid states that a user can be in throughout its lifecycle.
 * Each status has specific business rules and allowed transitions.
 */
export enum UserStatus {
	/** User is active and can use the system */
	ACTIVE = 'ACTIVE',

	/** User is inactive but can be reactivated */
	INACTIVE = 'INACTIVE',

	/** User account has been suspended */
	SUSPENDED = 'SUSPENDED',
}

/**
 * Utility functions for UserStatus enum
 */

/**
 * Get all possible status values
 * @returns Array of all status values
 */
export function getAllStatuses(): UserStatus[] {
	return Object.values(UserStatus)
}

/**
 * Check if a status is valid
 * @param status - Status to validate
 * @returns True if status is valid
 */
export function isValidStatus(status: string): status is UserStatus {
	return Object.values(UserStatus).includes(status as UserStatus)
}

/**
 * Get statuses that can transition to the given status
 * @param targetStatus - The target status
 * @returns Array of statuses that can transition to target
 */
export function getValidTransitionsTo(targetStatus: UserStatus): UserStatus[] {
	// Define business rules for status transitions
	switch (targetStatus) {
		case UserStatus.ACTIVE:
			return [UserStatus.INACTIVE, UserStatus.SUSPENDED]
		case UserStatus.INACTIVE:
			return [UserStatus.ACTIVE]
		case UserStatus.SUSPENDED:
			return [UserStatus.ACTIVE]
		default:
			return []
	}
}

/**
 * Check if a status transition is valid
 * @param fromStatus - Current status
 * @param toStatus - Desired status
 * @returns True if transition is allowed
 */
export function isValidTransition(fromStatus: UserStatus, toStatus: UserStatus): boolean {
	const validTransitions = getValidTransitionsTo(toStatus)
	return validTransitions.includes(fromStatus)
}

/**
 * Get human-readable label for status
 * @param status - Status to get label for
 * @returns Human-readable label
 */
export function getStatusLabel(status: UserStatus): string {
	switch (status) {
		case UserStatus.ACTIVE:
			return 'Active'
		case UserStatus.INACTIVE:
			return 'Inactive'
		case UserStatus.SUSPENDED:
			return 'Suspended'
		default:
			return 'Unknown'
	}
}
