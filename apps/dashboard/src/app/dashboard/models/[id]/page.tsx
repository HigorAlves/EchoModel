'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
	ArrowLeft,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Download,
	Edit,
	ImageIcon,
	Loader2,
	MoreHorizontal,
	Settings,
	Sparkles,
	Star,
	TrendingUp,
	Users,
	X,
	Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogClose,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useResolvedAssetUrls, useStorageUrls } from '@/features/assets'
import { useModel } from '@/features/models/hooks/use-models'

export default function ModelDetailPage() {
	const params = useParams()
	const router = useRouter()
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('models')

	const modelId = params.id as string
	const { model, isLoading, error } = useModel(modelId)

	// Separate reference images into storage paths (new format) and asset IDs (old format)
	const referenceImageIds = model?.referenceImages ?? []
	const storagePaths = referenceImageIds.filter((id) => id.includes('/'))
	const assetIds = referenceImageIds.filter((id) => !id.includes('/'))

	// Resolve storage paths to download URLs (new format)
	const { urls: storageUrls, isLoading: isLoadingStorageUrls } = useStorageUrls(storagePaths)

	// Resolve asset IDs to URLs (old format - for backwards compatibility)
	const { urls: assetUrls, isLoading: isLoadingAssetUrls } = useResolvedAssetUrls(assetIds)

	// Combined loading state
	const isResolvingUrls = isLoadingStorageUrls || isLoadingAssetUrls

	// Combine resolved URLs from both sources
	const resolvedReferenceUrls = new Map([...assetUrls, ...storageUrls])

	// Lightbox state
	const [lightboxOpen, setLightboxOpen] = useState(false)
	const [lightboxIndex, setLightboxIndex] = useState(0)

	// Set breadcrumbs
	useEffect(() => {
		setItems([
			{ label: t('breadcrumbs.models'), href: '/dashboard/models' },
			{ label: model?.name ?? 'Loading...' },
		])
	}, [setItems, t, model?.name])

	// Build resolved reference image URLs array (memoized for keyboard handler)
	const resolvedReferenceImagesForNav = referenceImageIds
		.map((id) => resolvedReferenceUrls.get(id))
		.filter((url): url is string => !!url)
	const allImagesForNav = model?.generatedImages?.length
		? model.generatedImages
		: resolvedReferenceImagesForNav

	// Keyboard navigation for lightbox
	useEffect(() => {
		if (!lightboxOpen || allImagesForNav.length === 0) return

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				setLightboxIndex((prev) =>
					prev > 0 ? prev - 1 : allImagesForNav.length - 1
				)
			} else if (e.key === 'ArrowRight') {
				setLightboxIndex((prev) =>
					prev < allImagesForNav.length - 1 ? prev + 1 : 0
				)
			} else if (e.key === 'Escape') {
				setLightboxOpen(false)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [lightboxOpen, allImagesForNav.length])

	const openLightbox = useCallback((index: number) => {
		setLightboxIndex(index)
		setLightboxOpen(true)
	}, [])

	const statusColors = {
		DRAFT: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
		CALIBRATING: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
		ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
		FAILED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
		ARCHIVED: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
	}

	const statusIcons = {
		DRAFT: Zap,
		CALIBRATING: TrendingUp,
		ACTIVE: Star,
		FAILED: X,
		ARCHIVED: Users,
	}

	// Loading state
	if (isLoading) {
		return (
			<div className='flex flex-1 flex-col gap-8 p-4 pt-0'>
				<div className='flex items-center justify-center min-h-[500px]'>
					<div className='flex flex-col items-center gap-4'>
						<Loader2 className='h-12 w-12 animate-spin text-primary' />
						<p className='text-muted-foreground'>Loading model...</p>
					</div>
				</div>
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className='flex flex-1 flex-col gap-8 p-4 pt-0'>
				<Alert variant='destructive'>
					<AlertDescription>
						Failed to load model: {error.message}
					</AlertDescription>
				</Alert>
				<Button
					variant='outline'
					onClick={() => router.push('/dashboard/models')}
					className='self-start'
				>
					<ArrowLeft className='mr-2 h-4 w-4' />
					Back to Models
				</Button>
			</div>
		)
	}

	// Not found state
	if (!model) {
		return (
			<div className='flex flex-1 flex-col gap-8 p-4 pt-0'>
				<Alert>
					<AlertDescription>Model not found</AlertDescription>
				</Alert>
				<Button
					variant='outline'
					onClick={() => router.push('/dashboard/models')}
					className='self-start'
				>
					<ArrowLeft className='mr-2 h-4 w-4' />
					Back to Models
				</Button>
			</div>
		)
	}

	const StatusIcon = statusIcons[model.status]

	// Build resolved reference image URLs array
	const resolvedReferenceImages = referenceImageIds
		.map((id) => resolvedReferenceUrls.get(id))
		.filter((url): url is string => !!url)

	// Use generated images if available, otherwise use resolved reference images
	const allImages = model.generatedImages?.length > 0
		? model.generatedImages
		: resolvedReferenceImages

	const formatDate = (date: Date | null | undefined) => {
		if (!date) return 'N/A'
		if (date instanceof Date) return date.toLocaleDateString()
		return String(date).split('T')[0]
	}

	return (
		<div className='flex flex-1 flex-col gap-8 p-4 pt-0'>
			{/* Header */}
			<div className='flex flex-col gap-4'>
				<div className='flex items-center gap-4'>
					<Button
						variant='ghost'
						size='icon'
						onClick={() => router.push('/dashboard/models')}
					>
						<ArrowLeft className='h-5 w-5' />
					</Button>
					<div className='flex-1'>
						<div className='flex items-center gap-3'>
							<h1 className='text-3xl font-bold tracking-tight'>{model.name}</h1>
							<Badge className={statusColors[model.status]}>
								<StatusIcon className='mr-1.5 h-3.5 w-3.5' />
								{t(`status.${model.status.toLowerCase()}`)}
							</Badge>
						</div>
						{model.description && (
							<p className='mt-1 text-muted-foreground'>{model.description}</p>
						)}
					</div>
					<div className='flex items-center gap-2'>
						{model.status === 'ACTIVE' && (
							<Button render={<Link href={`/dashboard/generations/new?modelId=${model.id}`} />} nativeButton={false}>
								<Sparkles className='mr-2 h-4 w-4' />
								Generate Images
							</Button>
						)}
						<DropdownMenu>
							<DropdownMenuTrigger
								render={<Button variant='outline' size='icon' />}
							>
								<MoreHorizontal className='h-4 w-4' />
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem>
									<Edit className='mr-2 h-4 w-4' />
									Edit Model
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Settings className='mr-2 h-4 w-4' />
									Settings
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className='text-destructive'>
									Archive Model
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Model Attributes */}
				<div className='flex flex-wrap items-center gap-2'>
					<Badge variant='secondary'>{model.gender}</Badge>
					<Badge variant='secondary'>{model.ageRange}</Badge>
					<Badge variant='secondary'>{model.ethnicity}</Badge>
					<Badge variant='secondary'>{model.bodyType}</Badge>
					<Separator orientation='vertical' className='h-4' />
					<span className='text-sm text-muted-foreground'>
						Created {formatDate(model.createdAt)}
					</span>
				</div>
			</div>

			{/* Main Content */}
			<div className='grid gap-8 lg:grid-cols-[1fr_320px]'>
				{/* Left: Images Section */}
				<div className='space-y-6'>
					{/* Status-specific content */}
					{model.status === 'CALIBRATING' && (
						<Card className='border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'>
							<CardContent className='flex items-center gap-4 p-6'>
								<div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
									<Loader2 className='h-6 w-6 animate-spin text-blue-600 dark:text-blue-400' />
								</div>
								<div>
									<h3 className='font-semibold text-blue-900 dark:text-blue-100'>
										Model is being generated
									</h3>
									<p className='text-sm text-blue-700 dark:text-blue-300'>
										This process may take a few minutes. You'll be notified when it's ready.
									</p>
								</div>
							</CardContent>
						</Card>
					)}

					{model.status === 'FAILED' && (
						<Card className='border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20'>
							<CardContent className='flex items-center gap-4 p-6'>
								<div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900'>
									<X className='h-6 w-6 text-red-600 dark:text-red-400' />
								</div>
								<div className='flex-1'>
									<h3 className='font-semibold text-red-900 dark:text-red-100'>
										Model generation failed
									</h3>
									<p className='text-sm text-red-700 dark:text-red-300'>
										{model.failureReason ?? 'An unknown error occurred. Please try again.'}
									</p>
								</div>
								<Button variant='outline' size='sm'>
									Retry
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Generated Images - Masonry Layout */}
					{isResolvingUrls && referenceImageIds.length > 0 && !model.generatedImages?.length ? (
						<Card className='border-dashed'>
							<CardContent className='flex min-h-[200px] flex-col items-center justify-center p-12 text-center'>
								<Loader2 className='h-8 w-8 animate-spin text-muted-foreground mb-4' />
								<p className='text-sm text-muted-foreground'>Loading images...</p>
							</CardContent>
						</Card>
					) : allImages.length > 0 ? (
						<div>
							<div className='mb-4 flex items-center justify-between'>
								<h2 className='text-xl font-semibold'>
									{model.generatedImages?.length > 0 ? 'Generated Images' : 'Reference Images'}
								</h2>
								<span className='text-sm text-muted-foreground'>
									{allImages.length} images
								</span>
							</div>

							{/* Masonry Grid using CSS columns */}
							<div className='columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4'>
								{allImages.map((image, index) => (
									<motion.div
										key={image}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3, delay: index * 0.05 }}
										className='mb-4 break-inside-avoid'
									>
										<div
											className='group relative cursor-pointer overflow-hidden rounded-xl bg-muted'
											onClick={() => openLightbox(index)}
											onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
											role='button'
											tabIndex={0}
										>
											{/* biome-ignore lint/performance/noImgElement: Dynamic user-generated content */}
											<img
												src={image}
												alt={`${model.name} - Image ${index + 1}`}
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
															openLightbox(index)
														}}
													>
														<ImageIcon className='h-5 w-5' />
													</Button>
													<Button
														variant='secondary'
														size='icon'
														className='h-10 w-10'
														onClick={(e) => {
															e.stopPropagation()
															// Download logic
															const link = document.createElement('a')
															link.href = image
															link.download = `${model.name}-${index + 1}.jpg`
															link.click()
														}}
													>
														<Download className='h-5 w-5' />
													</Button>
												</div>
											</div>

											{/* Image Number Badge */}
											<div className='absolute bottom-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
												<Badge variant='secondary' className='bg-background/80 backdrop-blur-sm'>
													{index + 1}/{allImages.length}
												</Badge>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</div>
					) : referenceImageIds.length > 0 && resolvedReferenceImages.length === 0 && !isResolvingUrls ? (
						// Reference images exist in Firestore but couldn't be resolved (old format)
						<Card className='border-dashed border-amber-200 dark:border-amber-800'>
							<CardContent className='flex min-h-[200px] flex-col items-center justify-center p-12 text-center'>
								<div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900'>
									<ImageIcon className='h-6 w-6 text-amber-600 dark:text-amber-400' />
								</div>
								<h3 className='mb-2 text-lg font-semibold'>Reference images unavailable</h3>
								<p className='text-sm text-muted-foreground max-w-md'>
									This model was created with an older format. The {referenceImageIds.length} reference image(s)
									cannot be displayed. For new models, images will display correctly.
								</p>
							</CardContent>
						</Card>
					) : model.status === 'ACTIVE' ? (
						<Card className='border-dashed'>
							<CardContent className='flex min-h-[300px] flex-col items-center justify-center p-12 text-center'>
								<div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
									<ImageIcon className='h-8 w-8 text-muted-foreground' />
								</div>
								<h3 className='mb-2 text-xl font-semibold'>No images generated yet</h3>
								<p className='mb-6 text-sm text-muted-foreground max-w-md'>
									Start generating images with this model to see them here.
								</p>
								<Button render={<Link href={`/dashboard/generations/new?modelId=${model.id}`} />} nativeButton={false}>
									<Sparkles className='mr-2 h-4 w-4' />
									Generate First Image
								</Button>
							</CardContent>
						</Card>
					) : referenceImageIds.length === 0 ? (
						// No reference images at all
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
					) : null}
				</div>

				{/* Right: Sidebar with Model Details */}
				<div className='space-y-6'>
					{/* Quick Stats */}
					<Card>
						<CardHeader>
							<CardTitle className='text-base'>Statistics</CardTitle>
						</CardHeader>
						<CardContent className='grid gap-4'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<ImageIcon className='h-4 w-4' />
									<span>Generated Images</span>
								</div>
								<span className='font-semibold'>{model.generatedImages?.length ?? 0}</span>
							</div>
							<Separator />
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<Sparkles className='h-4 w-4' />
									<span>Total Generations</span>
								</div>
								<span className='font-semibold'>0</span>
							</div>
							<Separator />
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<Calendar className='h-4 w-4' />
									<span>Created</span>
								</div>
								<span className='text-sm'>{formatDate(model.createdAt)}</span>
							</div>
						</CardContent>
					</Card>

					{/* Model Configuration */}
					<Card>
						<CardHeader>
							<CardTitle className='text-base'>Configuration</CardTitle>
							<CardDescription>AI generation settings</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div>
								<h4 className='mb-2 text-sm font-medium text-muted-foreground'>Appearance</h4>
								<div className='space-y-2 text-sm'>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>Gender</span>
										<span>{model.gender}</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>Age Range</span>
										<span>{model.ageRange}</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>Ethnicity</span>
										<span>{model.ethnicity}</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>Body Type</span>
										<span>{model.bodyType}</span>
									</div>
								</div>
							</div>

							{model.prompt && (
								<>
									<Separator />
									<div>
										<h4 className='mb-2 text-sm font-medium text-muted-foreground'>Prompt</h4>
										<p className='text-sm'>{model.prompt}</p>
									</div>
								</>
							)}

							{resolvedReferenceImages.length > 0 && (
								<>
									<Separator />
									<div>
										<h4 className='mb-2 text-sm font-medium text-muted-foreground'>
											Reference Images
										</h4>
										{isResolvingUrls ? (
											<div className='flex items-center justify-center py-4'>
												<Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
											</div>
										) : (
											<>
												<div className='grid grid-cols-3 gap-2'>
													{resolvedReferenceImages.slice(0, 6).map((url, idx) => (
														<div
															key={url}
															className='relative aspect-square overflow-hidden rounded-md bg-muted'
														>
															{/* biome-ignore lint/performance/noImgElement: Dynamic user-generated content */}
															<img
																src={url}
																alt={`Reference ${idx + 1}`}
																className='h-full w-full object-cover'
															/>
														</div>
													))}
												</div>
												{resolvedReferenceImages.length > 6 && (
													<p className='mt-2 text-xs text-muted-foreground'>
														+{resolvedReferenceImages.length - 6} more
													</p>
												)}
											</>
										)}
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Lightbox Dialog */}
			<Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
				<DialogContent
					className='max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0 sm:max-w-[95vw]'
					showCloseButton={false}
				>
					<AnimatePresence mode='wait'>
						{allImages[lightboxIndex] && (
							<motion.div
								key={lightboxIndex}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className='relative flex items-center justify-center min-h-[80vh]'
							>
								{/* biome-ignore lint/performance/noImgElement: Dynamic user-generated content */}
								<img
									src={allImages[lightboxIndex]}
									alt={`${model.name} - Image ${lightboxIndex + 1}`}
									className='max-h-[85vh] max-w-full object-contain'
								/>

								{/* Close button */}
								<DialogClose
									render={
										<Button
											variant='ghost'
											size='icon'
											className='absolute top-4 right-4 text-white hover:bg-white/20'
										/>
									}
								>
									<X className='h-6 w-6' />
								</DialogClose>

								{/* Navigation arrows */}
								{allImages.length > 1 && (
									<>
										<Button
											variant='ghost'
											size='icon'
											className='absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12'
											onClick={() =>
												setLightboxIndex((prev) =>
													prev > 0 ? prev - 1 : allImages.length - 1
												)
											}
										>
											<ChevronLeft className='h-8 w-8' />
										</Button>
										<Button
											variant='ghost'
											size='icon'
											className='absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12'
											onClick={() =>
												setLightboxIndex((prev) =>
													prev < allImages.length - 1 ? prev + 1 : 0
												)
											}
										>
											<ChevronRight className='h-8 w-8' />
										</Button>
									</>
								)}

								{/* Image counter */}
								<div className='absolute bottom-4 left-1/2 -translate-x-1/2'>
									<Badge
										variant='secondary'
										className='bg-black/50 text-white backdrop-blur-sm'
									>
										{lightboxIndex + 1} / {allImages.length}
									</Badge>
								</div>

								{/* Download button */}
								<Button
									variant='ghost'
									size='icon'
									className='absolute bottom-4 right-4 text-white hover:bg-white/20'
									onClick={() => {
										const imageUrl = allImages[lightboxIndex]
										if (!imageUrl) return
										const link = document.createElement('a')
										link.href = imageUrl
										link.download = `${model.name}-${lightboxIndex + 1}.jpg`
										link.click()
									}}
								>
									<Download className='h-5 w-5' />
								</Button>
							</motion.div>
						)}
					</AnimatePresence>
				</DialogContent>
			</Dialog>
		</div>
	)
}
