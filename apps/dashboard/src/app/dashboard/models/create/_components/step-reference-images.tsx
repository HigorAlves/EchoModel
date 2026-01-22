'use client'

import { motion } from 'framer-motion'
import { Image, Info } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/components/providers'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { useCurrentStore } from '@/features/stores'

import type { UseModelWizardReturn } from '../_hooks/use-model-wizard'
import { clearUploadedImage, saveUploadedImage } from '../_utils/upload-storage'
import { ImageUploadZone } from './image-upload-zone'

interface StepReferenceImagesProps {
	wizard: UseModelWizardReturn
}

export function StepReferenceImages({ wizard }: StepReferenceImagesProps) {
	const { formData, addReferenceImages, removeReferenceImage, updateImageProgress, setImageAssetId } = wizard
	const { user } = useAuth()
	const { currentStore } = useCurrentStore()

	// FIXME: Replace with real store from StoreProvider once stores are implemented
	// Memoize storeId to prevent generating new UUID on every render
	const storeId = useMemo(() => currentStore?.id || crypto.randomUUID(), [currentStore?.id])

	// Upload function for immediate upload using Firebase Storage SDK
	const handleUpload = async (file: File, imageId: string) => {
		if (!user?.uid) {
			toast.error('Authentication required', {
				description: 'Please log in to upload images',
			})
			return
		}

		try {
			console.log('[StepReferenceImages] Starting immediate upload for:', file.name)

			// Update progress: Starting
			updateImageProgress(imageId, 10)

			// Generate a unique asset ID for the file
			const assetId = crypto.randomUUID()

			// Create storage path: {storeId}/MODEL_REFERENCE/{assetId}/{filename}
			const storagePath = `${storeId}/MODEL_REFERENCE/${assetId}/${file.name}`

			console.log('[StepReferenceImages] Uploading to path:', storagePath)

			// Import Firebase Storage functions
			const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
			const { storage } = await import('@/lib/firebase/storage')

			// Create storage reference
			const storageRef = ref(storage, storagePath)

			// Upload file with progress tracking
			const uploadTask = uploadBytesResumable(storageRef, file, {
				contentType: file.type,
			})

			// Track upload progress
			uploadTask.on(
				'state_changed',
				(snapshot) => {
					const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
					updateImageProgress(imageId, Math.round(progress))
					console.log('[StepReferenceImages] Upload progress:', Math.round(progress), '%')
				},
				(error) => {
					console.error('[StepReferenceImages] Upload error:', error)
					throw error
				},
			)

			// Wait for upload to complete
			await uploadTask

			// Get download URL
			const downloadUrl = await getDownloadURL(storageRef)

			console.log('[StepReferenceImages] Upload complete, download URL:', downloadUrl)

			// Update progress: Complete
			updateImageProgress(imageId, 100)
			setImageAssetId(imageId, assetId)

			// Save to localStorage
			saveUploadedImage(imageId, assetId)

			toast.success('Image uploaded', {
				description: `${file.name} uploaded successfully`,
			})

			console.log('[StepReferenceImages] Successfully uploaded:', file.name)
		} catch (error) {
			console.error('[StepReferenceImages] Upload failed:', error)
			updateImageProgress(imageId, 0)
			toast.error('Upload failed', {
				description: error instanceof Error ? error.message : 'Unknown error',
			})
		}
	}

	// Delete function for removing images using Firebase Storage SDK
	const handleDelete = async (imageId: string, assetId: string) => {
		try {
			console.log('[StepReferenceImages] Deleting asset:', assetId)

			// Get the image file name from the imageId (stored in formData)
			const image = formData.referenceImages.find((img) => img.id === imageId)
			if (!image) {
				throw new Error('Image not found')
			}

			// Reconstruct storage path: {storeId}/MODEL_REFERENCE/{assetId}/{filename}
			const storagePath = `${storeId}/MODEL_REFERENCE/${assetId}/${image.file.name}`

			console.log('[StepReferenceImages] Deleting from path:', storagePath)

			// Import Firebase Storage functions
			const { ref, deleteObject } = await import('firebase/storage')
			const { storage } = await import('@/lib/firebase/storage')

			// Create storage reference and delete
			const storageRef = ref(storage, storagePath)
			await deleteObject(storageRef)

			// Clear from localStorage
			clearUploadedImage(imageId)

			toast.success('Image deleted', {
				description: 'Image removed from storage',
			})

			console.log('[StepReferenceImages] Successfully deleted asset:', assetId)
		} catch (error) {
			console.error('[StepReferenceImages] Delete failed:', error)
			toast.error('Delete failed', {
				description: error instanceof Error ? error.message : 'Failed to delete image',
			})
		}
	}

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
					onAddImages={(files) => addReferenceImages(files, handleUpload)}
					onRemoveImage={(imageId) => removeReferenceImage(imageId, handleDelete)}
					maxImages={5}
				/>
				<FieldDescription className='mt-2'>
					{formData.referenceImages.length}/5 images (optional, but recommended)
					{formData.referenceImages.length > 0 && (
						<span className='ml-2 text-green-600 dark:text-green-400'>
							• Images uploaded directly to Storage
						</span>
					)}
				</FieldDescription>
			</Field>
		</motion.div>
	)
}
