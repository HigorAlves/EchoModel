'use client'

/**
 * @fileoverview Model Actions
 *
 * Client-side actions for model creation with useActionState
 */

import type { CreateModelInput } from '@/lib/firebase/functions'
import { createModel } from '@/lib/firebase/functions'

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
		// Map to CreateModelInput - only include fields that exist to avoid sending null
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

		// Only include optional fields if they exist in parsedData
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

		console.log('Sending to Firebase Function:', JSON.stringify(modelInput, null, 2))

		// Call Cloud Function
		const result = await createModel(modelInput)

		return {
			success: true,
			modelId: result.data.modelId,
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create model',
		}
	}
}
