'use client'

/**
 * @fileoverview Model Actions
 *
 * Client-side actions for model creation using Firestore directly
 */

import { createModel, type CreateModelInput } from '@/lib/firebase/firestore'

export interface ModelActionState {
	success: boolean
	error?: string
	fieldErrors?: Record<string, string[]>
	modelId?: string
}

export async function createModelAction(
	_prevState: ModelActionState | null,
	formData: FormData,
): Promise<ModelActionState> {
	// Extract JSON data from FormData
	const dataJson = formData.get('data') as string

	if (!dataJson) {
		return {
			success: false,
			error: 'No data provided',
		}
	}

	let parsedData: any
	try {
		parsedData = JSON.parse(dataJson)
	} catch {
		return {
			success: false,
			error: 'Invalid data format',
		}
	}

	// Validate required fields
	if (!parsedData.storeId) {
		return {
			success: false,
			error: 'Store ID is required',
		}
	}

	try {
		// Build model input
		const modelInput: CreateModelInput = {
			id: parsedData.id,
			storeId: parsedData.storeId,
			name: parsedData.name,
			gender: parsedData.gender,
			ageRange: parsedData.ageRange,
			ethnicity: parsedData.ethnicity,
			bodyType: parsedData.bodyType,
			lightingPreset: parsedData.lightingPreset,
			cameraFraming: parsedData.cameraFraming,
			backgroundType: parsedData.backgroundType,
			poseStyle: parsedData.poseStyle,
			expression: parsedData.expression,
			postProcessingStyle: parsedData.postProcessingStyle,
			supportOutfitSwapping: parsedData.supportOutfitSwapping,
		}

		// Only include optional fields if they exist
		if (parsedData.description) {
			modelInput.description = parsedData.description
		}
		if (parsedData.prompt) {
			modelInput.prompt = parsedData.prompt
		}
		if (parsedData.referenceImageIds) {
			modelInput.referenceImageIds = parsedData.referenceImageIds
		}
		if (parsedData.texturePreferences) {
			modelInput.texturePreferences = parsedData.texturePreferences
		}
		if (parsedData.productCategories) {
			modelInput.productCategories = parsedData.productCategories
		}

		// Create model directly in Firestore
		const result = await createModel(modelInput)

		return {
			success: true,
			modelId: result.modelId,
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create model',
		}
	}
}
