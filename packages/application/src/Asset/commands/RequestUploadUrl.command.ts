/**
 * @fileoverview Request Upload URL Command Handler
 */

import type { Asset, IAssetRepository, IStorageService } from '@foundry/domain'
import type { Context, IEventBus } from '@/shared'
import type { RequestUploadUrlInput, RequestUploadUrlResponse } from '@/Asset'
import { RequestUploadUrlSchema } from '@/Asset'

const UPLOAD_URL_EXPIRY_SECONDS = 15 * 60 // 15 minutes

export class RequestUploadUrlCommand {
	constructor(
		private readonly assetRepository: IAssetRepository,
		private readonly storageService: IStorageService,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: RequestUploadUrlInput, ctx: Context): Promise<RequestUploadUrlResponse> {
		const validated = RequestUploadUrlSchema.parse(input)

		const { Asset } = await import('@foundry/domain')
		const asset = Asset.requestUpload({
			storeId: validated.storeId,
			category: validated.category,
			filename: validated.filename,
			mimeType: validated.mimeType,
			sizeBytes: validated.sizeBytes,
			uploadedBy: ctx.userId!,
			metadata: validated.metadata,
		})

		await this.assetRepository.create(asset)

		const { uploadUrl, expiresAt } = await this.storageService.generateUploadUrl(
			asset.storagePath.value,
			asset.mimeType.value,
			UPLOAD_URL_EXPIRY_SECONDS,
		)

		await this.publishEvents(asset, ctx)

		return {
			assetId: asset.id.value,
			uploadUrl,
			expiresAt,
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
