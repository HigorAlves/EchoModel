/**
 * @fileoverview Generation Enumerations
 *
 * Enums for the Generation bounded context.
 */

/**
 * Generation Status Enumeration
 *
 * State machine:
 * pending → processing → completed
 *              ↓
 *           failed
 */
export enum GenerationStatus {
	/** Initial state, waiting to be processed */
	PENDING = 'PENDING',

	/** Currently being processed by AI service */
	PROCESSING = 'PROCESSING',

	/** Successfully completed */
	COMPLETED = 'COMPLETED',

	/** Processing failed */
	FAILED = 'FAILED',
}

/**
 * Utility functions for GenerationStatus enum
 */

/**
 * Get all possible status values
 */
export function getAllGenerationStatuses(): GenerationStatus[] {
	return Object.values(GenerationStatus)
}

/**
 * Check if a status is valid
 */
export function isValidGenerationStatus(status: string): status is GenerationStatus {
	return Object.values(GenerationStatus).includes(status as GenerationStatus)
}

/**
 * Get valid transitions from a status
 */
export function getValidGenerationTransitionsFrom(status: GenerationStatus): GenerationStatus[] {
	switch (status) {
		case GenerationStatus.PENDING:
			return [GenerationStatus.PROCESSING]
		case GenerationStatus.PROCESSING:
			return [GenerationStatus.COMPLETED, GenerationStatus.FAILED]
		case GenerationStatus.COMPLETED:
			return [] // Terminal state
		case GenerationStatus.FAILED:
			return [] // Terminal state
		default:
			return []
	}
}

/**
 * Check if a status transition is valid
 */
export function isValidGenerationTransition(fromStatus: GenerationStatus, toStatus: GenerationStatus): boolean {
	const validTransitions = getValidGenerationTransitionsFrom(fromStatus)
	return validTransitions.includes(toStatus)
}

/**
 * Get human-readable label for status
 */
export function getGenerationStatusLabel(status: GenerationStatus): string {
	switch (status) {
		case GenerationStatus.PENDING:
			return 'Pending'
		case GenerationStatus.PROCESSING:
			return 'Processing'
		case GenerationStatus.COMPLETED:
			return 'Completed'
		case GenerationStatus.FAILED:
			return 'Failed'
		default:
			return 'Unknown'
	}
}

/**
 * Check if a generation is in a terminal state
 */
export function isTerminalStatus(status: GenerationStatus): boolean {
	return status === GenerationStatus.COMPLETED || status === GenerationStatus.FAILED
}
