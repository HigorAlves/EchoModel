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

	if (!parsedData.referenceImageIds) {
		return {
			success: false,
			error: 'Reference images must be uploaded first',
		}
	}

	try {
		// Map to CreateModelInput
		const modelInput: CreateModelInput = {
			storeId: parsedData.storeId,
			name: parsedData.name,
			description: parsedData.description,
			gender: parsedData.gender,
			ageRange: parsedData.ageRange,
			ethnicity: parsedData.ethnicity,
			bodyType: parsedData.bodyType,
			prompt: parsedData.prompt,
			referenceImageIds: parsedData.referenceImageIds,

			// Fashion config
			lightingPreset: parsedData.lightingPreset,
			cameraFraming: parsedData.cameraFraming,
			backgroundType: parsedData.backgroundType,
			poseStyle: parsedData.poseStyle,
			expression: parsedData.expression,
			postProcessingStyle: parsedData.postProcessingStyle,
			texturePreferences: parsedData.texturePreferences,
			productCategories: parsedData.productCategories,
			supportOutfitSwapping: parsedData.supportOutfitSwapping,
		}

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
