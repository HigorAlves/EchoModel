'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
	ModelConfigurationCard,
	ModelDetailHeader,
	ModelImageGallery,
	ModelImageLightbox,
	ModelStatisticsCard,
	ModelStatusAlert,
	useLightbox,
	useModel,
	useModelImages,
} from '@/features/models'

export default function ModelDetailPage() {
	const params = useParams()
	const router = useRouter()
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('models')

	const modelId = params.id as string
	const { model, isLoading, error } = useModel(modelId)

	// Resolve model images (handles both storage paths and asset IDs)
	const { images, referenceImages, isLoading: isLoadingImages, hasGeneratedImages, unresolvedCount } = useModelImages({
		model,
	})

	// Lightbox state management
	const lightbox = useLightbox({ totalImages: images.length })

	// Set breadcrumbs
	useEffect(() => {
		setItems([{ label: t('breadcrumbs.models'), href: '/dashboard/models' }, { label: model?.name ?? 'Loading...' }])
	}, [setItems, t, model?.name])

	const navigateToModels = () => router.push('/dashboard/models')

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
					<AlertDescription>Failed to load model: {error.message}</AlertDescription>
				</Alert>
				<Button variant='outline' onClick={navigateToModels} className='self-start'>
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
				<Button variant='outline' onClick={navigateToModels} className='self-start'>
					<ArrowLeft className='mr-2 h-4 w-4' />
					Back to Models
				</Button>
			</div>
		)
	}

	return (
		<div className='flex flex-1 flex-col gap-8 p-4 pt-0'>
			{/* Header */}
			<ModelDetailHeader model={model} />

			{/* Main Content */}
			<div className='grid gap-8 lg:grid-cols-[1fr_320px]'>
				{/* Left: Images Section */}
				<div className='space-y-6'>
					{/* Status Alerts */}
					<ModelStatusAlert status={model.status} failureReason={model.failureReason} />

					{/* Image Gallery */}
					<ModelImageGallery
						images={images}
						modelName={model.name}
						isLoading={isLoadingImages}
						hasGeneratedImages={hasGeneratedImages}
						unresolvedCount={unresolvedCount}
						referenceImageCount={model.referenceImages?.length ?? 0}
						modelStatus={model.status}
						onImageClick={lightbox.open}
					/>
				</div>

				{/* Right: Sidebar with Model Details */}
				<div className='space-y-6'>
					<ModelStatisticsCard
						generatedImagesCount={model.generatedImages?.length ?? 0}
						createdAt={model.createdAt}
					/>
					<ModelConfigurationCard
						model={model}
						referenceImages={referenceImages}
						isLoadingImages={isLoadingImages}
					/>
				</div>
			</div>

			{/* Lightbox Dialog */}
			<ModelImageLightbox
				images={images}
				modelName={model.name}
				isOpen={lightbox.isOpen}
				currentIndex={lightbox.currentIndex}
				onClose={lightbox.close}
				onNext={lightbox.next}
				onPrevious={lightbox.previous}
			/>
		</div>
	)
}
