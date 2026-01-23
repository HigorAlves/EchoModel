'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, FileImage, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import { UPLOAD_CONFIG } from '../../constants'

interface ImageUploadZoneProps {
	images: Array<{
		id: string
		file?: File
		preview: string
		name: string
		size: number
		uploadProgress?: number
		assetId?: string
		storagePath?: string
	}>
	onAddImages: (files: File[]) => void
	onRemoveImage: (imageId: string) => void
	maxImages?: number
}

function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

export function ImageUploadZone({ images, onAddImages, onRemoveImage, maxImages = 5 }: ImageUploadZoneProps) {
	const [isDragOver, setIsDragOver] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const availableSlots = maxImages - images.length

	const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
		const valid: File[] = []
		const errors: string[] = []

		for (const file of files) {
			// Check file type
			if (!(UPLOAD_CONFIG.acceptedTypes as readonly string[]).includes(file.type)) {
				errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`)
				continue
			}

			// Check file size
			if (file.size > UPLOAD_CONFIG.maxFileSize) {
				errors.push(`${file.name}: File too large. Maximum size is 10MB.`)
				continue
			}

			valid.push(file)
		}

		return { valid, errors }
	}, [])

	const handleFiles = useCallback(
		(files: FileList | File[]) => {
			setError(null)

			const fileArray = Array.from(files)

			if (fileArray.length > availableSlots) {
				setError(`You can only add ${availableSlots} more image${availableSlots !== 1 ? 's' : ''}.`)
				return
			}

			const { valid, errors } = validateFiles(fileArray)

			if (errors.length > 0 && errors[0]) {
				setError(errors[0])
			}

			if (valid.length > 0) {
				onAddImages(valid)
			}
		},
		[availableSlots, validateFiles, onAddImages],
	)

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			setIsDragOver(false)

			if (e.dataTransfer.files) {
				handleFiles(e.dataTransfer.files)
			}
		},
		[handleFiles],
	)

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragOver(true)
	}, [])

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragOver(false)
	}, [])

	const handleFileInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files) {
				handleFiles(e.target.files)
			}
			// Reset input value so the same file can be selected again
			e.target.value = ''
		},
		[handleFiles],
	)

	return (
		<div className='space-y-4'>
			{/* Drop Zone */}
			<motion.div
				className={cn(
					'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
					isDragOver ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50',
					availableSlots === 0 && 'cursor-not-allowed opacity-50',
				)}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				whileHover={availableSlots > 0 ? { scale: 1.01 } : undefined}
				whileTap={availableSlots > 0 ? { scale: 0.99 } : undefined}>
				<input
					type='file'
					accept={UPLOAD_CONFIG.acceptedExtensions.join(',')}
					multiple
					onChange={handleFileInput}
					disabled={availableSlots === 0}
					className='absolute inset-0 cursor-pointer opacity-0'
				/>
				<motion.div
					initial={false}
					animate={{ scale: isDragOver ? 1.1 : 1 }}
					transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
					<Upload className={cn('mb-4 h-10 w-10', isDragOver ? 'text-primary' : 'text-muted-foreground')} />
				</motion.div>
				<p className={cn('mb-2 text-sm', isDragOver ? 'text-primary' : 'text-muted-foreground')}>
					{isDragOver ? 'Drop images here' : 'Drag and drop images here, or click to browse'}
				</p>
				<p className='text-muted-foreground text-xs'>
					Supports: JPEG, PNG, WebP (max 10MB each) - {availableSlots} slot
					{availableSlots !== 1 ? 's' : ''} remaining
				</p>
			</motion.div>

			{/* Error Message */}
			<AnimatePresence>
				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className='flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive text-sm'>
						<AlertCircle className='h-4 w-4 shrink-0' />
						{error}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Image Previews */}
			<AnimatePresence mode='popLayout'>
				{images.length > 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
						{images.map((image) => (
							<motion.div
								key={image.id}
								layout
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								transition={{ type: 'spring', stiffness: 300, damping: 25 }}
								className='group relative aspect-square overflow-hidden rounded-lg border bg-muted'>
								{/* Image Preview */}
								{/* biome-ignore lint/performance/noImgElement: Client-side preview from FileReader, not suitable for Next.js Image */}
								<img src={image.preview} alt={image.name} className='h-full w-full object-cover' />

								{/* Overlay with info */}
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100'>
									<div className='absolute bottom-0 left-0 right-0 p-2'>
										<p className='truncate text-xs font-medium text-white'>{image.name}</p>
										<p className='text-xs text-white/80'>{formatFileSize(image.size)}</p>
									</div>
								</div>

								{/* Upload Progress or Status */}
								{image.uploadProgress !== undefined && image.uploadProgress > 0 && image.uploadProgress < 100 && (
									<div className='absolute inset-0 flex items-center justify-center bg-black/50'>
										<div className='w-3/4'>
											<Progress value={image.uploadProgress} className='h-2' />
											<p className='mt-2 text-center text-xs text-white'>{image.uploadProgress}%</p>
										</div>
									</div>
								)}

								{/* Ready to Upload Badge */}
								{image.uploadProgress === 0 && !image.assetId && (
									<div className='absolute bottom-2 left-2 right-2'>
										<div className='rounded bg-blue-500/90 px-2 py-1 text-center text-xs text-white'>
											Ready to upload
										</div>
									</div>
								)}

								{/* Uploaded Badge */}
								{image.assetId && image.uploadProgress === 100 && (
									<div className='absolute bottom-2 left-2 right-2'>
										<div className='rounded bg-green-500/90 px-2 py-1 text-center text-xs text-white'>✓ Uploaded</div>
									</div>
								)}

								{/* Remove Button */}
								<button
									type='button'
									onClick={() => onRemoveImage(image.id)}
									className='absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-all hover:bg-black/80 group-hover:opacity-100'>
									<X className='h-3 w-3' />
								</button>

								{/* File Type Icon */}
								<div className='absolute left-2 top-2 rounded-full bg-black/60 p-1.5 text-white'>
									<FileImage className='h-3 w-3' />
								</div>
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
