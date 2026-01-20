'use client'

/**
 * @fileoverview Model Form Hook
 *
 * Custom hook for managing the Create Model wizard form state
 * using @tanstack/react-form with Zod validation.
 */

import { useForm } from '@tanstack/react-form'
import { useCallback, useState } from 'react'

import type { CreateModelFormData } from '../_schemas'
import { defaultFormValues, validateStep } from '../_schemas'

export type Step = 1 | 2 | 3 | 4 | 5

export interface UseModelFormOptions {
	onSubmit?: (data: CreateModelFormData) => Promise<void>
	initialValues?: Partial<CreateModelFormData>
}

export interface ReferenceImage {
	id: string
	file?: File
	preview: string
	name: string
	size: number
	uploadProgress?: number
	assetId?: string
}

export function useModelForm(options: UseModelFormOptions = {}) {
	const { onSubmit, initialValues } = options

	// Step management
	const [currentStep, setCurrentStep] = useState<Step>(1)
	const [stepDirection, setStepDirection] = useState<1 | -1>(1)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Texture input state (for tag input)
	const [textureInput, setTextureInput] = useState('')

	// Form setup with @tanstack/react-form
	const form = useForm({
		defaultValues: {
			...defaultFormValues,
			...initialValues,
		} as CreateModelFormData,
		onSubmit: async ({ value }) => {
			if (onSubmit) {
				setIsSubmitting(true)
				try {
					await onSubmit(value)
				} finally {
					setIsSubmitting(false)
				}
			}
		},
	})

	// Step navigation - returns a function that validates current step
	// The actual reactivity is handled by form.Subscribe in the component
	const checkCanGoNext = useCallback(
		(values: CreateModelFormData) => {
			return validateStep(currentStep, values)
		},
		[currentStep],
	)

	const goToStep = useCallback(
		(step: Step) => {
			if (step < currentStep) {
				setStepDirection(-1)
			} else {
				setStepDirection(1)
			}
			setCurrentStep(step)
		},
		[currentStep],
	)

	const goNext = useCallback(() => {
		if (currentStep < 5 && checkCanGoNext(form.state.values)) {
			setStepDirection(1)
			setCurrentStep((s) => (s + 1) as Step)
		}
	}, [currentStep, checkCanGoNext, form.state.values])

	const goBack = useCallback(() => {
		if (currentStep > 1) {
			setStepDirection(-1)
			setCurrentStep((s) => (s - 1) as Step)
		}
	}, [currentStep])

	// Texture preferences management
	const addTexture = useCallback(() => {
		const trimmed = textureInput.trim()
		const currentTextures = form.state.values.texturePreferences

		if (trimmed && currentTextures.length < 5 && !currentTextures.includes(trimmed)) {
			form.setFieldValue('texturePreferences', [...currentTextures, trimmed])
			setTextureInput('')
		}
	}, [textureInput, form])

	const removeTexture = useCallback(
		(texture: string) => {
			const currentTextures = form.state.values.texturePreferences
			form.setFieldValue(
				'texturePreferences',
				currentTextures.filter((t) => t !== texture),
			)
		},
		[form],
	)

	// Product categories management
	const toggleProductCategory = useCallback(
		(category: CreateModelFormData['productCategories'][number]) => {
			const currentCategories = form.state.values.productCategories

			if (currentCategories.includes(category)) {
				form.setFieldValue(
					'productCategories',
					currentCategories.filter((c) => c !== category),
				)
			} else if (currentCategories.length < 3) {
				form.setFieldValue('productCategories', [...currentCategories, category])
			}
		},
		[form],
	)

	// Reference images management
	const addReferenceImages = useCallback(
		(files: File[]) => {
			const currentImages = form.state.values.referenceImages
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

			form.setFieldValue('referenceImages', [...currentImages, ...newImages])
		},
		[form],
	)

	const removeReferenceImage = useCallback(
		(imageId: string) => {
			const currentImages = form.state.values.referenceImages
			const imageToRemove = currentImages.find((img) => img.id === imageId)

			if (imageToRemove?.preview) {
				URL.revokeObjectURL(imageToRemove.preview)
			}

			form.setFieldValue(
				'referenceImages',
				currentImages.filter((img) => img.id !== imageId),
			)
		},
		[form],
	)

	const updateImageProgress = useCallback(
		(imageId: string, progress: number) => {
			const currentImages = form.state.values.referenceImages
			form.setFieldValue(
				'referenceImages',
				currentImages.map((img) => (img.id === imageId ? { ...img, uploadProgress: progress } : img)),
			)
		},
		[form],
	)

	const setImageAssetId = useCallback(
		(imageId: string, assetId: string) => {
			const currentImages = form.state.values.referenceImages
			form.setFieldValue(
				'referenceImages',
				currentImages.map((img) => (img.id === imageId ? { ...img, assetId, uploadProgress: 100 } : img)),
			)
		},
		[form],
	)

	// Form submission
	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault()
			if (currentStep === 5) {
				await form.handleSubmit()
			} else {
				goNext()
			}
		},
		[currentStep, form, goNext],
	)

	return {
		// Form instance
		form,

		// Step state
		currentStep,
		stepDirection,
		totalSteps: 5 as const,

		// Navigation
		goNext,
		goBack,
		goToStep,
		checkCanGoNext,

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

		// Submission
		isSubmitting,
		handleSubmit,
	}
}

export type UseModelFormReturn = ReturnType<typeof useModelForm>
