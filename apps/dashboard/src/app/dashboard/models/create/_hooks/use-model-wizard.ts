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
	storagePath?: string
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

		if (trimmed) {
			setFormData((prev) => {
				const currentTextures = prev.texturePreferences
				if (currentTextures.length < 5 && !currentTextures.includes(trimmed)) {
					return {
						...prev,
						texturePreferences: [...currentTextures, trimmed],
					}
				}
				return prev
			})
			setTouchedFields((prev) => new Set(prev).add('texturePreferences'))
			setTextureInput('')
		}
	}, [textureInput])

	const removeTexture = useCallback((texture: string) => {
		setFormData((prev) => ({
			...prev,
			texturePreferences: prev.texturePreferences.filter((t) => t !== texture),
		}))
		setTouchedFields((prev) => new Set(prev).add('texturePreferences'))
	}, [])

	// Product categories management
	const toggleProductCategory = useCallback((category: CreateModelFormData['productCategories'][number]) => {
		setFormData((prev) => {
			const currentCategories = prev.productCategories

			if (currentCategories.includes(category)) {
				return {
					...prev,
					productCategories: currentCategories.filter((c) => c !== category),
				}
			}
			if (currentCategories.length < 3) {
				return {
					...prev,
					productCategories: [...currentCategories, category],
				}
			}
			return prev
		})
		setTouchedFields((prev) => new Set(prev).add('productCategories'))
	}, [])

	// Reference images management
	const addReferenceImages = useCallback((files: File[], uploadFn?: (file: File, imageId: string) => Promise<void>) => {
		// Generate timestamp OUTSIDE setFormData to ensure stability across Fast Refresh/Strict Mode
		const timestamp = Date.now()
		const imagesRef = { current: [] as ReferenceImage[] }

		setFormData((prev) => {
			const currentImages = prev.referenceImages
			const availableSlots = 5 - currentImages.length
			const filesToAdd = files.slice(0, availableSlots)

			// Only create images if not already created (prevents duplicate creation on re-render)
			if (imagesRef.current.length === 0) {
				imagesRef.current = filesToAdd.map((file, index) => ({
					id: `${timestamp}-${index}-${Math.random().toString(36).substring(2, 9)}`,
					file,
					preview: URL.createObjectURL(file),
					name: file.name,
					size: file.size,
					uploadProgress: 0,
				}))
				console.log('[DEBUG] Created images with IDs:', imagesRef.current.map(img => img.id))
			} else {
				console.log('[DEBUG] Reusing images (Fast Refresh), IDs:', imagesRef.current.map(img => img.id))
			}

			return {
				...prev,
				referenceImages: [...currentImages, ...imagesRef.current],
			}
		})

		setTouchedFields((prev) => new Set(prev).add('referenceImages'))

		// Trigger upload immediately if uploadFn provided
		// Use queueMicrotask to ensure state update completes first
		queueMicrotask(() => {
			const imagesToUpload = imagesRef.current
			console.log('[DEBUG] Triggering uploads for IDs:', imagesToUpload.map(img => img.id))
			if (uploadFn && imagesToUpload.length > 0) {
				for (const image of imagesToUpload) {
					if (image.file) {
						uploadFn(image.file, image.id).catch((error) => {
							console.error('[useModelWizard] Upload failed for', image.name, ':', error)
						})
					}
				}
			}
		})
	}, [])

	const removeReferenceImage = useCallback(
		(imageId: string, deleteFn?: (imageId: string, assetId: string) => Promise<void>) => {
			setFormData((prev) => {
				const imageToRemove = prev.referenceImages.find((img) => img.id === imageId)

				if (imageToRemove?.preview) {
					URL.revokeObjectURL(imageToRemove.preview)
				}

				// Delete from storage if assetId exists
				if (imageToRemove?.assetId && deleteFn) {
					deleteFn(imageId, imageToRemove.assetId).catch((error) => {
						console.error('[useModelWizard] Delete failed for', imageToRemove.name, ':', error)
					})
				}

				return {
					...prev,
					referenceImages: prev.referenceImages.filter((img) => img.id !== imageId),
				}
			})
			setTouchedFields((prev) => new Set(prev).add('referenceImages'))
		},
		[],
	)

	const updateImageProgress = useCallback((imageId: string, progress: number) => {
		setFormData((prev) => {
			const found = prev.referenceImages.find(img => img.id === imageId)
			if (!found) {
				console.warn('[DEBUG] updateImageProgress - Image ID not found:', imageId)
				console.warn('[DEBUG] Available IDs:', prev.referenceImages.map(img => img.id))
			}
			return {
				...prev,
				referenceImages: prev.referenceImages.map((img) =>
					img.id === imageId ? { ...img, uploadProgress: progress } : img,
				),
			}
		})
		setTouchedFields((prev) => new Set(prev).add('referenceImages'))
	}, [])

	const setImageAssetId = useCallback((imageId: string, assetId: string, storagePath?: string) => {
		setFormData((prev) => {
			const found = prev.referenceImages.find(img => img.id === imageId)
			if (!found) {
				console.warn('[DEBUG] setImageAssetId - Image ID not found:', imageId)
				console.warn('[DEBUG] Available IDs:', prev.referenceImages.map(img => img.id))
			}
			return {
				...prev,
				referenceImages: prev.referenceImages.map((img) =>
					img.id === imageId ? { ...img, assetId, storagePath, uploadProgress: 100 } : img,
				),
			}
		})
		setTouchedFields((prev) => new Set(prev).add('referenceImages'))
	}, [])

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
