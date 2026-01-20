'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import {
	StepAppearance,
	StepBasicInfo,
	StepFashionConfig,
	StepReferenceImages,
	StepReview,
	WizardProgress,
} from './_components'
import { useModelForm } from './_hooks'
import type { CreateModelFormData } from './_schemas'

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
	const tCreate = useTranslations('models.create')

	// Initialize form with the custom hook
	const {
		form,
		currentStep,
		stepDirection,
		goNext,
		goBack,
		goToStep,
		checkCanGoNext,
		textureInput,
		setTextureInput,
		addTexture,
		removeTexture,
		toggleProductCategory,
		addReferenceImages,
		removeReferenceImage,
		isSubmitting,
	} = useModelForm({
		onSubmit: async (data: CreateModelFormData) => {
			try {
				// TODO: Implement actual model creation
				console.log('Creating model with data:', data)
				toast.success('Model creation started!', {
					description: 'Your AI model is being generated. This may take a few minutes.',
				})
			} catch (error) {
				console.error('Error creating model:', error)
				toast.error('Failed to create model', {
					description: 'Please try again or contact support if the problem persists.',
				})
			}
		},
	})

	// Set breadcrumbs
	useEffect(() => {
		setItems([{ label: t('breadcrumbs.models'), href: '/dashboard/models' }, { label: t('breadcrumbs.create') }])
	}, [setItems, t])

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (currentStep === 5) {
			await form.handleSubmit()
		} else {
			goNext()
		}
	}

	return (
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Button variant='ghost' size='icon' render={<Link href='/dashboard/models' />}>
					<ArrowLeft className='h-4 w-4' />
				</Button>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>{tCreate('title')}</h1>
					<p className='text-muted-foreground'>{tCreate('subtitle')}</p>
				</div>
			</div>

			{/* Progress */}
			<div className='mx-auto w-full max-w-3xl'>
				<WizardProgress currentStep={currentStep} onStepClick={goToStep} />
			</div>

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
								{/* Step 1: Basic Information */}
								{currentStep === 1 && <StepBasicInfo form={form} />}

								{/* Step 2: Appearance */}
								{currentStep === 2 && <StepAppearance form={form} />}

								{/* Step 3: Fashion Configuration */}
								{currentStep === 3 && (
									<StepFashionConfig
										form={form}
										textureInput={textureInput}
										setTextureInput={setTextureInput}
										addTexture={addTexture}
										removeTexture={removeTexture}
										toggleProductCategory={toggleProductCategory}
									/>
								)}

								{/* Step 4: Reference Images */}
								{currentStep === 4 && (
									<StepReferenceImages
										form={form}
										addReferenceImages={addReferenceImages}
										removeReferenceImage={removeReferenceImage}
									/>
								)}

								{/* Step 5: Review */}
								{currentStep === 5 && <StepReview form={form} onEditStep={goToStep} />}
							</motion.div>
						</AnimatePresence>
					</CardContent>

					{/* Navigation */}
					<div className='flex justify-between border-t px-6 py-4'>
						<Button type='button' variant='outline' onClick={goBack} disabled={currentStep === 1}>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Back
						</Button>
						{currentStep < 5 ? (
							<form.Subscribe selector={(state) => state.values}>
								{(values) => (
									<Button type='submit' disabled={!checkCanGoNext(values)}>
										Next
										<ArrowRight className='ml-2 h-4 w-4' />
									</Button>
								)}
							</form.Subscribe>
						) : (
							<Button type='submit' disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Creating...
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
