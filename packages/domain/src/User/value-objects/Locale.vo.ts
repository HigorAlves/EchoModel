import { z } from 'zod'
import { UserValidationError } from '../user.error'

/**
 * @fileoverview Locale Value Object
 *
 * Value Objects are immutable objects that represent a concept in the domain.
 * They are defined by their attributes rather than identity. Key characteristics:
 * - Immutable: Once created, they cannot be modified
 * - Equality: Two value objects are equal if all their attributes are equal
 * - No identity: They don't have a unique identifier
 * - Self-validating: They ensure they are always in a valid state
 */

/**
 * Supported locales based on BCP 47 language tags
 */
export const SUPPORTED_LOCALES = ['en', 'en-US', 'en-GB', 'pt', 'pt-BR', 'es', 'es-ES', 'fr', 'de', 'it'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

/**
 * Locale Value Object
 *
 * Represents a user's locale/language preference.
 * Validates against supported locales and ensures proper formatting.
 */
export class Locale {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a Locale
	 * @param data - The locale string to validate and wrap (e.g., 'en-US', 'pt-BR')
	 * @returns New Locale instance
	 * @throws UserValidationError if the locale is invalid
	 */
	static create(data: string): Locale {
		const schema = z
			.string()
			.min(2, 'Locale must be at least 2 characters')
			.max(10, 'Locale cannot exceed 10 characters')
			.trim()

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new UserValidationError(errors, { field: 'locale', value: data })
		}

		return new Locale(result.data)
	}

	/**
	 * Get the raw locale value
	 * @returns The locale string
	 */
	get value(): string {
		return this.data
	}

	/**
	 * Get the language code (first part before hyphen)
	 * @returns The language code (e.g., 'en' from 'en-US')
	 */
	get language(): string {
		return this.data.split('-')[0] || this.data
	}

	/**
	 * Get the region code (second part after hyphen)
	 * @returns The region code (e.g., 'US' from 'en-US') or null if not present
	 */
	get region(): string | null {
		const parts = this.data.split('-')
		return parts[1] || null
	}

	/**
	 * Check if this locale equals another locale
	 * @param other - Another Locale to compare
	 * @returns True if locales are equal
	 */
	equals(other: Locale): boolean {
		return this.data === other.data
	}

	/**
	 * Convert to string representation
	 * @returns The locale string
	 */
	toString(): string {
		return this.data
	}

	/**
	 * Convert to JSON representation
	 * @returns The locale string for JSON serialization
	 */
	toJSON(): string {
		return this.data
	}
}
