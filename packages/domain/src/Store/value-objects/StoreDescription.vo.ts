import { z } from 'zod'
import { StoreValidationError } from '../store.error'

/**
 * @fileoverview Store Description Value Object
 *
 * Represents an optional description of a store.
 * Encapsulates validation rules for store descriptions.
 */
export class StoreDescription {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a StoreDescription
	 * @param data - The description string to validate and wrap
	 * @returns New StoreDescription instance
	 * @throws StoreValidationError if the description is invalid
	 */
	static create(data: string): StoreDescription {
		const schema = z
			.string()
			.transform((val) => val.trim())
			.pipe(z.string().max(1000, 'Store description cannot exceed 1000 characters'))

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new StoreValidationError(errors, { field: 'storeDescription', value: data })
		}

		return new StoreDescription(result.data)
	}

	/**
	 * Get the raw description value
	 * @returns The description string
	 */
	get value(): string {
		return this.data
	}

	/**
	 * Check if the description is empty
	 * @returns True if the description is empty
	 */
	get isEmpty(): boolean {
		return this.data.length === 0
	}

	/**
	 * Check if this description equals another description
	 * @param other - Another StoreDescription to compare
	 * @returns True if descriptions are equal
	 */
	equals(other: StoreDescription): boolean {
		return this.data === other.data
	}

	/**
	 * Convert to string representation
	 * @returns The description string
	 */
	toString(): string {
		return this.data
	}

	/**
	 * Convert to JSON representation
	 * @returns The description string for JSON serialization
	 */
	toJSON(): string {
		return this.data
	}
}
