import { z } from 'zod'
import { GenerationValidationError } from '../generation.error'

/**
 * @fileoverview Scene Prompt Value Object
 *
 * Represents a text prompt describing the scene for image generation.
 * This guides the AI in creating the context/background for the generated images.
 */
export class ScenePrompt {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a ScenePrompt
	 */
	static create(data: string): ScenePrompt {
		const schema = z
			.string()
			.transform((val) => val.trim())
			.pipe(
				z
					.string()
					.min(5, 'Scene prompt must be at least 5 characters')
					.max(1000, 'Scene prompt cannot exceed 1000 characters'),
			)

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new GenerationValidationError(errors, { field: 'scenePrompt', value: data })
		}

		return new ScenePrompt(result.data)
	}

	get value(): string {
		return this.data
	}

	/**
	 * Get a truncated version of the prompt for display
	 */
	truncated(maxLength = 100): string {
		if (this.data.length <= maxLength) {
			return this.data
		}
		return `${this.data.substring(0, maxLength)}...`
	}

	equals(other: ScenePrompt): boolean {
		return this.data === other.data
	}

	toString(): string {
		return this.data
	}

	toJSON(): string {
		return this.data
	}
}
