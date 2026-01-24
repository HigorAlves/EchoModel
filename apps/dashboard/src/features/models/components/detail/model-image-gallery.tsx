'use client'

import { motion } from 'framer-motion'
import { Download, ImageIcon, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ModelImageGalleryProps {
	images: string[]
	modelName: string
	isLoading: boolean
	hasGeneratedImages: boolean
	unresolvedCount: number
	referenceImageCount: number
	modelStatus: string
	onImageClick: (index: number) => void
}

export function ModelImageGallery({
	images,
	modelName,
	isLoading,
	hasGeneratedImages,
	unresolvedCount,
	referenceImageCount,
	modelStatus,
	onImageClick,
}: ModelImageGalleryProps) {
	// Loading state
	if (isLoading && referenceImageCount > 0 && !hasGeneratedImages) {
		return (
			<Card className='border-dashed'>
				<CardContent className='flex min-h-[200px] flex-col items-center justify-center p-12 text-center'>
					<Loader2 className='h-8 w-8 animate-spin text-muted-foreground mb-4' />
					<p className='text-sm text-muted-foreground'>Loading images...</p>
				</CardContent>
			</Card>
		)
	}

	// Has images to display
	if (images.length > 0) {
		return (
			<div>
				<div className='mb-4 flex items-center justify-between'>
					<h2 className='text-xl font-semibold'>{hasGeneratedImages ? 'Generated Images' : 'Reference Images'}</h2>
					<span className='text-sm text-muted-foreground'>{images.length} images</span>
				</div>

				{/* Masonry Grid using CSS columns */}
				<div className='columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4'>
					{images.map((image, index) => (
						<motion.div
							key={image}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.05 }}
							className='mb-4 break-inside-avoid'>
							<div
								role='button'
								tabIndex={0}
								className='group relative cursor-pointer overflow-hidden rounded-xl bg-muted w-full text-left'
								onClick={() => onImageClick(index)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										onImageClick(index)
									}
								}}>
								{/* biome-ignore lint/performance/noImgElement: Dynamic user-generated content */}
								<img
									src={image}
									alt={`${modelName} - ${index + 1}`}
									className='w-full object-cover transition-transform duration-300 group-hover:scale-105'
								/>

								{/* Hover Overlay */}
								<div className='absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100'>
									<div className='flex gap-2'>
										<Button
											variant='secondary'
											size='icon'
											className='h-10 w-10'
											onClick={(e) => {
												e.stopPropagation()
												onImageClick(index)
											}}>
											<ImageIcon className='h-5 w-5' />
										</Button>
										<Button
											variant='secondary'
											size='icon'
											className='h-10 w-10'
											onClick={(e) => {
												e.stopPropagation()
												const link = document.createElement('a')
												link.href = image
												link.download = `${modelName}-${index + 1}.jpg`
												link.click()
											}}>
											<Download className='h-5 w-5' />
										</Button>
									</div>
								</div>

								{/* Image Number Badge */}
								<div className='absolute bottom-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
									<Badge variant='secondary' className='bg-background/80 backdrop-blur-sm'>
										{index + 1}/{images.length}
									</Badge>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		)
	}

	// Reference images exist but couldn't be resolved (old format)
	if (referenceImageCount > 0 && unresolvedCount > 0 && !isLoading) {
		return (
			<Card className='border-dashed border-amber-200 dark:border-amber-800'>
				<CardContent className='flex min-h-[200px] flex-col items-center justify-center p-12 text-center'>
					<div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900'>
						<ImageIcon className='h-6 w-6 text-amber-600 dark:text-amber-400' />
					</div>
					<h3 className='mb-2 text-lg font-semibold'>Reference images unavailable</h3>
					<p className='text-sm text-muted-foreground max-w-md'>
						This model was created with an older format. The {referenceImageCount} reference image(s) cannot be
						displayed. For new models, images will display correctly.
					</p>
				</CardContent>
			</Card>
		)
	}

	// Model is active but no images
	if (modelStatus === 'ACTIVE') {
		return (
			<Card className='border-dashed'>
				<CardContent className='flex min-h-[200px] flex-col items-center justify-center p-12 text-center'>
					<div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
						<ImageIcon className='h-6 w-6 text-muted-foreground' />
					</div>
					<h3 className='mb-2 text-lg font-semibold'>Model is ready</h3>
					<p className='text-sm text-muted-foreground max-w-md'>This model has been calibrated and is ready for use.</p>
				</CardContent>
			</Card>
		)
	}

	// No reference images at all
	if (referenceImageCount === 0) {
		return (
			<Card className='border-dashed'>
				<CardContent className='flex min-h-[200px] flex-col items-center justify-center p-12 text-center'>
					<div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
						<ImageIcon className='h-6 w-6 text-muted-foreground' />
					</div>
					<h3 className='mb-2 text-lg font-semibold'>No reference images</h3>
					<p className='text-sm text-muted-foreground max-w-md'>
						No reference images were added during model creation.
					</p>
				</CardContent>
			</Card>
		)
	}

	return null
}
