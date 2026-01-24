/**
 * @fileoverview Asset Mapper
 *
 * Maps domain Asset entities to output DTOs.
 */

import type { Asset } from '@foundry/domain'
import type { AssetOutput } from '@/Asset'

export function toAssetResponse(asset: Asset): AssetOutput {
	return {
		id: asset.id.value,
		storeId: asset.storeId,
		type: asset.type,
		category: asset.category,
		filename: asset.filename.value,
		mimeType: asset.mimeType.value,
		sizeBytes: asset.sizeBytes,
		storagePath: asset.storagePath.value,
		cdnUrl: asset.cdnUrl,
		thumbnailUrl: asset.thumbnailUrl,
		metadata: { ...asset.metadata },
		uploadedBy: asset.uploadedBy,
		status: asset.status,
		failureReason: asset.failureReason,
		createdAt: asset.createdAt,
		updatedAt: asset.updatedAt,
	}
}

export function toAssetResponseList(assets: Asset[]): AssetOutput[] {
	return assets.map((asset) => toAssetResponse(asset))
}
