/**
 * @fileoverview Confirm Upload Command Handler
 */

import type { Asset, IAssetRepository, IStorageService } from '@foundry/domain'
import type { Context, IEventBus } from '@/shared'
import { ApplicationError } from '@/shared'
import type { ConfirmUploadInput, ConfirmUploadResponse } from '@/Asset'
import { ConfirmUploadSchema } from '@/Asset'

export class ConfirmUploadCommand {
	constructor(
		private readonly assetRepository: IAssetRepository,
		private readonly storageService: IStorageService,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: ConfirmUploadInput, ctx: Context): Promise<ConfirmUploadResponse> {
		const { assetId } = ConfirmUploadSchema.parse(input)

		const asset = await this.assetRepository.findById(assetId)
		if (!asset) {
			throw ApplicationError.notFound('Asset', assetId)
		}

		if (!asset.isPending) {
			throw ApplicationError.conflict('Asset is not in pending upload state')
		}

		// Verify the file exists in storage
		const exists = await this.storageService.fileExists(asset.storagePath.value)
		if (!exists) {
			throw ApplicationError.validation('File has not been uploaded yet')
		}

		// Confirm upload and mark as ready (skipping processing for MVP)
		const confirmedAsset = asset.confirmUpload()
		const readyAsset = confirmedAsset.markReady()

		await this.assetRepository.update(readyAsset)
		await this.publishEvents(readyAsset, ctx)

		return {
			assetId,
			status: readyAsset.status,
		}
	}

	private async publishEvents(asset: Asset, ctx: Context): Promise<void> {
		if (!this.eventBus) return

		for (const event of asset.domainEvents) {
			await this.eventBus.publish({
				eventType: event.eventType,
				aggregateType: event.aggregateType,
				aggregateId: event.aggregateId,
				payload: event.eventData as Record<string, unknown>,
				correlationId: ctx.correlationId,
				occurredAt: new Date(),
			})
		}
		asset.clearDomainEvents()
	}
}
