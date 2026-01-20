import { z } from 'zod'
import { ModelValidationError } from '../model.error'

/**
 * @fileoverview Model Texture Preferences Value Object
 *
 * Represents texture preferences for Seedream 4.5 Fashion generation.
 * Contains an array of texture keywords that describe desired surface qualities.
 * Examples: "matte", "glossy", "brushed cotton", "silk", "leather"
 */

/**
 * Maximum number of texture preferences allowed
 */
export const MAX_TEXTURE_PREFERENCES = 5

/**
 * Minimum length for each texture keyword
 */
export const MIN_TEXTURE_LENGTH = 2

/**
 * Maximum length for each texture keyword
 */
export const MAX_TEXTURE_LENGTH = 50

const texturePreferencesSchema = z
	.array(
		z
			.string()
			.transform((val) => val.trim().toLowerCase())
			.pipe(
				z
					.string()
					.min(MIN_TEXTURE_LENGTH, `Each texture must be at least ${MIN_TEXTURE_LENGTH} characters`)
					.max(MAX_TEXTURE_LENGTH, `Each texture cannot exceed ${MAX_TEXTURE_LENGTH} characters`),
			),
	)
	.max(MAX_TEXTURE_PREFERENCES, `Cannot have more than ${MAX_TEXTURE_PREFERENCES} texture preferences`)
	.transform((arr) => [...new Set(arr)]) // Remove duplicates

export class ModelTexturePreferences {
	private constructor(private readonly data: readonly string[]) {}

	/**
	 * Factory method to create ModelTexturePreferences
	 * @param data - Array of texture keywords to validate and wrap
	 * @returns New ModelTexturePreferences instance
	 * @throws ModelValidationError if the preferences are invalid
	 */
	static create(data: string[]): ModelTexturePreferences {
		const result = texturePreferencesSchema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new ModelValidationError(errors, { field: 'texturePreferences', value: data })
		}

		return new ModelTexturePreferences(Object.freeze(result.data))
	}

	/**
	 * Create empty texture preferences
	 */
	static createEmpty(): ModelTexturePreferences {
		return new ModelTexturePreferences(Object.freeze([]))
	}

	/**
	 * Create from a single texture keyword
	 */
	static fromSingle(texture: string): ModelTexturePreferences {
		return ModelTexturePreferences.create([texture])
	}

	get value(): readonly string[] {
		return this.data
	}

	get isEmpty(): boolean {
		return this.data.length === 0
	}

	get count(): number {
		return this.data.length
	}

	/**
	 * Check if a texture is included in preferences
	 */
	has(texture: string): boolean {
		return this.data.includes(texture.trim().toLowerCase())
	}

	/**
	 * Add a texture preference (returns new instance)
	 */
	add(texture: string): ModelTexturePreferences {
		if (this.data.length >= MAX_TEXTURE_PREFERENCES) {
			throw new ModelValidationError([`Cannot have more than ${MAX_TEXTURE_PREFERENCES} texture preferences`], {
				field: 'texturePreferences',
			})
		}
		return ModelTexturePreferences.create([...this.data, texture])
	}

	/**
	 * Remove a texture preference (returns new instance)
	 */
	remove(texture: string): ModelTexturePreferences {
		const normalized = texture.trim().toLowerCase()
		const filtered = this.data.filter((t) => t !== normalized)
		return new ModelTexturePreferences(Object.freeze(filtered))
	}

	/**
	 * Get texture preferences as a comma-separated string
	 * Useful for prompt engineering
	 */
	toPromptString(): string {
		return this.data.join(', ')
	}

	/**
	 * Get texture preferences formatted for display
	 */
	toDisplayString(): string {
		if (this.isEmpty) {
			return 'None'
		}
		return this.data.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')
	}

	equals(other: ModelTexturePreferences): boolean {
		if (this.data.length !== other.data.length) {
			return false
		}
		const sortedThis = [...this.data].sort()
		const sortedOther = [...other.data].sort()
		return sortedThis.every((t, i) => t === sortedOther[i])
	}

	toString(): string {
		return `[${this.data.join(', ')}]`
	}

	toJSON(): string[] {
		return [...this.data]
	}
}
