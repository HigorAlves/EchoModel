/**
 * @fileoverview Asset Output DTOs
 */

import type { AssetCategory, AssetStatus, AssetType } from '@foundry/domain'

export interface AssetMetadataOutput {
	readonly width?: number
	readonly height?: number
	readonly modelId?: string
	readonly generationId?: string
	readonly originalAssetId?: string
}

export interface AssetOutput {
	readonly id: string
	readonly storeId: string
	readonly type: AssetType
	readonly category: AssetCategory
	readonly filename: string
	readonly mimeType: string
	readonly sizeBytes: number
	readonly storagePath: string
	readonly cdnUrl: string | null
	readonly thumbnailUrl: string | null
	readonly metadata: AssetMetadataOutput
	readonly uploadedBy: string
	readonly status: AssetStatus
	readonly failureReason: string | null
	readonly createdAt: Date
	readonly updatedAt: Date
}
