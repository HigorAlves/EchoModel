'use client'

/**
 * @fileoverview Model Actions
 *
 * Client-side actions for model creation with useActionState
 */

import type { CreateModelFormData } from '@/app/dashboard/models/create/_schemas'
import { CreateModelFormSchema } from '@/app/dashboard/models/create/_schemas'

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
	// Extract JSON data from FormData (we'll send as JSON string)
	const dataJson = formData.get('data') as string

	if (!dataJson) {
		return {
			success: false,
			error: 'No data provided',
		}
	}

	let rawData: unknown
	try {
		rawData = JSON.parse(dataJson)
	} catch {
		return {
			success: false,
			error: 'Invalid data format',
		}
	}

	// Validate with Zod
	const result = CreateModelFormSchema.safeParse(rawData)

	if (!result.success) {
		const fieldErrors: Record<string, string[]> = {}
		for (const issue of result.error.issues) {
			const field = issue.path.join('.')
			if (!fieldErrors[field]) {
				fieldErrors[field] = []
			}
			fieldErrors[field].push(issue.message)
		}
		return { success: false, fieldErrors }
	}

	// TODO: Implement actual model creation API call
	// For now, simulate a successful creation
	try {
		await new Promise((resolve) => setTimeout(resolve, 2000))

		// Simulate success
		return {
			success: true,
			modelId: `model-${Date.now()}`,
		}
	} catch {
		return {
			success: false,
			error: 'An unexpected error occurred while creating the model. Please try again.',
		}
	}
}
