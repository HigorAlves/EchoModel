import { z } from 'zod'
import { AssetValidationError } from '../asset.error'

/**
 * @fileoverview MimeType Value Object
 *
 * Represents a MIME type for an asset.
 * Validates against allowed image types.
 */

/**
 * Allowed MIME types for image assets
 * Updated to include BMP, TIFF, GIF per BytePlus Seedream 4.5 API documentation
 * @see https://docs.byteplus.com/en/docs/ModelArk/1541523
 */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff', 'image/gif'] as const

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

export class MimeType {
	private constructor(private readonly data: AllowedMimeType) {}

	/**
	 * Factory method to create a MimeType
	 * @param data - The MIME type string to validate and wrap
	 * @returns New MimeType instance
	 * @throws AssetValidationError if the MIME type is invalid
	 */
	static create(data: string): MimeType {
		const schema = z.enum(ALLOWED_MIME_TYPES, {
			errorMap: () => ({
				message: `Invalid MIME type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
			}),
		})

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new AssetValidationError(errors, { field: 'mimeType', value: data })
		}

		return new MimeType(result.data)
	}

	/**
	 * Get all allowed MIME types
	 */
	static getAllowed(): readonly AllowedMimeType[] {
		return ALLOWED_MIME_TYPES
	}

	get value(): AllowedMimeType {
		return this.data
	}

	/**
	 * Get the file extension for this MIME type
	 */
	get extension(): string {
		switch (this.data) {
			case 'image/jpeg':
				return 'jpg'
			case 'image/png':
				return 'png'
			case 'image/webp':
				return 'webp'
			case 'image/bmp':
				return 'bmp'
			case 'image/tiff':
				return 'tiff'
			case 'image/gif':
				return 'gif'
			default:
				// This should never happen due to validation in create()
				throw new AssetValidationError(['Unknown MIME type'], { field: 'mimeType', value: this.data })
		}
	}

	equals(other: MimeType): boolean {
		return this.data === other.data
	}

	toString(): string {
		return this.data
	}

	toJSON(): string {
		return this.data
	}
}
