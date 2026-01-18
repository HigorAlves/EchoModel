import { z } from 'zod'
import { GenerationValidationError } from '../generation.error'

/**
 * @fileoverview Generation ID Value Object
 *
 * Represents a unique identifier for Generation entities.
 */
export class GenerationId {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a GenerationId
	 */
	static create(data: string): GenerationId {
		const schema = z
			.string()
			.min(1, 'ID cannot be empty')
			.max(255, 'ID cannot exceed 255 characters')
			.regex(/^[a-zA-Z0-9_-]+$/, 'ID can only contain alphanumeric characters, underscores, and hyphens')

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new GenerationValidationError(errors, { field: 'generationId', value: data })
		}

		return new GenerationId(data)
	}

	get value(): string {
		return this.data
	}

	equals(other: GenerationId): boolean {
		return this.data === other.data
	}

	toString(): string {
		return this.data
	}

	toJSON(): string {
		return this.data
	}
}
