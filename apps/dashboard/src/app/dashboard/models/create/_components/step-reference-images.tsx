'use client'

import { motion } from 'framer-motion'
import { Image, Info } from 'lucide-react'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'

import type { UseModelFormReturn } from '../_hooks'
import { ImageUploadZone } from './image-upload-zone'

interface StepReferenceImagesProps {
	form: UseModelFormReturn['form']
	addReferenceImages: (files: File[]) => void
	removeReferenceImage: (imageId: string) => void
}

export function StepReferenceImages({ form, addReferenceImages, removeReferenceImage }: StepReferenceImagesProps) {
	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-3'>
				<div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10'>
					<Image className='h-5 w-5 text-orange-500' />
				</div>
				<div>
					<h3 className='font-semibold'>Reference Images</h3>
					<p className='text-muted-foreground text-sm'>Upload images to guide the AI model generation</p>
				</div>
			</div>

			{/* Tips Section */}
			<div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/50'>
				<div className='flex items-start gap-3'>
					<Info className='mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400' />
					<div className='text-sm text-blue-800 dark:text-blue-200'>
						<p className='font-medium mb-2'>Tips for best results:</p>
						<ul className='list-disc pl-4 space-y-1'>
							<li>Upload 3-5 images showing different angles and poses</li>
							<li>Use high-quality images with good lighting</li>
							<li>Ensure the face is clearly visible in most images</li>
							<li>Avoid heavily filtered or edited images</li>
							<li>Use images with consistent styling and appearance</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Upload Area */}
			<form.Field name='referenceImages'>
				{(field) => (
					<Field>
						<FieldLabel className='gap-2'>
							<Image className='h-4 w-4 text-muted-foreground' />
							Reference Images
						</FieldLabel>
						<FieldDescription className='mb-4'>
							Upload 3-5 reference images to help define your model&apos;s appearance. The AI will use these as guidance
							for generating consistent results.
						</FieldDescription>
						<ImageUploadZone
							images={field.state.value}
							onAddImages={addReferenceImages}
							onRemoveImage={removeReferenceImage}
							maxImages={5}
						/>
						<FieldDescription className='mt-2'>
							{field.state.value.length}/5 images uploaded (optional, but recommended)
						</FieldDescription>
					</Field>
				)}
			</form.Field>
		</motion.div>
	)
}
