import { z } from 'zod'
import { GenerationValidationError } from '../generation.error'

/**
 * @fileoverview Idempotency Key Value Object
 *
 * Represents a unique key for ensuring idempotent generation requests.
 * Used to prevent duplicate generation processing.
 */
export class IdempotencyKey {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create an IdempotencyKey
	 */
	static create(data: string): IdempotencyKey {
		const schema = z
			.string()
			.min(1, 'Idempotency key cannot be empty')
			.max(255, 'Idempotency key cannot exceed 255 characters')
			.regex(/^[a-zA-Z0-9_-]+$/, 'Idempotency key can only contain alphanumeric characters, underscores, and hyphens')

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new GenerationValidationError(errors, { field: 'idempotencyKey', value: data })
		}

		return new IdempotencyKey(data)
	}

	/**
	 * Generate a new random idempotency key
	 */
	static generate(): IdempotencyKey {
		return new IdempotencyKey(crypto.randomUUID())
	}

	get value(): string {
		return this.data
	}

	equals(other: IdempotencyKey): boolean {
		return this.data === other.data
	}

	toString(): string {
		return this.data
	}

	toJSON(): string {
		return this.data
	}
}
