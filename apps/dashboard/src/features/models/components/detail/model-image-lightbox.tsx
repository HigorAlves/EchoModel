'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'

interface ModelImageLightboxProps {
	images: string[]
	modelName: string
	isOpen: boolean
	currentIndex: number
	onClose: () => void
	onNext: () => void
	onPrevious: () => void
}

export function ModelImageLightbox({
	images,
	modelName,
	isOpen,
	currentIndex,
	onClose,
	onNext,
	onPrevious,
}: ModelImageLightboxProps) {
	const currentImage = images[currentIndex]

	const handleDownload = () => {
		if (!currentImage) return
		const link = document.createElement('a')
		link.href = currentImage
		link.download = `${modelName}-${currentIndex + 1}.jpg`
		link.click()
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				className='max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0 sm:max-w-[95vw]'
				showCloseButton={false}>
				<AnimatePresence mode='wait'>
					{currentImage && (
						<motion.div
							key={currentIndex}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className='relative flex items-center justify-center min-h-[80vh]'>
							{/* biome-ignore lint/a11y/useAltText: Alt text is provided */}
							{/* biome-ignore lint/performance/noImgElement: Dynamic user-generated content */}
							<img
								src={currentImage}
								alt={`${modelName} - Image ${currentIndex + 1}`}
								className='max-h-[85vh] max-w-full object-contain'
							/>

							{/* Close button */}
							<DialogClose
								render={
									<Button variant='ghost' size='icon' className='absolute top-4 right-4 text-white hover:bg-white/20' />
								}>
								<X className='h-6 w-6' />
							</DialogClose>

							{/* Navigation arrows */}
							{images.length > 1 && (
								<>
									<Button
										variant='ghost'
										size='icon'
										className='absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12'
										onClick={onPrevious}>
										<ChevronLeft className='h-8 w-8' />
									</Button>
									<Button
										variant='ghost'
										size='icon'
										className='absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12'
										onClick={onNext}>
										<ChevronRight className='h-8 w-8' />
									</Button>
								</>
							)}

							{/* Image counter */}
							<div className='absolute bottom-4 left-1/2 -translate-x-1/2'>
								<Badge variant='secondary' className='bg-black/50 text-white backdrop-blur-sm'>
									{currentIndex + 1} / {images.length}
								</Badge>
							</div>

							{/* Download button */}
							<Button
								variant='ghost'
								size='icon'
								className='absolute bottom-4 right-4 text-white hover:bg-white/20'
								onClick={handleDownload}>
								<Download className='h-5 w-5' />
							</Button>
						</motion.div>
					)}
				</AnimatePresence>
			</DialogContent>
		</Dialog>
	)
}
