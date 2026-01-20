import { z } from 'zod'
import { AssetValidationError } from '../asset.error'

/**
 * @fileoverview StoragePath Value Object
 *
 * Represents a path to a file in Firebase Storage.
 * Format: /stores/{storeId}/{category}/{assetId}/{filename}
 */
export class StoragePath {
	private constructor(private readonly data: string) {}

	/**
	 * Factory method to create a StoragePath
	 * @param data - The storage path string to validate and wrap
	 * @returns New StoragePath instance
	 * @throws AssetValidationError if the path is invalid
	 */
	static create(data: string): StoragePath {
		const schema = z
			.string()
			.min(1, 'Storage path cannot be empty')
			.max(1024, 'Storage path cannot exceed 1024 characters')
			.regex(/^stores\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/, 'Invalid storage path format')

		const result = schema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new AssetValidationError(errors, { field: 'storagePath', value: data })
		}

		return new StoragePath(data)
	}

	/**
	 * Build a storage path from components
	 */
	static build(storeId: string, category: string, assetId: string, filename: string): StoragePath {
		const path = `stores/${storeId}/${category}/${assetId}/${filename}`
		return StoragePath.create(path)
	}

	get value(): string {
		return this.data
	}

	/**
	 * Extract the store ID from the path
	 */
	get storeId(): string {
		const parts = this.data.split('/')
		const storeId = parts[1]
		// Safe: create() validates path format stores/{storeId}/{category}/{assetId}/{filename}
		if (!storeId) {
			throw new AssetValidationError(['Invalid storage path: missing storeId'], {
				field: 'storagePath',
				value: this.data,
			})
		}
		return storeId
	}

	/**
	 * Extract the category from the path
	 */
	get category(): string {
		const parts = this.data.split('/')
		const category = parts[2]
		// Safe: create() validates path format
		if (!category) {
			throw new AssetValidationError(['Invalid storage path: missing category'], {
				field: 'storagePath',
				value: this.data,
			})
		}
		return category
	}

	/**
	 * Extract the asset ID from the path
	 */
	get assetId(): string {
		const parts = this.data.split('/')
		const assetId = parts[3]
		// Safe: create() validates path format
		if (!assetId) {
			throw new AssetValidationError(['Invalid storage path: missing assetId'], {
				field: 'storagePath',
				value: this.data,
			})
		}
		return assetId
	}

	/**
	 * Extract the filename from the path
	 */
	get filename(): string {
		const parts = this.data.split('/')
		const filename = parts[4]
		// Safe: create() validates path format
		if (!filename) {
			throw new AssetValidationError(['Invalid storage path: missing filename'], {
				field: 'storagePath',
				value: this.data,
			})
		}
		return filename
	}

	equals(other: StoragePath): boolean {
		return this.data === other.data
	}

	toString(): string {
		return this.data
	}

	toJSON(): string {
		return this.data
	}
}
