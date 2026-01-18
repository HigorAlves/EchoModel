import { z } from 'zod'
import { ModelValidationError } from '../model.error'

/**
 * @fileoverview Model ID Value Object
 *
 * Represents a unique identifier for Model (AI Influencer) entities.
 */
export class ModelId {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a ModelId
	 * @param data - The ID string to validate and wrap
	 * @returns New ModelId instance
	 * @throws ModelValidationError if the ID is invalid
	 */
	static create(data: string): ModelId {
		const schema = z
			.string()
			.min(1, 'ID cannot be empty')
			.max(255, 'ID cannot exceed 255 characters')
			.regex(/^[a-zA-Z0-9_-]+$/, 'ID can only contain alphanumeric characters, underscores, and hyphens')

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new ModelValidationError(errors, { field: 'modelId', value: data })
		}

		return new ModelId(data)
	}

	get value(): string {
		return this.data
	}

	equals(other: ModelId): boolean {
		return this.data === other.data
	}

	toString(): string {
		return this.data
	}

	toJSON(): string {
		return this.data
	}
}
