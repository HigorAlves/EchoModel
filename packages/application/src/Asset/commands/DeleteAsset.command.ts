/**
 * @fileoverview Delete Asset Command Handler
 */

import type { IAssetRepository, IStorageService } from '@foundry/domain'
import type { DeleteAssetInput, DeleteAssetResponse } from '@/Asset'
import { DeleteAssetSchema } from '@/Asset'
import type { Context } from '@/shared'
import { ApplicationError } from '@/shared'

export class DeleteAssetCommand {
	constructor(
		private readonly assetRepository: IAssetRepository,
		private readonly storageService: IStorageService,
	) {}

	async execute(input: DeleteAssetInput, _ctx: Context): Promise<DeleteAssetResponse> {
		const { assetId } = DeleteAssetSchema.parse(input)

		const asset = await this.assetRepository.findById(assetId)
		if (!asset) {
			throw ApplicationError.notFound('Asset', assetId)
		}

		if (asset.isDeleted) {
			throw ApplicationError.conflict('Asset is already deleted')
		}

		// Delete from storage
		try {
			await this.storageService.deleteFile(asset.storagePath.value)
		} catch (_error) {
			// Log but don't fail if storage deletion fails
		}

		// Soft delete the asset
		const deletedAsset = asset.delete()
		await this.assetRepository.update(deletedAsset)

		return { assetId, deleted: true }
	}
}
