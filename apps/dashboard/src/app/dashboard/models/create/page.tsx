'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { useAuth } from '@/components/providers'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createModelAction } from '@/features/models/actions/model.actions'
import { useCurrentStore } from '@/features/stores'

import {
	StepAppearance,
	StepBasicInfo,
	StepFashionConfig,
	StepReferenceImages,
	StepReview,
	WizardProgress,
} from './_components'
import { useModelWizard } from './_hooks/use-model-wizard'

const STEP_TITLES = ['Basic Info', 'Appearance', 'Fashion Configuration', 'Reference Images', 'Review & Create']

const STEP_DESCRIPTIONS = [
	'Enter basic information about your AI model',
	'Define the physical appearance of your model',
	'Configure lighting, camera, and styling preferences',
	'Upload reference images to guide the AI',
	'Review your configuration before creating',
]

// Animation variants for step transitions
const stepVariants = {
	enter: (direction: number) => ({
		x: direction > 0 ? 100 : -100,
		opacity: 0,
	}),
	center: {
		x: 0,
		opacity: 1,
	},
	exit: (direction: number) => ({
		x: direction < 0 ? 100 : -100,
		opacity: 0,
	}),
}

export default function CreateModelPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('models')
	const router = useRouter()
	const { user } = useAuth()
	const { currentStore, isLoading: isLoadingStores } = useCurrentStore()

	// Initialize wizard hook
	const wizard = useModelWizard()
	const { modelId, currentStep, stepDirection, goNext, goBack, goToStep, formData } = wizard

	// Initialize action state for final submission
	const [state, formAction, isPending] = useActionState(createModelAction, null)

	// Set breadcrumbs
	useEffect(() => {
		setItems([{ label: t('breadcrumbs.models'), href: '/dashboard/models' }, { label: t('breadcrumbs.create') }])
	}, [setItems, t])

	// Check for store availability
	const hasStore = !isLoadingStores && currentStore?.id

	// Handle success
	useEffect(() => {
		if (state?.success) {
			toast.success('Model creation started!', {
				description: 'Your AI model is being generated. This may take a few minutes.',
			})
			router.push('/dashboard/models')
		} else if (state?.error) {
			toast.error('Failed to create model', {
				description: state.error,
			})
		}
	}, [state, router])

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (currentStep === 5) {
			// Validate user authentication
			if (!user?.uid) {
				toast.error('Authentication required', {
					description: 'Please log in to create a model',
				})
				return
			}

			// Validate store exists
			if (!currentStore?.id) {
				toast.error('No store selected', {
					description: 'Please select a store before creating a model',
				})
				return
			}

			try {
				// Collect assetIds from already-uploaded images
				const referenceImageIds = formData.referenceImages
					.map((img) => img.assetId)
					.filter((assetId): assetId is string => assetId !== undefined)

				// Check if any images are still uploading
				const stillUploading = formData.referenceImages.filter(
					(img) => img.uploadProgress !== undefined && img.uploadProgress > 0 && img.uploadProgress < 100,
				)

				if (stillUploading.length > 0) {
					toast.warning('Images still uploading', {
						description: 'Please wait for all images to finish uploading',
					})
					return
				}

				// Submit to server action
				const formDataObj = new FormData()
				formDataObj.append(
					'data',
					JSON.stringify({
						id: modelId, // Pre-generated modelId
						...formData,
						referenceImageIds,
						storeId: currentStore.id,
					}),
				)

				formAction(formDataObj)
			} catch (error) {
				toast.error('Failed to create model', {
					description: error instanceof Error ? error.message : 'Unknown error',
				})
			}
		} else {
			goNext()
		}
	}

	return (
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Button variant='ghost' size='icon' render={<Link href='/dashboard/models' />} nativeButton={false}>
					<ArrowLeft className='h-4 w-4' />
				</Button>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>{t('breadcrumbs.create')}</h1>
					<p className='text-muted-foreground'>Create a new AI model for your fashion content</p>
				</div>
			</div>

			{/* Progress */}
			<div className='mx-auto w-full max-w-3xl'>
				<WizardProgress currentStep={currentStep} onStepClick={goToStep} />
			</div>

			{/* No Store Warning */}
			{!isLoadingStores && !currentStore?.id && (
				<Alert variant='destructive' className='mx-auto w-full max-w-3xl'>
					<AlertTriangle className='h-4 w-4' />
					<AlertTitle>No store selected</AlertTitle>
					<AlertDescription>
						You need to select or create a store before creating models.{' '}
						<Link href='/dashboard/stores' className='underline'>
							Go to stores
						</Link>
					</AlertDescription>
				</Alert>
			)}

			{/* Global Error */}
			{state?.error && !state?.fieldErrors && (
				<div className='bg-destructive/10 text-destructive mx-auto w-full max-w-3xl rounded-md p-3 text-sm'>
					{state.error}
				</div>
			)}

			{/* Form Card */}
			<form onSubmit={handleSubmit}>
				<Card className='mx-auto w-full max-w-3xl'>
					<CardHeader>
						<CardTitle>{STEP_TITLES[currentStep - 1]}</CardTitle>
						<CardDescription>{STEP_DESCRIPTIONS[currentStep - 1]}</CardDescription>
					</CardHeader>
					<CardContent>
						<AnimatePresence mode='wait' custom={stepDirection}>
							<motion.div
								key={currentStep}
								custom={stepDirection}
								variants={stepVariants}
								initial='enter'
								animate='center'
								exit='exit'
								transition={{ duration: 0.3, ease: 'easeInOut' }}>
								{/* Step 1: Basic Information (New Version with InputGroup) */}
								{currentStep === 1 && <StepBasicInfo wizard={wizard} />}

								{/* Step 2: Appearance */}
								{currentStep === 2 && <StepAppearance wizard={wizard} />}

								{/* Step 3: Fashion Configuration */}
								{currentStep === 3 && <StepFashionConfig wizard={wizard} />}

								{/* Step 4: Reference Images */}
								{currentStep === 4 && <StepReferenceImages wizard={wizard} />}

								{/* Step 5: Review */}
								{currentStep === 5 && <StepReview wizard={wizard} onEditStep={goToStep} />}
							</motion.div>
						</AnimatePresence>
					</CardContent>

					{/* Navigation */}
					<div className='flex justify-between border-t px-6 py-4'>
						<Button type='button' variant='outline' onClick={goBack} disabled={currentStep === 1 || isPending}>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Back
						</Button>
						{currentStep < 5 ? (
							<Button
								type='button'
								onClick={() => {
									goNext()
								}}>
								Next
								<ArrowRight className='ml-2 h-4 w-4' />
							</Button>
						) : (
							<Button render={<button type='submit' />} disabled={isPending || !hasStore}>
								{isPending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Creating model...
									</>
								) : (
									'Create Model'
								)}
							</Button>
						)}
					</div>
				</Card>
			</form>
		</div>
	)
}
