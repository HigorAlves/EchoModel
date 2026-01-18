/**
 * @fileoverview Model Response DTOs
 */

import type { AgeRange, BodyType, Ethnicity, Gender, ModelStatus } from '@foundry/domain'

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
