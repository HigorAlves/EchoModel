/**
 * @fileoverview Get Download URL Query Handler
 */

import type { IAssetRepository, IStorageService } from '@foundry/domain'
import { ApplicationError } from '@/shared'
import type { GetAssetByIdInput, GetDownloadUrlResponse } from '@/Asset'
import { GetAssetByIdSchema } from '@/Asset'

const DOWNLOAD_URL_EXPIRY_SECONDS = 60 * 60 // 1 hour

export class GetDownloadUrlQuery {
	constructor(
		private readonly assetRepository: IAssetRepository,
		private readonly storageService: IStorageService,
	) {}

	async execute(input: GetAssetByIdInput): Promise<GetDownloadUrlResponse> {
		const { assetId } = GetAssetByIdSchema.parse(input)

		const asset = await this.assetRepository.findById(assetId)
		if (!asset || asset.isDeleted) {
			throw ApplicationError.notFound('Asset', assetId)
		}

		if (!asset.isReady) {
			throw ApplicationError.conflict('Asset is not ready for download')
		}

		const downloadUrl = await this.storageService.generateDownloadUrl(
			asset.storagePath.value,
			DOWNLOAD_URL_EXPIRY_SECONDS,
		)

		return {
			downloadUrl,
			expiresAt: new Date(Date.now() + DOWNLOAD_URL_EXPIRY_SECONDS * 1000),
		}
	}
}
