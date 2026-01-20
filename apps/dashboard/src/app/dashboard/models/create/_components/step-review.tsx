'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Edit2, Image, Palette, Settings, User } from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import type { UseModelFormReturn, Step } from '../_hooks'
import {
	getLightingPresetByValue,
	getCameraFramingByValue,
	getBackgroundByValue,
	getPoseStyleByValue,
	getExpressionByValue,
	getPostProcessingByValue,
	getProductCategoryByValue,
	GENDER_OPTIONS,
	AGE_RANGE_OPTIONS,
	BODY_TYPE_OPTIONS,
	ETHNICITY_OPTIONS,
} from '../_constants'

interface StepReviewProps {
	form: UseModelFormReturn['form']
	onEditStep: (step: Step) => void
}

function ReviewSection({
	title,
	icon: Icon,
	iconColor,
	step,
	index,
	onEdit,
	children,
}: {
	title: string
	icon: React.ElementType
	iconColor: string
	step: Step
	index: number
	onEdit: (step: Step) => void
	children: React.ReactNode
}) {
	return (
		<AccordionItem value={index} className='border rounded-lg px-4'>
			<AccordionTrigger className='hover:no-underline'>
				<div className='flex items-center gap-3'>
					<div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconColor}`}>
						<Icon className='h-4 w-4' />
					</div>
					<span className='font-medium'>{title}</span>
				</div>
			</AccordionTrigger>
			<AccordionContent>
				<div className='space-y-4 pt-2'>
					{children}
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={() => onEdit(step)}
						className='gap-2'>
						<Edit2 className='h-3 w-3' />
						Edit
					</Button>
				</div>
			</AccordionContent>
		</AccordionItem>
	)
}

function ReviewField({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className='flex justify-between py-1'>
			<span className='text-muted-foreground text-sm'>{label}:</span>
			<span className='text-sm font-medium'>{value || '-'}</span>
		</div>
	)
}

export function StepReview({ form, onEditStep }: StepReviewProps) {
	const values = form.state.values

	// Helper functions to get labels
	const getGenderLabel = (value: string) => GENDER_OPTIONS.find((o) => o.value === value)?.label || value
	const getAgeRangeLabel = (value: string) => AGE_RANGE_OPTIONS.find((o) => o.value === value)?.label || value
	const getBodyTypeLabel = (value: string) => BODY_TYPE_OPTIONS.find((o) => o.value === value)?.label || value
	const getEthnicityLabel = (value: string) => ETHNICITY_OPTIONS.find((o) => o.value === value)?.label || value

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-3'>
				<div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10'>
					<CheckCircle className='h-5 w-5 text-green-500' />
				</div>
				<div>
					<h3 className='font-semibold'>Review & Create</h3>
					<p className='text-muted-foreground text-sm'>
						Review your configuration before creating the model
					</p>
				</div>
			</div>

			{/* Review Sections */}
			<Accordion defaultValue={[0, 1, 2, 3]} className='space-y-3'>
				{/* Basic Info */}
				<ReviewSection
					title='Basic Information'
					icon={User}
					iconColor='bg-primary/10 text-primary'
					step={1}
					index={0}
					onEdit={onEditStep}>
					<div className='rounded-lg bg-muted p-4'>
						<ReviewField label='Name' value={values.name} />
						<ReviewField label='Description' value={values.description || 'Not provided'} />
					</div>
				</ReviewSection>

				{/* Appearance */}
				<ReviewSection
					title='Appearance'
					icon={Palette}
					iconColor='bg-purple-500/10 text-purple-500'
					step={2}
					index={1}
					onEdit={onEditStep}>
					<div className='rounded-lg bg-muted p-4'>
						<ReviewField label='Gender' value={getGenderLabel(values.gender)} />
						<ReviewField label='Age Range' value={getAgeRangeLabel(values.ageRange)} />
						<ReviewField label='Body Type' value={getBodyTypeLabel(values.bodyType)} />
						<ReviewField label='Ethnicity' value={getEthnicityLabel(values.ethnicity)} />
						{values.prompt && (
							<div className='mt-2 pt-2 border-t'>
								<span className='text-muted-foreground text-sm'>Custom Prompt:</span>
								<p className='text-sm mt-1'>{values.prompt}</p>
							</div>
						)}
					</div>
				</ReviewSection>

				{/* Fashion Configuration */}
				<ReviewSection
					title='Fashion Configuration'
					icon={Settings}
					iconColor='bg-blue-500/10 text-blue-500'
					step={3}
					index={2}
					onEdit={onEditStep}>
					<div className='rounded-lg bg-muted p-4 space-y-3'>
						<ReviewField
							label='Lighting'
							value={getLightingPresetByValue(values.lightingPreset)?.label}
						/>
						<ReviewField
							label='Camera Framing'
							value={getCameraFramingByValue(values.cameraFraming)?.label}
						/>
						<ReviewField
							label='Background'
							value={getBackgroundByValue(values.backgroundType)?.label}
						/>
						<ReviewField label='Pose Style' value={getPoseStyleByValue(values.poseStyle)?.label} />
						<ReviewField label='Expression' value={getExpressionByValue(values.expression)?.label} />
						<ReviewField
							label='Post-Processing'
							value={getPostProcessingByValue(values.postProcessingStyle)?.label}
						/>

						{/* Textures */}
						<div className='pt-2 border-t'>
							<span className='text-muted-foreground text-sm'>Texture Preferences:</span>
							<div className='flex flex-wrap gap-1 mt-1'>
								{values.texturePreferences.length > 0 ? (
									values.texturePreferences.map((texture) => (
										<Badge key={texture} variant='secondary' className='text-xs'>
											{texture}
										</Badge>
									))
								) : (
									<span className='text-sm text-muted-foreground'>None</span>
								)}
							</div>
						</div>

						{/* Categories */}
						<div className='pt-2 border-t'>
							<span className='text-muted-foreground text-sm'>Product Categories:</span>
							<div className='flex flex-wrap gap-1 mt-1'>
								{values.productCategories.length > 0 ? (
									values.productCategories.map((category) => (
										<Badge key={category} variant='outline' className='text-xs'>
											{getProductCategoryByValue(category)?.label}
										</Badge>
									))
								) : (
									<span className='text-sm text-muted-foreground'>None selected</span>
								)}
							</div>
						</div>

						{/* Outfit Swapping */}
						<div className='pt-2 border-t'>
							<ReviewField
								label='Outfit Swapping'
								value={values.supportOutfitSwapping ? 'Enabled' : 'Disabled'}
							/>
						</div>
					</div>
				</ReviewSection>

				{/* Reference Images */}
				<ReviewSection
					title='Reference Images'
					icon={Image}
					iconColor='bg-orange-500/10 text-orange-500'
					step={4}
					index={3}
					onEdit={onEditStep}>
					<div className='space-y-3'>
						{values.referenceImages.length > 0 ? (
							<>
								<p className='text-sm text-muted-foreground'>
									{values.referenceImages.length} image{values.referenceImages.length !== 1 ? 's' : ''}{' '}
									uploaded
								</p>
								<div className='grid grid-cols-5 gap-2'>
									{values.referenceImages.map((image) => (
										<div
											key={image.id}
											className='aspect-square overflow-hidden rounded-lg border bg-muted'>
											<img
												src={image.preview}
												alt={image.name}
												className='h-full w-full object-cover'
											/>
										</div>
									))}
								</div>
							</>
						) : (
							<p className='text-sm text-muted-foreground'>No reference images uploaded</p>
						)}
					</div>
				</ReviewSection>
			</Accordion>

			{/* Summary Card */}
			<div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/50'>
				<div className='flex items-start gap-3'>
					<CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400' />
					<div className='text-sm text-green-800 dark:text-green-200'>
						<p className='font-medium'>Ready to create your model!</p>
						<p className='mt-1'>
							Click &quot;Create Model&quot; below to start generating your AI influencer. The calibration
							process will begin automatically.
						</p>
					</div>
				</div>
			</div>
		</motion.div>
	)
}
