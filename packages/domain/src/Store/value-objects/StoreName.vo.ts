import { z } from 'zod'
import { StoreValidationError } from '../store.error'

/**
 * @fileoverview Store Name Value Object
 *
 * Represents the name of a store.
 * Encapsulates validation rules for store names.
 */
export class StoreName {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a StoreName
	 * @param data - The name string to validate and wrap
	 * @returns New StoreName instance
	 * @throws StoreValidationError if the name is invalid
	 */
	static create(data: string): StoreName {
		const schema = z
			.string()
			.transform((val) => val.trim())
			.pipe(
				z
					.string()
					.min(2, 'Store name must be at least 2 characters')
					.max(100, 'Store name cannot exceed 100 characters'),
			)

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new StoreValidationError(errors, { field: 'storeName', value: data })
		}

		return new StoreName(result.data)
	}

	/**
	 * Get the raw name value
	 * @returns The name string
	 */
	get value(): string {
		return this.data
	}

	/**
	 * Check if this name equals another name
	 * @param other - Another StoreName to compare
	 * @returns True if names are equal (case-insensitive)
	 */
	equals(other: StoreName): boolean {
		return this.data.toLowerCase() === other.data.toLowerCase()
	}

	/**
	 * Convert to string representation
	 * @returns The name string
	 */
	toString(): string {
		return this.data
	}

	/**
	 * Convert to JSON representation
	 * @returns The name string for JSON serialization
	 */
	toJSON(): string {
		return this.data
	}
}
