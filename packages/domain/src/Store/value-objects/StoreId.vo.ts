import { z } from 'zod'
import { StoreValidationError } from '../store.error'

/**
 * @fileoverview Store ID Value Object
 *
 * Represents a unique identifier for Store entities.
 * Encapsulates validation rules and ensures type safety for IDs.
 */
export class StoreId {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a StoreId
	 * @param data - The ID string to validate and wrap
	 * @returns New StoreId instance
	 * @throws StoreValidationError if the ID is invalid
	 */
	static create(data: string): StoreId {
		const schema = z
			.string()
			.min(1, 'ID cannot be empty')
			.max(255, 'ID cannot exceed 255 characters')
			.regex(/^[a-zA-Z0-9_-]+$/, 'ID can only contain alphanumeric characters, underscores, and hyphens')

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new StoreValidationError(errors, { field: 'storeId', value: data })
		}

		return new StoreId(data)
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
	 * @param other - Another StoreId to compare
	 * @returns True if IDs are equal
	 */
	equals(other: StoreId): boolean {
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
