import { z } from 'zod'
import { UserValidationError } from '../user.error'

/**
 * @fileoverview User ID Value Object
 *
 * Value Objects are immutable objects that represent a concept in the domain.
 * They are defined by their attributes rather than identity. Key characteristics:
 * - Immutable: Once created, they cannot be modified
 * - Equality: Two value objects are equal if all their attributes are equal
 * - No identity: They don't have a unique identifier
 * - Self-validating: They ensure they are always in a valid state
 *
 * Value Objects should:
 * - Encapsulate validation logic
 * - Be side-effect free
 * - Express domain concepts clearly
 * - Replace primitive obsession with meaningful types
 */

/**
 * User ID Value Object
 *
 * Represents a unique identifier for User entities.
 * Encapsulates validation rules and ensures type safety for IDs.
 */
export class UserId {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a UserId
	 * @param data - The ID string to validate and wrap
	 * @returns New UserId instance
	 * @throws Error if the ID is invalid
	 */
	static create(data: string): UserId {
		const schema = z
			.string()
			.min(1, 'ID cannot be empty')
			.max(255, 'ID cannot exceed 255 characters')
			.regex(/^[a-zA-Z0-9_-]+$/, 'ID can only contain alphanumeric characters, underscores, and hyphens')

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new UserValidationError(errors, { field: 'userId', value: data })
		}

		return new UserId(data)
	}

	/**
	 * Get the raw ID value
	 * @returns The ID string
	 */
	get value(): string {
		return this.data
	}

	/**
	 * Check if this ID equals another ID
	 * @param other - Another UserId to compare
	 * @returns True if IDs are equal
	 */
	equals(other: UserId): boolean {
		return this.data === other.data
	}

	/**
	 * Convert to string representation
	 * @returns The ID string
	 */
	toString(): string {
		return this.data
	}

	/**
	 * Convert to JSON representation
	 * @returns The ID string for JSON serialization
	 */
	toJSON(): string {
		return this.data
	}
}
