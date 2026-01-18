import { z } from 'zod'
import { StoreValidationError } from '../store.error'

/**
 * @fileoverview Default Style Value Object
 *
 * Represents the default styling preferences for a store's generated images.
 * This could include prompts for scene styling, lighting, etc.
 */
export class DefaultStyle {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a DefaultStyle
	 * @param data - The style string to validate and wrap
	 * @returns New DefaultStyle instance
	 * @throws StoreValidationError if the style is invalid
	 */
	static create(data: string): DefaultStyle {
		const schema = z
			.string()
			.transform((val) => val.trim())
			.pipe(z.string().max(500, 'Default style cannot exceed 500 characters'))

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new StoreValidationError(errors, { field: 'defaultStyle', value: data })
		}

		return new DefaultStyle(result.data)
	}

	/**
	 * Get the raw style value
	 * @returns The style string
	 */
	get value(): string {
		return this.data
	}

	/**
	 * Check if the style is empty
	 * @returns True if the style is empty
	 */
	get isEmpty(): boolean {
		return this.data.length === 0
	}

	/**
	 * Check if this style equals another style
	 * @param other - Another DefaultStyle to compare
	 * @returns True if styles are equal
	 */
	equals(other: DefaultStyle): boolean {
		return this.data === other.data
	}

	/**
	 * Convert to string representation
	 * @returns The style string
	 */
	toString(): string {
		return this.data
	}

	/**
	 * Convert to JSON representation
	 * @returns The style string for JSON serialization
	 */
	toJSON(): string {
		return this.data
	}
}
