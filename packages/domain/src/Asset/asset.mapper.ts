import { Asset } from './Asset.entity'
import type { PersistenceAsset } from './asset.repository'
import { AssetId, Filename, MimeType, StoragePath } from './value-objects'

/**
 * @fileoverview Asset Mapper
 *
 * Mappers are responsible for converting between domain entities and
 * persistence representations.
 */

/**
 * Maps persistence data to a domain entity
 */
export function toDomain(data: PersistenceAsset): Asset {
	return Asset.create({
		id: AssetId.create(data.id),
		storeId: data.storeId,
		type: data.type,
		category: data.category,
		filename: Filename.create(data.filename),
		mimeType: MimeType.create(data.mimeType),
		sizeBytes: data.sizeBytes,
		storagePath: StoragePath.create(data.storagePath),
		cdnUrl: data.cdnUrl,
		thumbnailUrl: data.thumbnailUrl,
		metadata: data.metadata,
		uploadedBy: data.uploadedBy,
		status: data.status,
		failureReason: data.failureReason,
		createdAt: data.createdAt,
		updatedAt: data.updatedAt,
		deletedAt: data.deletedAt,
	})
}

/**
 * Maps a domain entity to persistence format
 */
export function toPersistence(entity: Asset): PersistenceAsset {
	return {
		id: entity.id.value,
		storeId: entity.storeId,
		type: entity.type,
		category: entity.category,
		filename: entity.filename.value,
		mimeType: entity.mimeType.value,
		sizeBytes: entity.sizeBytes,
		storagePath: entity.storagePath.value,
		cdnUrl: entity.cdnUrl,
		thumbnailUrl: entity.thumbnailUrl,
		metadata: entity.metadata,
		uploadedBy: entity.uploadedBy,
		status: entity.status,
		failureReason: entity.failureReason,
		createdAt: entity.createdAt,
		updatedAt: entity.updatedAt,
		deletedAt: entity.deletedAt,
	}
}

/**
 * Asset Mapper namespace
 */
export const AssetMapper = {
	toDomain,
	toPersistence,
}
