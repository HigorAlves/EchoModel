/**
 * @fileoverview Asset Response DTOs
 */

import type { AssetCategory, AssetStatus, AssetType } from '@foundry/domain'
import type { AllowedMimeType } from '@foundry/domain'

export interface AssetMetadataOutput {
	readonly width?: number
	readonly height?: number
	readonly modelId?: string
	readonly generationId?: string
}

export interface AssetOutput {
	readonly id: string
	readonly storeId: string
	readonly type: AssetType
	readonly category: AssetCategory
	readonly filename: string
	readonly mimeType: string
	readonly sizeBytes: number
	readonly cdnUrl: string | null
	readonly thumbnailUrl: string | null
	readonly metadata: AssetMetadataOutput
	readonly status: AssetStatus
	readonly createdAt: Date
	readonly updatedAt: Date
}

export interface RequestUploadUrlResponse {
	readonly assetId: string
	readonly uploadUrl: string
	readonly expiresAt: Date
}

export interface ConfirmUploadResponse {
	readonly assetId: string
	readonly status: AssetStatus
}

export interface GetDownloadUrlResponse {
	readonly downloadUrl: string
	readonly expiresAt: Date
}

export interface DeleteAssetResponse {
	readonly assetId: string
	readonly deleted: boolean
}
