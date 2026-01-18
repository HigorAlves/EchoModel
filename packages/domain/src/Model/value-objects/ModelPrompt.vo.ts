import { z } from 'zod'
import { ModelValidationError } from '../model.error'

/**
 * @fileoverview Model Prompt Value Object
 *
 * Represents a text prompt used to generate or describe the AI influencer.
 * Used during model creation to guide the AI in generating the model's appearance.
 */
export class ModelPrompt {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a ModelPrompt
	 * @param data - The prompt string to validate and wrap
	 * @returns New ModelPrompt instance
	 * @throws ModelValidationError if the prompt is invalid
	 */
	static create(data: string): ModelPrompt {
		const schema = z
			.string()
			.transform((val) => val.trim())
			.pipe(
				z
					.string()
					.min(10, 'Model prompt must be at least 10 characters')
					.max(2000, 'Model prompt cannot exceed 2000 characters'),
			)

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new ModelValidationError(errors, { field: 'modelPrompt', value: data })
		}

		return new ModelPrompt(result.data)
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

	equals(other: ModelPrompt): boolean {
		return this.data === other.data
	}

	toString(): string {
		return this.data
	}

	toJSON(): string {
		return this.data
	}
}
