import type { Asset } from './Asset.entity'
import type { AssetCategory, AssetStatus, AssetType } from './asset.enum'
import type { AllowedMimeType } from './value-objects/MimeType.vo'

/**
 * @fileoverview Asset Repository Interface
 *
 * Repositories provide a collection-like interface for accessing domain objects.
 */

/**
 * Asset Metadata interface
 */
export interface AssetMetadata {
	readonly width?: number
	readonly height?: number
	readonly modelId?: string
	readonly generationId?: string
	readonly originalAssetId?: string
}

/**
 * Persistence representation of Asset
 */
export interface PersistenceAsset {
	readonly id: string
	readonly storeId: string
	readonly type: AssetType
	readonly category: AssetCategory
	readonly filename: string
	readonly mimeType: AllowedMimeType
	readonly sizeBytes: number
	readonly storagePath: string
	readonly cdnUrl: string | null
	readonly thumbnailUrl: string | null
	readonly metadata: AssetMetadata
	readonly uploadedBy: string
	readonly status: AssetStatus
	readonly failureReason: string | null
	readonly createdAt: Date
	readonly updatedAt: Date
	readonly deletedAt: Date | null
}

/**
 * Query filters for Asset searches
 */
export interface AssetQueryFilters {
	readonly storeId?: string
	readonly category?: AssetCategory
	readonly type?: AssetType
	readonly status?: AssetStatus
	readonly uploadedBy?: string
	readonly modelId?: string
	readonly generationId?: string
	readonly includeDeleted?: boolean
	readonly limit?: number
	readonly offset?: number
	readonly sortBy?: string
	readonly sortOrder?: 'asc' | 'desc'
}

/**
 * Asset Repository Interface
 */
export interface IAssetRepository {
	/**
	 * Creates a new asset and returns the generated ID
	 */
	create(asset: Asset): Promise<string>

	/**
	 * Saves an asset with a specific ID
	 */
	save(id: string, asset: Asset): Promise<void>

	/**
	 * Updates an existing asset
	 */
	update(asset: Asset): Promise<void>

	/**
	 * Removes an asset by its ID
	 */
	remove(id: string): Promise<void>

	/**
	 * Finds an asset by its ID
	 */
	findById(id: string): Promise<Asset | null>

	/**
	 * Finds all assets that match the given criteria
	 */
	findMany(filters?: AssetQueryFilters): Promise<Asset[]>

	/**
	 * Finds a single asset that matches the given criteria
	 */
	findOne(filters: AssetQueryFilters): Promise<Asset | null>

	/**
	 * Counts the number of assets that match the given criteria
	 */
	count(filters?: AssetQueryFilters): Promise<number>

	/**
	 * Checks if an asset exists with the given ID
	 */
	exists(id: string): Promise<boolean>

	/**
	 * Finds assets by store ID
	 */
	findByStoreId(storeId: string, filters?: Omit<AssetQueryFilters, 'storeId'>): Promise<Asset[]>

	/**
	 * Finds assets by category
	 */
	findByCategory(storeId: string, category: AssetCategory): Promise<Asset[]>

	/**
	 * Finds assets by model ID
	 */
	findByModelId(modelId: string): Promise<Asset[]>

	/**
	 * Finds assets by generation ID
	 */
	findByGenerationId(generationId: string): Promise<Asset[]>
}
