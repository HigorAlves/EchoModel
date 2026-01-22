'use client'

/**
 * @fileoverview Model Wizard Hook
 *
 * Simplified hook for managing Create Model wizard state with useState and Zod validation
 */

import { useCallback, useState } from 'react'

import type { CreateModelFormData } from '../_schemas'
import { defaultFormValues, getStepErrors, validateStep } from '../_schemas'

export type Step = 1 | 2 | 3 | 4 | 5

export interface ReferenceImage {
	id: string
	file?: File
	preview: string
	name: string
	size: number
	uploadProgress?: number
	assetId?: string
}

// Helper to get fields for each step
function getStepFields(step: number): Array<keyof CreateModelFormData> {
	switch (step) {
		case 1:
			return ['name', 'description']
		case 2:
			return ['gender', 'ageRange', 'ethnicity', 'bodyType', 'prompt']
		case 3:
			return [
				'lightingPreset',
				'cameraFraming',
				'backgroundType',
				'poseStyle',
				'expression',
				'postProcessingStyle',
				'texturePreferences',
				'productCategories',
				'supportOutfitSwapping',
			]
		case 4:
			return ['referenceImages']
		default:
			return []
	}
}

export function useModelWizard() {
	// Form data state
	const [formData, setFormData] = useState<CreateModelFormData>(defaultFormValues)

	// Step management
	const [currentStep, setCurrentStep] = useState<Step>(1)
	const [stepDirection, setStepDirection] = useState<1 | -1>(1)
	const [stepErrors, setStepErrors] = useState<Record<string, string[]>>({})
	const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

	// Texture input state (for tag input)
	const [textureInput, setTextureInput] = useState('')

	// Update form field
	const updateField = useCallback(<K extends keyof CreateModelFormData>(field: K, value: CreateModelFormData[K]) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
		setTouchedFields((prev) => new Set(prev).add(field))
	}, [])

	// Mark field as touched
	const touchField = useCallback((field: keyof CreateModelFormData) => {
		setTouchedFields((prev) => new Set(prev).add(field))
	}, [])

	// Validate current step
	const validateCurrentStep = useCallback(() => {
		const errors = getStepErrors(currentStep, formData)
		setStepErrors(errors)

		// Mark all fields for the current step as touched
		const stepFields = getStepFields(currentStep)
		setTouchedFields((prev) => {
			const newTouched = new Set(prev)
			for (const field of stepFields) {
				newTouched.add(field)
			}
			return newTouched
		})

		return Object.keys(errors).length === 0
	}, [currentStep, formData])

	// Check if can go to next step
	const canGoNext = useCallback(() => {
		return validateStep(currentStep, formData)
	}, [currentStep, formData])

	// Navigation
	const goToStep = useCallback(
		(step: Step) => {
			if (step < currentStep) {
				setStepDirection(-1)
			} else {
				setStepDirection(1)
			}
			setCurrentStep(step)
			setStepErrors({})
		},
		[currentStep],
	)

	const goNext = useCallback(() => {
		if (currentStep < 5) {
			const isValid = validateCurrentStep()
			if (isValid) {
				setStepDirection(1)
				setCurrentStep((s) => (s + 1) as Step)
				setStepErrors({})
			}
		}
	}, [currentStep, validateCurrentStep])

	const goBack = useCallback(() => {
		if (currentStep > 1) {
			setStepDirection(-1)
			setCurrentStep((s) => (s - 1) as Step)
			setStepErrors({})
		}
	}, [currentStep])

	// Texture preferences management
	const addTexture = useCallback(() => {
		const trimmed = textureInput.trim()
		const currentTextures = formData.texturePreferences

		if (trimmed && currentTextures.length < 5 && !currentTextures.includes(trimmed)) {
			updateField('texturePreferences', [...currentTextures, trimmed])
			setTextureInput('')
		}
	}, [textureInput, formData.texturePreferences, updateField])

	const removeTexture = useCallback(
		(texture: string) => {
			updateField(
				'texturePreferences',
				formData.texturePreferences.filter((t) => t !== texture),
			)
		},
		[formData.texturePreferences, updateField],
	)

	// Product categories management
	const toggleProductCategory = useCallback(
		(category: CreateModelFormData['productCategories'][number]) => {
			const currentCategories = formData.productCategories

			if (currentCategories.includes(category)) {
				updateField(
					'productCategories',
					currentCategories.filter((c) => c !== category),
				)
			} else if (currentCategories.length < 3) {
				updateField('productCategories', [...currentCategories, category])
			}
		},
		[formData.productCategories, updateField],
	)

	// Reference images management
	const addReferenceImages = useCallback(
		(files: File[]) => {
			const currentImages = formData.referenceImages
			const availableSlots = 5 - currentImages.length
			const filesToAdd = files.slice(0, availableSlots)

			const newImages: ReferenceImage[] = filesToAdd.map((file) => ({
				id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
				file,
				preview: URL.createObjectURL(file),
				name: file.name,
				size: file.size,
				uploadProgress: 0,
			}))

			updateField('referenceImages', [...currentImages, ...newImages])
		},
		[formData.referenceImages, updateField],
	)

	const removeReferenceImage = useCallback(
		(imageId: string) => {
			const currentImages = formData.referenceImages
			const imageToRemove = currentImages.find((img) => img.id === imageId)

			if (imageToRemove?.preview) {
				URL.revokeObjectURL(imageToRemove.preview)
			}

			updateField(
				'referenceImages',
				currentImages.filter((img) => img.id !== imageId),
			)
		},
		[formData.referenceImages, updateField],
	)

	const updateImageProgress = useCallback(
		(imageId: string, progress: number) => {
			updateField(
				'referenceImages',
				formData.referenceImages.map((img) => (img.id === imageId ? { ...img, uploadProgress: progress } : img)),
			)
		},
		[formData.referenceImages, updateField],
	)

	const setImageAssetId = useCallback(
		(imageId: string, assetId: string) => {
			updateField(
				'referenceImages',
				formData.referenceImages.map((img) =>
					img.id === imageId ? { ...img, assetId, uploadProgress: 100 } : img,
				),
			)
		},
		[formData.referenceImages, updateField],
	)

	return {
		// Form data
		formData,
		updateField,
		touchField,

		// Step state
		currentStep,
		stepDirection,
		totalSteps: 5 as const,

		// Validation
		stepErrors,
		touchedFields,
		validateCurrentStep,
		canGoNext,

		// Navigation
		goNext,
		goBack,
		goToStep,

		// Texture management
		textureInput,
		setTextureInput,
		addTexture,
		removeTexture,

		// Category management
		toggleProductCategory,

		// Reference images management
		addReferenceImages,
		removeReferenceImage,
		updateImageProgress,
		setImageAssetId,
	}
}

export type UseModelWizardReturn = ReturnType<typeof useModelWizard>
