/**
 * @fileoverview Store Response DTOs
 */

import type { AspectRatio, StoreStatus } from '@foundry/domain'

export interface StoreSettingsOutput {
	readonly defaultAspectRatio: AspectRatio
	readonly defaultImageCount: number
	readonly watermarkEnabled: boolean
}

export interface StoreOutput {
	readonly id: string
	readonly ownerId: string
	readonly name: string
	readonly description: string | null
	readonly defaultStyle: string | null
	readonly logoAssetId: string | null
	readonly status: StoreStatus
	readonly settings: StoreSettingsOutput
	readonly createdAt: Date
	readonly updatedAt: Date
}

export interface CreateStoreResponse {
	readonly storeId: string
}

export interface UpdateStoreResponse {
	readonly storeId: string
	readonly updated: boolean
}

export interface UpdateStoreSettingsResponse {
	readonly storeId: string
	readonly updated: boolean
}

export interface DeleteStoreResponse {
	readonly storeId: string
	readonly deleted: boolean
}
