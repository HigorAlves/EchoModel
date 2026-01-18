/**
 * @fileoverview Store Enumerations
 *
 * Enums in the domain layer represent a set of named constants that have business meaning.
 */

/**
 * Store Status Enumeration
 *
 * Represents the valid states that a store can be in throughout its lifecycle.
 */
export enum StoreStatus {
	/** Store is active and operational */
	ACTIVE = 'ACTIVE',

	/** Store has been suspended (e.g., payment issues, policy violations) */
	SUSPENDED = 'SUSPENDED',

	/** Store is inactive (owner deactivated) */
	INACTIVE = 'INACTIVE',
}

/**
 * Aspect Ratio Enumeration
 *
 * Supported aspect ratios for generated images.
 */
export enum AspectRatio {
	/** Instagram feed (4:5 portrait) */
	PORTRAIT_4_5 = '4:5',

	/** Instagram/TikTok stories (9:16 portrait) */
	PORTRAIT_9_16 = '9:16',

	/** Square format (1:1) */
	SQUARE_1_1 = '1:1',

	/** Landscape (16:9) */
	LANDSCAPE_16_9 = '16:9',
}

/**
 * Utility functions for StoreStatus enum
 */

/**
 * Get all possible status values
 * @returns Array of all status values
 */
export function getAllStoreStatuses(): StoreStatus[] {
	return Object.values(StoreStatus)
}

/**
 * Check if a status is valid
 * @param status - Status to validate
 * @returns True if status is valid
 */
export function isValidStoreStatus(status: string): status is StoreStatus {
	return Object.values(StoreStatus).includes(status as StoreStatus)
}

/**
 * Get statuses that can transition to the given status
 * @param targetStatus - The target status
 * @returns Array of statuses that can transition to target
 */
export function getValidStoreTransitionsTo(targetStatus: StoreStatus): StoreStatus[] {
	switch (targetStatus) {
		case StoreStatus.ACTIVE:
			return [StoreStatus.INACTIVE, StoreStatus.SUSPENDED]
		case StoreStatus.INACTIVE:
			return [StoreStatus.ACTIVE]
		case StoreStatus.SUSPENDED:
			return [StoreStatus.ACTIVE]
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
export function isValidStoreTransition(fromStatus: StoreStatus, toStatus: StoreStatus): boolean {
	const validTransitions = getValidStoreTransitionsTo(toStatus)
	return validTransitions.includes(fromStatus)
}

/**
 * Get human-readable label for status
 * @param status - Status to get label for
 * @returns Human-readable label
 */
export function getStoreStatusLabel(status: StoreStatus): string {
	switch (status) {
		case StoreStatus.ACTIVE:
			return 'Active'
		case StoreStatus.INACTIVE:
			return 'Inactive'
		case StoreStatus.SUSPENDED:
			return 'Suspended'
		default:
			return 'Unknown'
	}
}

/**
 * Utility functions for AspectRatio enum
 */

/**
 * Get all possible aspect ratio values
 * @returns Array of all aspect ratio values
 */
export function getAllAspectRatios(): AspectRatio[] {
	return Object.values(AspectRatio)
}

/**
 * Check if an aspect ratio is valid
 * @param ratio - Aspect ratio to validate
 * @returns True if aspect ratio is valid
 */
export function isValidAspectRatio(ratio: string): ratio is AspectRatio {
	return Object.values(AspectRatio).includes(ratio as AspectRatio)
}

/**
 * Get human-readable label for aspect ratio
 * @param ratio - Aspect ratio to get label for
 * @returns Human-readable label
 */
export function getAspectRatioLabel(ratio: AspectRatio): string {
	switch (ratio) {
		case AspectRatio.PORTRAIT_4_5:
			return 'Portrait 4:5 (Instagram Feed)'
		case AspectRatio.PORTRAIT_9_16:
			return 'Portrait 9:16 (Stories/TikTok)'
		case AspectRatio.SQUARE_1_1:
			return 'Square 1:1'
		case AspectRatio.LANDSCAPE_16_9:
			return 'Landscape 16:9'
		default:
			return 'Unknown'
	}
}
