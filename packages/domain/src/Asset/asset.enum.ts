/**
 * @fileoverview Asset Enumerations
 *
 * Enums for the Asset bounded context.
 */

/**
 * Asset Type Enumeration
 *
 * Represents the type of asset file.
 */
export enum AssetType {
	/** Image asset */
	IMAGE = 'IMAGE',
}

/**
 * Asset Category Enumeration
 *
 * Represents the purpose/category of an asset.
 */
export enum AssetCategory {
	/** Reference images for model creation */
	MODEL_REFERENCE = 'MODEL_REFERENCE',

	/** Garment/clothing images for generation */
	GARMENT = 'GARMENT',

	/** AI-generated images */
	GENERATED = 'GENERATED',

	/** Calibration images during model creation */
	CALIBRATION = 'CALIBRATION',

	/** Store logo */
	STORE_LOGO = 'STORE_LOGO',
}

/**
 * Asset Status Enumeration
 *
 * Represents the status of an asset in its lifecycle.
 */
export enum AssetStatus {
	/** Upload URL generated, waiting for upload */
	PENDING_UPLOAD = 'PENDING_UPLOAD',

	/** File uploaded, waiting for processing */
	UPLOADED = 'UPLOADED',

	/** File is being processed (resizing, thumbnail generation, etc.) */
	PROCESSING = 'PROCESSING',

	/** File is ready for use */
	READY = 'READY',

	/** Processing or upload failed */
	FAILED = 'FAILED',
}

/**
 * Utility functions for AssetStatus enum
 */

/**
 * Get all possible status values
 */
export function getAllAssetStatuses(): AssetStatus[] {
	return Object.values(AssetStatus)
}

/**
 * Check if a status is valid
 */
export function isValidAssetStatus(status: string): status is AssetStatus {
	return Object.values(AssetStatus).includes(status as AssetStatus)
}

/**
 * Get valid transitions from a status
 */
export function getValidAssetTransitionsFrom(status: AssetStatus): AssetStatus[] {
	switch (status) {
		case AssetStatus.PENDING_UPLOAD:
			return [AssetStatus.UPLOADED, AssetStatus.FAILED]
		case AssetStatus.UPLOADED:
			return [AssetStatus.PROCESSING, AssetStatus.READY, AssetStatus.FAILED]
		case AssetStatus.PROCESSING:
			return [AssetStatus.READY, AssetStatus.FAILED]
		case AssetStatus.READY:
			return []
		case AssetStatus.FAILED:
			return [AssetStatus.PENDING_UPLOAD] // Allow retry
		default:
			return []
	}
}

/**
 * Check if a status transition is valid
 */
export function isValidAssetTransition(fromStatus: AssetStatus, toStatus: AssetStatus): boolean {
	const validTransitions = getValidAssetTransitionsFrom(fromStatus)
	return validTransitions.includes(toStatus)
}

/**
 * Get human-readable label for status
 */
export function getAssetStatusLabel(status: AssetStatus): string {
	switch (status) {
		case AssetStatus.PENDING_UPLOAD:
			return 'Pending Upload'
		case AssetStatus.UPLOADED:
			return 'Uploaded'
		case AssetStatus.PROCESSING:
			return 'Processing'
		case AssetStatus.READY:
			return 'Ready'
		case AssetStatus.FAILED:
			return 'Failed'
		default:
			return 'Unknown'
	}
}

/**
 * Utility functions for AssetCategory enum
 */

/**
 * Get all possible category values
 */
export function getAllAssetCategories(): AssetCategory[] {
	return Object.values(AssetCategory)
}

/**
 * Check if a category is valid
 */
export function isValidAssetCategory(category: string): category is AssetCategory {
	return Object.values(AssetCategory).includes(category as AssetCategory)
}

/**
 * Get human-readable label for category
 */
export function getAssetCategoryLabel(category: AssetCategory): string {
	switch (category) {
		case AssetCategory.MODEL_REFERENCE:
			return 'Model Reference'
		case AssetCategory.GARMENT:
			return 'Garment'
		case AssetCategory.GENERATED:
			return 'Generated'
		case AssetCategory.CALIBRATION:
			return 'Calibration'
		case AssetCategory.STORE_LOGO:
			return 'Store Logo'
		default:
			return 'Unknown'
	}
}

/**
 * Get storage folder name for category
 */
export function getAssetCategoryFolder(category: AssetCategory): string {
	switch (category) {
		case AssetCategory.MODEL_REFERENCE:
			return 'model-references'
		case AssetCategory.GARMENT:
			return 'garments'
		case AssetCategory.GENERATED:
			return 'generated'
		case AssetCategory.CALIBRATION:
			return 'calibrations'
		case AssetCategory.STORE_LOGO:
			return 'logos'
		default:
			return 'misc'
	}
}
