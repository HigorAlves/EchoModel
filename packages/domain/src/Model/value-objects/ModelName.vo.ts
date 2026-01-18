import { z } from 'zod'
import { ModelValidationError } from '../model.error'

/**
 * @fileoverview Model Name Value Object
 *
 * Represents the name of an AI influencer model.
 */
export class ModelName {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a ModelName
	 * @param data - The name string to validate and wrap
	 * @returns New ModelName instance
	 * @throws ModelValidationError if the name is invalid
	 */
	static create(data: string): ModelName {
		const schema = z
			.string()
			.transform((val) => val.trim())
			.pipe(z.string().min(2, 'Model name must be at least 2 characters').max(50, 'Model name cannot exceed 50 characters'))

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new ModelValidationError(errors, { field: 'modelName', value: data })
		}

		return new ModelName(result.data)
	}

	get value(): string {
		return this.data
	}

	equals(other: ModelName): boolean {
		return this.data.toLowerCase() === other.data.toLowerCase()
	}

	toString(): string {
		return this.data
	}

	toJSON(): string {
		return this.data
	}
}
