import { z } from 'zod'
import { ModelValidationError } from '../model.error'

/**
 * @fileoverview Model Description Value Object
 *
 * Represents an optional description of an AI influencer model.
 */
export class ModelDescription {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a ModelDescription
	 * @param data - The description string to validate and wrap
	 * @returns New ModelDescription instance
	 * @throws ModelValidationError if the description is invalid
	 */
	static create(data: string): ModelDescription {
		const schema = z
			.string()
			.transform((val) => val.trim())
			.pipe(z.string().max(500, 'Model description cannot exceed 500 characters'))

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new ModelValidationError(errors, { field: 'modelDescription', value: data })
		}

		return new ModelDescription(result.data)
	}

	get value(): string {
		return this.data
	}

	get isEmpty(): boolean {
		return this.data.length === 0
	}

	equals(other: ModelDescription): boolean {
		return this.data === other.data
	}

	toString(): string {
		return this.data
	}

	toJSON(): string {
		return this.data
	}
}
