/**
 * @fileoverview Model Response DTOs
 */

import type {
	AgeRange,
	BodyType,
	CameraFraming,
	Ethnicity,
	Gender,
	LightingPreset,
	ModelStatus,
	ProductCategory,
} from '@foundry/domain'

/**
 * Lighting configuration output
 */
export interface LightingConfigOutput {
	readonly preset: LightingPreset
	readonly customSettings?: {
		readonly intensity: number
		readonly warmth: number
		readonly contrast: number
	}
}

/**
 * Camera configuration output
 */
export interface CameraConfigOutput {
	readonly framing: CameraFraming
	readonly customSettings?: {
		readonly focalLength: number
		readonly cropRatio: string
		readonly angle: string
	}
}

export interface ModelOutput {
	readonly id: string
	readonly storeId: string
	readonly name: string
	readonly description: string | null
	readonly status: ModelStatus
	readonly gender: Gender
	readonly ageRange: AgeRange
	readonly ethnicity: Ethnicity
	readonly bodyType: BodyType
	readonly prompt: string | null
	readonly referenceImages: string[]
	readonly calibrationImages: string[]
	readonly lockedIdentityUrl: string | null
	readonly failureReason: string | null
	// Seedream 4.5 Fashion configuration
	readonly lightingConfig: LightingConfigOutput
	readonly cameraConfig: CameraConfigOutput
	readonly texturePreferences: string[]
	readonly productCategories: ProductCategory[]
	readonly supportOutfitSwapping: boolean
	readonly createdAt: Date
	readonly updatedAt: Date
}

export interface CreateModelResponse {
	readonly modelId: string
}

export interface UpdateModelResponse {
	readonly modelId: string
	readonly updated: boolean
}

export interface StartCalibrationResponse {
	readonly modelId: string
	readonly status: ModelStatus
}

export interface ApproveCalibrationResponse {
	readonly modelId: string
	readonly status: ModelStatus
}

export interface RejectCalibrationResponse {
	readonly modelId: string
	readonly status: ModelStatus
}

export interface ArchiveModelResponse {
	readonly modelId: string
	readonly archived: boolean
}

export interface CalibrationStatusOutput {
	readonly modelId: string
	readonly status: ModelStatus
	readonly calibrationImages: string[]
	readonly failureReason: string | null
}
