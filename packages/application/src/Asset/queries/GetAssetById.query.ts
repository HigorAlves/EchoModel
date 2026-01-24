/**
 * @fileoverview Get Asset By ID Query Handler
 */

import type { IAssetRepository } from '@foundry/domain'
import type { AssetOutput, GetAssetByIdInput } from '@/Asset'
import { GetAssetByIdSchema } from '@/Asset'
import { toAssetResponse } from '../mappers'

export class GetAssetByIdQuery {
	constructor(private readonly assetRepository: IAssetRepository) {}

	async execute(input: GetAssetByIdInput): Promise<AssetOutput | null> {
		const { assetId } = GetAssetByIdSchema.parse(input)

		const asset = await this.assetRepository.findById(assetId)
		if (!asset || asset.isDeleted) {
			return null
		}

		return toAssetResponse(asset)
	}
}
