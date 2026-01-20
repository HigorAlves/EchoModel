'use client'

import {
	Calendar,
	Download,
	Eye,
	Filter,
	Image as ImageIcon,
	MoreHorizontal,
	Plus,
	Search,
	Sparkles,
	X,
} from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

// Sample generation data
const sampleGenerations = [
	{
		id: '1',
		modelName: 'Sofia',
		modelId: '1',
		scenePrompt: 'Summer beach photoshoot with flowy white dress and sunset lighting',
		status: 'completed' as const,
		imageCount: 4,
		aspectRatio: '4:5' as const,
		createdAt: '2024-01-18T10:30:00',
		images: [
			'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop',
		],
	},
	{
		id: '2',
		modelName: 'Marcus',
		modelId: '2',
		scenePrompt: 'Urban streetwear look in downtown setting with graffiti walls',
		status: 'completed' as const,
		imageCount: 4,
		aspectRatio: '9:16' as const,
		createdAt: '2024-01-18T14:00:00',
		images: [
			'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=300&h=533&fit=crop',
			'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=300&h=533&fit=crop',
			'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=300&h=533&fit=crop',
			'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=300&h=533&fit=crop',
		],
	},
	{
		id: '3',
		modelName: 'Luna',
		modelId: '3',
		scenePrompt: 'Elegant evening wear photoshoot in luxury hotel lobby',
		status: 'completed' as const,
		imageCount: 3,
		aspectRatio: '4:5' as const,
		createdAt: '2024-01-17T09:15:00',
		images: [
			'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&h=500&fit=crop',
		],
	},
	{
		id: '4',
		modelName: 'Emma',
		modelId: '6',
		scenePrompt: 'Casual denim outfit in natural outdoor setting with golden hour lighting',
		status: 'completed' as const,
		imageCount: 4,
		aspectRatio: '1:1' as const,
		createdAt: '2024-01-16T15:45:00',
		images: [
			'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop',
			'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?w=400&h=400&fit=crop',
			'https://images.unsplash.com/photo-1496440737103-cd596325d314?w=400&h=400&fit=crop',
			'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=400&h=400&fit=crop',
		],
	},
	{
		id: '5',
		modelName: 'Kai',
		modelId: '5',
		scenePrompt: 'Edgy leather jacket and ripped jeans in industrial warehouse',
		status: 'processing' as const,
		imageCount: 4,
		aspectRatio: '4:5' as const,
		createdAt: '2024-01-19T11:20:00',
		images: [],
	},
	{
		id: '6',
		modelName: 'Sofia',
		modelId: '1',
		scenePrompt: 'Bohemian maxi dress in desert landscape during sunset',
		status: 'completed' as const,
		imageCount: 4,
		aspectRatio: '4:5' as const,
		createdAt: '2024-01-15T08:30:00',
		images: [
			'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1494496195158-c3becb4f2475?w=400&h=500&fit=crop',
		],
	},
	{
		id: '7',
		modelName: 'Marcus',
		modelId: '2',
		scenePrompt: 'Athletic wear for sports campaign in modern gym environment',
		status: 'failed' as const,
		imageCount: 0,
		aspectRatio: '9:16' as const,
		createdAt: '2024-01-14T16:00:00',
		images: [],
	},
	{
		id: '8',
		modelName: 'Alex',
		modelId: '4',
		scenePrompt: 'Gender-neutral minimalist outfit in modern architecture setting',
		status: 'completed' as const,
		imageCount: 4,
		aspectRatio: '1:1' as const,
		createdAt: '2024-01-19T13:15:00',
		images: [
			'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
			'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=400&fit=crop',
			'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop',
			'https://images.unsplash.com/photo-1501127122-f385ca6ddd9d?w=400&h=400&fit=crop',
		],
	},
]

function GenerationCard({
	generation,
	t,
}: {
	generation: (typeof sampleGenerations)[0]
	t: ReturnType<typeof useTranslations>
}) {
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)

	const statusColors = {
		pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
		processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
		completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
		failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
	}

	return (
		<Card className='group relative flex h-full flex-col overflow-hidden'>
			{/* Main Image Container - Fixed 4:5 aspect ratio for consistency */}
			<div className='relative aspect-[4/5] w-full overflow-hidden bg-muted'>
				{generation.status === 'completed' && generation.images.length > 0 ? (
					<>
						{/* biome-ignore lint/performance/noImgElement: Dynamic user-generated content, not suitable for Next.js Image */}
						<img
							src={generation.images[selectedImageIndex]}
							alt={`${generation.modelName} - ${generation.scenePrompt}`}
							className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
						/>

						{/* Image Counter Badge */}
						{generation.images.length > 1 && (
							<div className='absolute bottom-3 right-3'>
								<Badge variant='secondary' className='bg-background/80 backdrop-blur-sm'>
									{selectedImageIndex + 1}/{generation.images.length}
								</Badge>
							</div>
						)}
					</>
				) : generation.status === 'processing' ? (
					<div className='flex h-full items-center justify-center'>
						<div className='text-center'>
							<Sparkles className='text-muted-foreground mx-auto mb-3 h-12 w-12 animate-pulse' />
							<p className='text-muted-foreground text-sm font-medium'>Generating images...</p>
							<p className='text-muted-foreground mt-1 text-xs'>This may take a few minutes</p>
						</div>
					</div>
				) : generation.status === 'failed' ? (
					<div className='flex h-full items-center justify-center'>
						<div className='text-center'>
							<div className='bg-destructive/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full'>
								<X className='text-destructive h-6 w-6' />
							</div>
							<p className='text-muted-foreground text-sm font-medium'>Generation failed</p>
							<p className='text-muted-foreground mt-1 text-xs'>Please try again</p>
						</div>
					</div>
				) : (
					<div className='flex h-full items-center justify-center'>
						<ImageIcon className='text-muted-foreground h-16 w-16' />
					</div>
				)}

				{/* Status Badge Overlay */}
				<div className='absolute left-3 top-3'>
					<Badge className={statusColors[generation.status]}>{t(`status.${generation.status}`)}</Badge>
				</div>

				{/* Actions Menu Overlay */}
				<div className='absolute right-3 top-3'>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									variant='ghost'
									size='icon-sm'
									className='bg-background/80 backdrop-blur-sm hover:bg-background'
								/>
							}>
							<MoreHorizontal className='h-4 w-4' />
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem>
								<Eye className='mr-2 h-4 w-4' />
								{t('card.viewImages')}
							</DropdownMenuItem>
							{generation.status === 'completed' && (
								<DropdownMenuItem>
									<Download className='mr-2 h-4 w-4' />
									{t('card.download')}
								</DropdownMenuItem>
							)}
							<DropdownMenuItem>{t('card.regenerate')}</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Content Below Image - Flex grow to fill remaining space */}
			<div className='flex flex-1 flex-col p-4'>
				{/* Thumbnail Grid for Multiple Images */}
				{generation.status === 'completed' && generation.images.length > 1 && (
					<div className='mb-3 grid grid-cols-4 gap-2'>
						{generation.images.map((image, index) => (
							<button
								type='button'
								// biome-ignore lint/suspicious/noArrayIndexKey: Image array order is stable and won't be reordered
								key={index}
								onClick={() => setSelectedImageIndex(index)}
								className={`relative aspect-square overflow-hidden rounded-md transition-all ${
									selectedImageIndex === index ? 'ring-2 ring-primary ring-offset-2' : 'opacity-60 hover:opacity-100'
								}`}>
								{/* biome-ignore lint/performance/noImgElement: Dynamic user-generated content, not suitable for Next.js Image */}
								<img src={image} alt={`Thumbnail ${index + 1}`} className='h-full w-full object-cover' />
							</button>
						))}
					</div>
				)}

				{/* Model and Prompt */}
				<div className='mb-3'>
					<div className='mb-1 flex items-center gap-2'>
						<h3 className='font-semibold'>{generation.modelName}</h3>
						<span className='text-muted-foreground text-xs'>•</span>
						<span className='text-muted-foreground text-xs'>{generation.aspectRatio}</span>
					</div>
					<p className='text-muted-foreground line-clamp-2 text-sm'>{generation.scenePrompt}</p>
				</div>

				{/* Footer Stats - Push to bottom */}
				<div className='mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground'>
					<div className='flex items-center gap-3'>
						<div className='flex items-center gap-1'>
							<ImageIcon className='h-3.5 w-3.5' />
							<span>{generation.imageCount}</span>
						</div>
						<div className='flex items-center gap-1'>
							<Calendar className='h-3.5 w-3.5' />
							<span>{new Date(generation.createdAt).toLocaleDateString()}</span>
						</div>
					</div>
					<span className='text-xs'>
						{new Date(generation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</span>
				</div>
			</div>
		</Card>
	)
}

function EmptyState({ t }: { t: ReturnType<typeof useTranslations> }) {
	return (
		<div className='flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-12'>
			<div className='bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
				<Sparkles className='h-8 w-8 text-muted-foreground' />
			</div>
			<h3 className='mb-2 text-xl font-semibold'>{t('empty.title')}</h3>
			<p className='text-muted-foreground mb-6 max-w-md text-center text-sm'>{t('empty.description')}</p>
			<Button render={<Link href='/dashboard/generations/new' />} size='lg'>
				<Plus className='mr-2 h-4 w-4' />
				{t('empty.createButton')}
			</Button>
		</div>
	)
}

export default function GenerationsPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('generations')

	// Filter state
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
	const [selectedModels, setSelectedModels] = useState<string[]>([])
	const [selectedAspectRatios, setSelectedAspectRatios] = useState<string[]>([])

	useEffect(() => {
		setItems([{ label: t('breadcrumbs.generations'), href: '/dashboard/generations' }, { label: t('breadcrumbs.all') }])
	}, [setItems, t])

	// Extract unique filter values
	const filterOptions = useMemo(() => {
		const statuses = [...new Set(sampleGenerations.map((g) => g.status))]
		const models = [...new Set(sampleGenerations.map((g) => g.modelName))]
		const aspectRatios = [...new Set(sampleGenerations.map((g) => g.aspectRatio))]

		return { statuses, models, aspectRatios }
	}, [])

	// Filter generations
	const filteredGenerations = useMemo(() => {
		return sampleGenerations.filter((generation) => {
			// Search filter
			const matchesSearch =
				searchQuery === '' ||
				generation.scenePrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
				generation.modelName.toLowerCase().includes(searchQuery.toLowerCase())

			// Status filter
			const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(generation.status)

			// Model filter
			const matchesModel = selectedModels.length === 0 || selectedModels.includes(generation.modelName)

			// Aspect ratio filter
			const matchesAspectRatio =
				selectedAspectRatios.length === 0 || selectedAspectRatios.includes(generation.aspectRatio)

			return matchesSearch && matchesStatus && matchesModel && matchesAspectRatio
		})
	}, [searchQuery, selectedStatuses, selectedModels, selectedAspectRatios])

	// Count active filters
	const activeFilterCount = selectedStatuses.length + selectedModels.length + selectedAspectRatios.length

	// Clear all filters
	const clearAllFilters = () => {
		setSearchQuery('')
		setSelectedStatuses([])
		setSelectedModels([])
		setSelectedAspectRatios([])
	}

	// Remove individual filter
	const removeFilter = (type: string, value: string) => {
		switch (type) {
			case 'status':
				setSelectedStatuses((prev) => prev.filter((v) => v !== value))
				break
			case 'model':
				setSelectedModels((prev) => prev.filter((v) => v !== value))
				break
			case 'aspectRatio':
				setSelectedAspectRatios((prev) => prev.filter((v) => v !== value))
				break
		}
	}

	const hasGenerations = sampleGenerations.length > 0

	return (
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
			{/* Header */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>{t('title')}</h1>
					<p className='text-muted-foreground'>{t('subtitle')}</p>
				</div>
				<Button render={<Link href='/dashboard/generations/new' />} size='default'>
					<Plus className='mr-2 h-4 w-4' />
					New Generation
				</Button>
			</div>

			{/* Search and Filters */}
			{hasGenerations && (
				<div className='flex flex-col gap-4'>
					<div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
						{/* Search */}
						<div className='relative flex-1 max-w-md'>
							<Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
							<Input
								placeholder='Search generations...'
								className='pl-9'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						{/* Filter Dropdowns */}
						<div className='flex flex-wrap items-center gap-2'>
							{/* Status Filter */}
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button variant='outline' size='sm' className='h-9'>
											<Filter className='mr-2 h-4 w-4' />
											Status
											{selectedStatuses.length > 0 && (
												<Badge variant='secondary' className='ml-2 h-5 min-w-5 px-1 text-xs'>
													{selectedStatuses.length}
												</Badge>
											)}
										</Button>
									}
								/>
								<DropdownMenuContent align='start' className='w-48'>
									<DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{filterOptions.statuses.map((status) => (
										<DropdownMenuCheckboxItem
											key={status}
											checked={selectedStatuses.includes(status)}
											onCheckedChange={(checked) => {
												setSelectedStatuses((prev) => (checked ? [...prev, status] : prev.filter((s) => s !== status)))
											}}>
											{t(`status.${status}`)}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Model Filter */}
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button variant='outline' size='sm' className='h-9'>
											Model
											{selectedModels.length > 0 && (
												<Badge variant='secondary' className='ml-2 h-5 min-w-5 px-1 text-xs'>
													{selectedModels.length}
												</Badge>
											)}
										</Button>
									}
								/>
								<DropdownMenuContent align='start' className='w-48'>
									<DropdownMenuLabel>Filter by Model</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{filterOptions.models.map((model) => (
										<DropdownMenuCheckboxItem
											key={model}
											checked={selectedModels.includes(model)}
											onCheckedChange={(checked) => {
												setSelectedModels((prev) => (checked ? [...prev, model] : prev.filter((m) => m !== model)))
											}}>
											{model}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Aspect Ratio Filter */}
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button variant='outline' size='sm' className='h-9'>
											Aspect Ratio
											{selectedAspectRatios.length > 0 && (
												<Badge variant='secondary' className='ml-2 h-5 min-w-5 px-1 text-xs'>
													{selectedAspectRatios.length}
												</Badge>
											)}
										</Button>
									}
								/>
								<DropdownMenuContent align='start' className='w-48'>
									<DropdownMenuLabel>Filter by Aspect Ratio</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{filterOptions.aspectRatios.map((ratio) => (
										<DropdownMenuCheckboxItem
											key={ratio}
											checked={selectedAspectRatios.includes(ratio)}
											onCheckedChange={(checked) => {
												setSelectedAspectRatios((prev) =>
													checked ? [...prev, ratio] : prev.filter((r) => r !== ratio),
												)
											}}>
											{ratio}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Clear Filters */}
							{activeFilterCount > 0 && (
								<Button variant='ghost' size='sm' onClick={clearAllFilters} className='h-9'>
									Clear all
									<X className='ml-2 h-4 w-4' />
								</Button>
							)}
						</div>
					</div>

					{/* Active Filters Display */}
					{activeFilterCount > 0 && (
						<div className='flex flex-wrap items-center gap-2'>
							<span className='text-sm text-muted-foreground'>Active filters:</span>
							{selectedStatuses.map((status) => (
								<Badge key={`status-${status}`} variant='secondary' className='gap-1'>
									{t(`status.${status}`)}
									<button
										type='button'
										onClick={() => removeFilter('status', status)}
										className='ml-1 hover:text-destructive'>
										<X className='h-3 w-3' />
									</button>
								</Badge>
							))}
							{selectedModels.map((model) => (
								<Badge key={`model-${model}`} variant='secondary' className='gap-1'>
									{model}
									<button
										type='button'
										onClick={() => removeFilter('model', model)}
										className='ml-1 hover:text-destructive'>
										<X className='h-3 w-3' />
									</button>
								</Badge>
							))}
							{selectedAspectRatios.map((ratio) => (
								<Badge key={`ratio-${ratio}`} variant='secondary' className='gap-1'>
									{ratio}
									<button
										type='button'
										onClick={() => removeFilter('aspectRatio', ratio)}
										className='ml-1 hover:text-destructive'>
										<X className='h-3 w-3' />
									</button>
								</Badge>
							))}
						</div>
					)}

					{/* Results Count */}
					<div className='text-sm text-muted-foreground'>
						Showing {filteredGenerations.length} of {sampleGenerations.length} generations
					</div>
				</div>
			)}

			{/* Generations Grid */}
			{hasGenerations ? (
				filteredGenerations.length > 0 ? (
					<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
						{filteredGenerations.map((generation) => (
							<GenerationCard key={generation.id} generation={generation} t={t} />
						))}
					</div>
				) : (
					<div className='flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-12'>
						<div className='bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
							<Search className='h-8 w-8 text-muted-foreground' />
						</div>
						<h3 className='mb-2 text-xl font-semibold'>No generations found</h3>
						<p className='text-muted-foreground mb-6 max-w-md text-center text-sm'>
							Try adjusting your filters or search query to find what you're looking for.
						</p>
						<Button variant='outline' onClick={clearAllFilters}>
							Clear all filters
						</Button>
					</div>
				)
			) : (
				<EmptyState t={t} />
			)}
		</div>
	)
}
