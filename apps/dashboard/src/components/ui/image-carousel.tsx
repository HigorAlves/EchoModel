'use client'

import { useState } from 'react'
import { Badge } from './badge'

interface ImageCarouselProps {
	images: string[]
	alt: string
	aspectRatio?: 'square' | '4:5' | '9:16' | '1:1'
	showThumbnails?: boolean
	className?: string
}

export function ImageCarousel({
	images,
	alt,
	aspectRatio = '4:5',
	showThumbnails = true,
	className = '',
}: ImageCarouselProps) {
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)

	const aspectRatioClasses = {
		square: 'aspect-square',
		'4:5': 'aspect-[4/5]',
		'9:16': 'aspect-[9/16]',
		'1:1': 'aspect-square',
	}

	if (images.length === 0) {
		return null
	}

	return (
		<div className={className}>
			{/* Main Image */}
			<div className={`relative w-full overflow-hidden ${aspectRatioClasses[aspectRatio]}`}>
				{/* biome-ignore lint/performance/noImgElement: Dynamic user-generated content */}
				<img
					src={images[selectedImageIndex]}
					alt={`${alt} - ${selectedImageIndex + 1}`}
					className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
				/>

				{/* Image Counter Badge */}
				{images.length > 1 && (
					<div className='absolute bottom-3 right-3'>
						<Badge variant='secondary' className='bg-background/80 backdrop-blur-sm'>
							{selectedImageIndex + 1}/{images.length}
						</Badge>
					</div>
				)}
			</div>

			{/* Thumbnail Grid */}
			{showThumbnails && images.length > 1 && (
				<div className='mt-3 grid grid-cols-4 gap-2'>
					{images.map((image, index) => (
						<button
							type='button'
							// biome-ignore lint/suspicious/noArrayIndexKey: Image array order is stable
							key={index}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								setSelectedImageIndex(index)
							}}
							className={`relative aspect-square overflow-hidden rounded-md transition-all ${
								selectedImageIndex === index ? 'ring-2 ring-primary ring-offset-2' : 'opacity-60 hover:opacity-100'
							}`}>
							{/* biome-ignore lint/performance/noImgElement: Dynamic user-generated content */}
							<img src={image} alt={`Thumbnail ${index + 1}`} className='h-full w-full object-cover' />
						</button>
					))}
				</div>
			)}
		</div>
	)
}
