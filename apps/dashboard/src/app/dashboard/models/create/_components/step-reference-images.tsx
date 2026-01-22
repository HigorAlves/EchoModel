'use client'

import { motion } from 'framer-motion'
import { Image, Info } from 'lucide-react'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'

import type { UseModelWizardReturn } from '../_hooks/use-model-wizard'
import { ImageUploadZone } from './image-upload-zone'

interface StepReferenceImagesProps {
	wizard: UseModelWizardReturn
}

export function StepReferenceImages({ wizard }: StepReferenceImagesProps) {
	const { formData, addReferenceImages, removeReferenceImage } = wizard
	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='space-y-6'>
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
			<Field>
				<FieldLabel className='gap-2'>
					<Image className='h-4 w-4 text-muted-foreground' />
					Reference Images
				</FieldLabel>
				<FieldDescription className='mb-4'>
					Upload 3-5 reference images to help define your model&apos;s appearance. The AI will use these as guidance for
					generating consistent results.
				</FieldDescription>
				<ImageUploadZone
					images={formData.referenceImages}
					onAddImages={addReferenceImages}
					onRemoveImage={removeReferenceImage}
					maxImages={5}
				/>
				<FieldDescription className='mt-2'>
					{formData.referenceImages.length}/5 images uploaded (optional, but recommended)
				</FieldDescription>
			</Field>
		</motion.div>
	)
}
