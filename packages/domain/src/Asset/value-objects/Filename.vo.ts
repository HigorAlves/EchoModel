import { z } from 'zod'
import { AssetValidationError } from '../asset.error'

/**
 * @fileoverview Filename Value Object
 *
 * Represents a filename for an asset.
 * Validates filename format and extracts extension.
 */
export class Filename {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a Filename
	 * @param data - The filename string to validate and wrap
	 * @returns New Filename instance
	 * @throws AssetValidationError if the filename is invalid
	 */
	static create(data: string): Filename {
		const schema = z
			.string()
			.min(1, 'Filename cannot be empty')
			.max(255, 'Filename cannot exceed 255 characters')
			.regex(/^[a-zA-Z0-9._-]+$/, 'Filename can only contain alphanumeric characters, dots, underscores, and hyphens')
			.regex(/\.[a-zA-Z0-9]+$/, 'Filename must have an extension')

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new AssetValidationError(errors, { field: 'filename', value: data })
		}

		return new Filename(data)
	}

	get value(): string {
		return this.data
	}

	/**
	 * Get the file extension (without the dot)
	 */
	get extension(): string {
		const parts = this.data.split('.')
		// Safe: create() validates filename has an extension
		return parts[parts.length - 1]!.toLowerCase()
	}

	/**
	 * Get the filename without extension
	 */
	get nameWithoutExtension(): string {
		const lastDotIndex = this.data.lastIndexOf('.')
		return lastDotIndex > 0 ? this.data.substring(0, lastDotIndex) : this.data
	}

	equals(other: Filename): boolean {
		return this.data === other.data
	}

	toString(): string {
		return this.data
	}

	toJSON(): string {
		return this.data
	}
}
