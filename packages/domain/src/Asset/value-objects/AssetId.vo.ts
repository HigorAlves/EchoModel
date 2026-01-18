import { z } from 'zod'
import { AssetValidationError } from '../asset.error'

/**
 * @fileoverview Asset ID Value Object
 *
 * Represents a unique identifier for Asset entities.
 */
export class AssetId {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create an AssetId
	 * @param data - The ID string to validate and wrap
	 * @returns New AssetId instance
	 * @throws AssetValidationError if the ID is invalid
	 */
	static create(data: string): AssetId {
		const schema = z
			.string()
			.min(1, 'ID cannot be empty')
			.max(255, 'ID cannot exceed 255 characters')
			.regex(/^[a-zA-Z0-9_-]+$/, 'ID can only contain alphanumeric characters, underscores, and hyphens')

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new AssetValidationError(errors, { field: 'assetId', value: data })
		}

		return new AssetId(data)
	}

	get value(): string {
		return this.data
	}

	equals(other: AssetId): boolean {
		return this.data === other.data
	}

	toString(): string {
		return this.data
	}

	toJSON(): string {
		return this.data
	}
}
