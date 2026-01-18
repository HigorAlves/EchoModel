import { z } from 'zod'
import { UserValidationError } from '../user.error'

/**
 * @fileoverview Full Name Value Object
 *
 * Value Objects are immutable objects that represent a concept in the domain.
 * They are defined by their attributes rather than identity. Key characteristics:
 * - Immutable: Once created, they cannot be modified
 * - Equality: Two value objects are equal if all their attributes are equal
 * - No identity: They don't have a unique identifier
 * - Self-validating: They ensure they are always in a valid state
 */

/**
 * Full Name Value Object
 *
 * Represents a user's full name with validation.
 * Ensures the name meets minimum requirements and is properly formatted.
 */
export class FullName {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a FullName
	 * @param data - The full name string to validate and wrap
	 * @returns New FullName instance
	 * @throws UserValidationError if the name is invalid
	 */
	static create(data: string): FullName {
		const schema = z
			.string()
			.transform((val) => val.trim())
			.pipe(z.string().min(1, 'Full name cannot be empty').max(255, 'Full name cannot exceed 255 characters'))

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new UserValidationError(errors, { field: 'fullName', value: data })
		}

		return new FullName(result.data)
	}

	/**
	 * Get the raw full name value
	 * @returns The full name string (trimmed)
	 */
	get value(): string {
		return this.data
	}

	/**
	 * Check if this full name equals another full name
	 * @param other - Another FullName to compare
	 * @returns True if names are equal
	 */
	equals(other: FullName): boolean {
		return this.data === other.data
	}

	/**
	 * Convert to string representation
	 * @returns The full name string
	 */
	toString(): string {
		return this.data
	}

	/**
	 * Convert to JSON representation
	 * @returns The full name string for JSON serialization
	 */
	toJSON(): string {
		return this.data
	}
}
