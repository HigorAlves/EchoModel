import { z } from 'zod'
import { UserValidationError } from '../user.error'

/**
 * @fileoverview External ID Value Object
 *
 * Represents an external identity provider's user ID (e.g., Okta sub claim).
 * Used for linking users authenticated via external identity providers
 * to internal user records.
 */

/**
 * External ID Value Object
 *
 * Represents a unique identifier from an external identity provider (e.g., Okta).
 * Encapsulates validation rules and ensures type safety for external IDs.
 */
export class ExternalId {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create an ExternalId
	 * @param data - The external ID string to validate and wrap
	 * @returns New ExternalId instance
	 * @throws UserValidationError if the ID is invalid
	 */
	static create(data: string): ExternalId {
		const schema = z.string().min(1, 'External ID cannot be empty').max(255, 'External ID cannot exceed 255 characters')

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new UserValidationError(errors, { field: 'externalId', value: data })
		}

		return new ExternalId(data)
	}

	/**
	 * Get the raw external ID value
	 * @returns The external ID string
	 */
	get value(): string {
		return this.data
	}

	/**
	 * Check if this external ID equals another
	 * @param other - Another ExternalId to compare
	 * @returns True if IDs are equal
	 */
	equals(other: ExternalId): boolean {
		return this.data === other.data
	}

	/**
	 * Convert to string representation
	 * @returns The external ID string
	 */
	toString(): string {
		return this.data
	}

	/**
	 * Convert to JSON representation
	 * @returns The external ID string for JSON serialization
	 */
	toJSON(): string {
		return this.data
	}
}
