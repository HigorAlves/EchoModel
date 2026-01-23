'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
	Filter,
	Grid3x3,
	Heart,
	List,
	Loader2,
	MoreHorizontal,
	Plus,
	Search,
	Sparkles,
	TrendingUp,
	Users,
	X,
	Zap,
	Eye,
	Star,
} from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useModels } from '@/features/models/hooks/use-models'
import { useCurrentStore } from '@/features/stores/hooks/use-stores'

// Sample model data - will be replaced with real data
const sampleModels = [
	{
		id: '1',
		name: 'Sofia',
		description: 'Young, confident, urban style',
		status: 'active' as const,
		gender: 'female',
		ageRange: '18-25',
		ethnicity: 'Caucasian',
		bodyType: 'Athletic',
		generations: 24,
		createdAt: '2024-01-15',
		thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
		images: [
			'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop',
		],
	},
	{
		id: '2',
		name: 'Marcus',
		description: 'Athletic, casual, streetwear focus',
		status: 'active' as const,
		gender: 'male',
		ageRange: '26-35',
		ethnicity: 'African American',
		bodyType: 'Athletic',
		generations: 18,
		createdAt: '2024-01-10',
		thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
		images: [
			'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=400&h=500&fit=crop',
		],
	},
	{
		id: '3',
		name: 'Luna',
		description: 'Elegant, sophisticated, formal wear',
		status: 'calibrating' as const,
		gender: 'female',
		ageRange: '26-35',
		ethnicity: 'Asian',
		bodyType: 'Slim',
		generations: 0,
		createdAt: '2024-01-18',
		thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop',
		images: [],
	},
	{
		id: '4',
		name: 'Alex',
		description: 'Versatile, modern, gender-neutral aesthetic',
		status: 'draft' as const,
		gender: 'non-binary',
		ageRange: '18-25',
		ethnicity: 'Hispanic',
		bodyType: 'Average',
		generations: 0,
		createdAt: '2024-01-19',
		thumbnailUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop',
		images: [],
	},
	{
		id: '5',
		name: 'Kai',
		description: 'Edgy, alternative fashion, tattoos',
		status: 'active' as const,
		gender: 'male',
		ageRange: '18-25',
		ethnicity: 'Asian',
		bodyType: 'Slim',
		generations: 32,
		createdAt: '2024-01-12',
		thumbnailUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
		images: [
			'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop',
		],
	},
	{
		id: '6',
		name: 'Emma',
		description: 'Classic beauty, timeless elegance',
		status: 'active' as const,
		gender: 'female',
		ageRange: '26-35',
		ethnicity: 'Caucasian',
		bodyType: 'Curvy',
		generations: 45,
		createdAt: '2024-01-08',
		thumbnailUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop',
		images: [
			'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1496440737103-cd596325d314?w=400&h=500&fit=crop',
		],
	},
]

type ViewMode = 'grid' | 'list'

type ModelCardProps = {
	id: string
	name: string
	description: string
	status: 'draft' | 'calibrating' | 'active' | 'failed' | 'archived'
	gender: string
	ageRange: string
	ethnicity: string
	bodyType: string
	generations: number
	createdAt: string
	images: string[]
	hasGeneratedImages?: boolean
	isReadyForGeneration?: boolean
}

function ModelCard({
	model,
	t,
	viewMode,
}: {
	model: ModelCardProps
	t: ReturnType<typeof useTranslations>
	viewMode: ViewMode
}) {
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)

	const statusColors = {
		draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
		calibrating: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
		active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
		failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
		archived: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
	}

	const statusIcons = {
		draft: Zap,
		calibrating: TrendingUp,
		active: Star,
		failed: X,
		archived: Users,
	}

	const StatusIcon = statusIcons[model.status]

	// List view - horizontal card
	if (viewMode === 'list') {
		return (
			<Card className='group overflow-hidden transition-all hover:shadow-lg'>
				<div className='flex gap-6 p-6'>
					{/* Image - Smaller in list view */}
					<Link href={`/dashboard/models/${model.id}`} className='shrink-0'>
						<div className='relative h-32 w-24 overflow-hidden rounded-lg bg-muted'>
							{model.images.length > 0 ? (
								// biome-ignore lint/performance/noImgElement: Dynamic user-generated content
								<img
									src={model.images[0]}
									alt={model.name}
									className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
								/>
							) : (
								<div className='flex h-full w-full items-center justify-center'>
									<Users className='h-12 w-12 text-muted-foreground/50' />
								</div>
							)}
						</div>
					</Link>

					{/* Content */}
					<div className='flex flex-1 flex-col justify-between'>
						<div>
							<div className='mb-2 flex items-start justify-between'>
								<div>
									<Link href={`/dashboard/models/${model.id}`}>
										<h3 className='text-xl font-semibold tracking-tight hover:text-primary'>{model.name}</h3>
									</Link>
									<p className='mt-1 text-sm text-muted-foreground'>{model.description}</p>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger
										render={
											<Button variant='ghost' size='icon-sm' className='shrink-0 hover:bg-muted' />
										}>
										<MoreHorizontal className='h-4 w-4' />
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end'>
										<DropdownMenuItem>{t('card.viewDetails')}</DropdownMenuItem>
										{model.status === 'active' && (
											<DropdownMenuItem>
												<Sparkles className='mr-2 h-4 w-4' />
												{t('card.generateImage')}
											</DropdownMenuItem>
										)}
										{model.status === 'draft' && <DropdownMenuItem>{t('card.startCalibration')}</DropdownMenuItem>}
										<DropdownMenuSeparator />
										<DropdownMenuItem>{t('actions.edit')}</DropdownMenuItem>
										<DropdownMenuItem className='text-destructive'>{t('actions.archive')}</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							<div className='flex flex-wrap gap-2'>
								<Badge variant='secondary' className='bg-secondary/80 text-secondary-foreground dark:bg-secondary/40 dark:text-foreground text-xs font-medium border-0'>
									{model.gender}
								</Badge>
								<Badge variant='secondary' className='bg-secondary/80 text-secondary-foreground dark:bg-secondary/40 dark:text-foreground text-xs font-medium border-0'>
									{model.ageRange}
								</Badge>
								<Badge variant='secondary' className='bg-secondary/80 text-secondary-foreground dark:bg-secondary/40 dark:text-foreground text-xs font-medium border-0'>
									{model.ethnicity}
								</Badge>
								<Badge variant='secondary' className='bg-secondary/80 text-secondary-foreground dark:bg-secondary/40 dark:text-foreground text-xs font-medium border-0'>
									{model.bodyType}
								</Badge>
							</div>
						</div>

						{/* Bottom Row */}
						<div className='mt-4 flex items-center justify-between'>
							<div className='flex items-center gap-6'>
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<Sparkles className='h-4 w-4 text-violet-500' />
									<span className='font-medium'>{model.generations}</span>
									<span className='text-xs'>generations</span>
								</div>
							</div>

							<Badge variant='outline' className={statusColors[model.status]}>
								<StatusIcon className='mr-1.5 h-3.5 w-3.5' />
								{t(`status.${model.status}`)}
							</Badge>
						</div>
					</div>
				</div>
			</Card>
		)
	}

	// Grid view - vertical card with carousel (like GenerationCard)
	return (
		<Card className='group relative flex h-full flex-col overflow-hidden transition-all hover:shadow-lg'>
			{/* Main Image Container - Fixed 4:5 aspect ratio */}
			<Link href={`/dashboard/models/${model.id}`} className='block'>
				<div className='relative aspect-[4/5] w-full overflow-hidden bg-muted'>
					{model.status === 'active' && model.images.length > 0 ? (
						<>
							{/* biome-ignore lint/performance/noImgElement: Dynamic user-generated content */}
							<img
								src={model.images[selectedImageIndex]}
								alt={model.name}
								className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
							/>

							{/* Image Counter Badge */}
							{model.images.length > 1 && (
								<div className='absolute bottom-3 right-3'>
									<Badge variant='secondary' className='bg-background/80 backdrop-blur-sm'>
										{selectedImageIndex + 1}/{model.images.length}
									</Badge>
								</div>
							)}
						</>
					) : model.status === 'calibrating' ? (
						<div className='flex h-full items-center justify-center'>
							<div className='text-center'>
								<Loader2 className='text-muted-foreground mx-auto mb-3 h-12 w-12 animate-spin' />
								<p className='text-muted-foreground text-sm font-medium'>Generating model...</p>
								<p className='text-muted-foreground mt-1 text-xs'>This may take a few minutes</p>
							</div>
						</div>
					) : model.status === 'failed' ? (
						<div className='flex h-full items-center justify-center'>
							<div className='text-center'>
								<div className='bg-destructive/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full'>
									<X className='text-destructive h-6 w-6' />
								</div>
								<p className='text-muted-foreground text-sm font-medium'>Generation failed</p>
								<p className='text-muted-foreground mt-1 text-xs'>Please try again</p>
							</div>
						</div>
					) : model.status === 'draft' ? (
						<div className='flex h-full items-center justify-center'>
							<div className='text-center'>
								<Zap className='text-muted-foreground mx-auto mb-3 h-12 w-12' />
								<p className='text-muted-foreground text-sm font-medium'>Draft model</p>
								<p className='text-muted-foreground mt-1 text-xs'>Start calibration to generate</p>
							</div>
						</div>
					) : (
						<div className='flex h-full items-center justify-center'>
							<Users className='text-muted-foreground h-16 w-16' />
						</div>
					)}

					{/* Status Badge Overlay */}
					<div className='absolute left-3 top-3'>
						<Badge className={statusColors[model.status]}>{t(`status.${model.status}`)}</Badge>
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
									{t('card.viewDetails')}
								</DropdownMenuItem>
								{model.status === 'active' && (
									<DropdownMenuItem>
										<Sparkles className='mr-2 h-4 w-4' />
										{t('card.generateImage')}
									</DropdownMenuItem>
								)}
								{model.status === 'draft' && <DropdownMenuItem>{t('card.startCalibration')}</DropdownMenuItem>}
								<DropdownMenuSeparator />
								<DropdownMenuItem>{t('actions.edit')}</DropdownMenuItem>
								<DropdownMenuItem className='text-destructive'>{t('actions.archive')}</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</Link>

			{/* Content Below Image - Flex grow to fill remaining space */}
			<div className='flex flex-1 flex-col p-4'>
				{/* Thumbnail Grid for Multiple Images */}
				{model.status === 'active' && model.images.length > 1 && (
					<div className='mb-3 grid grid-cols-4 gap-2'>
						{model.images.map((image, index) => (
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

				{/* Model Name and Description */}
				<div className='mb-3'>
					<div className='mb-1 flex items-center gap-2'>
						<h3 className='font-semibold'>{model.name}</h3>
					</div>
					<p className='text-muted-foreground line-clamp-2 text-sm'>{model.description}</p>
				</div>

				{/* Footer Stats - Push to bottom */}
				<div className='mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground'>
					<div className='flex items-center gap-2'>
						<Badge variant='secondary' className='text-xs'>
							{model.gender}
						</Badge>
						<Badge variant='secondary' className='text-xs'>
							{model.ageRange}
						</Badge>
					</div>
					<span className='text-xs'>{model.createdAt}</span>
				</div>
			</div>
		</Card>
	)
}

function EmptyState({ t }: { t: ReturnType<typeof useTranslations> }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='flex min-h-[500px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12'>
			<div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10'>
				<Users className='h-12 w-12 text-primary' />
			</div>
			<h3 className='mb-3 text-2xl font-bold'>{t('empty.title')}</h3>
			<p className='text-muted-foreground mb-8 max-w-md text-center'>{t('empty.description')}</p>
			<Button render={<Link href='/dashboard/models/create' />} size='lg' className='gap-2'>
				<Plus className='h-5 w-5' />
				{t('empty.createButton')}
			</Button>
			<div className='mt-8 flex items-center gap-6 text-sm text-muted-foreground'>
				<div className='flex items-center gap-2'>
					<Star className='h-4 w-4' />
					<span>AI-Powered</span>
				</div>
				<div className='flex items-center gap-2'>
					<Sparkles className='h-4 w-4' />
					<span>Consistent Results</span>
				</div>
				<div className='flex items-center gap-2'>
					<Zap className='h-4 w-4' />
					<span>Fast Generation</span>
				</div>
			</div>
		</motion.div>
	)
}

export default function ModelsPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('models')

	// View mode
	const [viewMode, setViewMode] = useState<ViewMode>('grid')
	const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'name' | 'generations'>('recent')

	// Filter state
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
	const [selectedGenders, setSelectedGenders] = useState<string[]>([])
	const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([])
	const [selectedEthnicities, setSelectedEthnicities] = useState<string[]>([])
	const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([])

	useEffect(() => {
		setItems([{ label: t('breadcrumbs.models'), href: '/dashboard/models' }, { label: t('breadcrumbs.all') }])
	}, [setItems, t])

	// Extract unique filter values from models
	const filterOptions = useMemo(() => {
		const statuses = [...new Set(sampleModels.map((m) => m.status))]
		const genders = [...new Set(sampleModels.map((m) => m.gender))]
		const ageRanges = [...new Set(sampleModels.map((m) => m.ageRange))]
		const ethnicities = [...new Set(sampleModels.map((m) => m.ethnicity))]
		const bodyTypes = [...new Set(sampleModels.map((m) => m.bodyType))]

		return { statuses, genders, ageRanges, ethnicities, bodyTypes }
	}, [])

	// Filter and sort models
	const filteredModels: ModelCardProps[] = useMemo(() => {
		let filtered = sampleModels.filter((model) => {
			// Search filter
			const matchesSearch =
				searchQuery === '' ||
				model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				model.description.toLowerCase().includes(searchQuery.toLowerCase())

			// Status filter
			const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(model.status)

			// Gender filter
			const matchesGender = selectedGenders.length === 0 || selectedGenders.includes(model.gender)

			// Age range filter
			const matchesAgeRange = selectedAgeRanges.length === 0 || selectedAgeRanges.includes(model.ageRange)

			// Ethnicity filter
			const matchesEthnicity = selectedEthnicities.length === 0 || selectedEthnicities.includes(model.ethnicity)

			// Body type filter
			const matchesBodyType = selectedBodyTypes.length === 0 || selectedBodyTypes.includes(model.bodyType)

			return matchesSearch && matchesStatus && matchesGender && matchesAgeRange && matchesEthnicity && matchesBodyType
		})

		// Apply sorting
		filtered = [...filtered].sort((a, b) => {
			switch (sortBy) {
				case 'recent':
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				case 'popular':
					return b.generations - a.generations
				case 'name':
					return a.name.localeCompare(b.name)
				case 'generations':
					return b.generations - a.generations
				default:
					return 0
			}
		})

		// Transform to ModelCardProps with images array
		return filtered.map((model) => ({
			...model,
			images: model.images && model.images.length > 0 ? model.images : (model.thumbnailUrl ? [model.thumbnailUrl] : []),
			hasGeneratedImages: (model.images?.length > 0 || !!model.thumbnailUrl) && model.status === 'active',
			isReadyForGeneration: model.status === 'active',
		}))
	}, [
		searchQuery,
		selectedStatuses,
		selectedGenders,
		selectedAgeRanges,
		selectedEthnicities,
		selectedBodyTypes,
		sortBy,
	])

	// Count active filters
	const activeFilterCount =
		selectedStatuses.length +
		selectedGenders.length +
		selectedAgeRanges.length +
		selectedEthnicities.length +
		selectedBodyTypes.length

	// Clear all filters
	const clearAllFilters = () => {
		setSearchQuery('')
		setSelectedStatuses([])
		setSelectedGenders([])
		setSelectedAgeRanges([])
		setSelectedEthnicities([])
		setSelectedBodyTypes([])
	}

	// Remove individual filter
	const removeFilter = (type: string, value: string) => {
		switch (type) {
			case 'status':
				setSelectedStatuses((prev) => prev.filter((v) => v !== value))
				break
			case 'gender':
				setSelectedGenders((prev) => prev.filter((v) => v !== value))
				break
			case 'ageRange':
				setSelectedAgeRanges((prev) => prev.filter((v) => v !== value))
				break
			case 'ethnicity':
				setSelectedEthnicities((prev) => prev.filter((v) => v !== value))
				break
			case 'bodyType':
				setSelectedBodyTypes((prev) => prev.filter((v) => v !== value))
				break
		}
	}

	const hasModels = sampleModels.length > 0

	return (
		<div className='flex flex-1 flex-col gap-8 p-4 pt-0'>
			{/* Header */}
			<div className='flex flex-col gap-6'>
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Model Catalog</h1>
						<p className='mt-1 text-muted-foreground'>Your AI fashion models collection</p>
					</div>
					<Button render={<Link href='/dashboard/models/create' />} nativeButton={false} size='lg' className='self-start sm:self-auto'>
						<Plus className='mr-2 h-5 w-5' />
						Create Model
					</Button>
				</div>

				{/* Stats Bar */}
				<div className='grid gap-4 sm:grid-cols-4'>
					<Card className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-muted-foreground'>Total Models</p>
								<p className='mt-1 text-2xl font-bold'>{sampleModels.length}</p>
							</div>
							<div className='rounded-full bg-primary/10 p-3'>
								<Users className='h-5 w-5 text-primary' />
							</div>
						</div>
					</Card>
					<Card className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-muted-foreground'>Active</p>
								<p className='mt-1 text-2xl font-bold'>{sampleModels.filter((m) => m.status === 'active').length}</p>
							</div>
							<div className='rounded-full bg-emerald-500/10 p-3'>
								<Star className='h-5 w-5 text-emerald-600' />
							</div>
						</div>
					</Card>
					<Card className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-muted-foreground'>Generations</p>
								<p className='mt-1 text-2xl font-bold'>
									{sampleModels.reduce((acc, m) => acc + m.generations, 0)}
								</p>
							</div>
							<div className='rounded-full bg-violet-500/10 p-3'>
								<Sparkles className='h-5 w-5 text-violet-600' />
							</div>
						</div>
					</Card>
					<Card className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-muted-foreground'>This Month</p>
								<p className='mt-1 text-2xl font-bold'>+{Math.floor(Math.random() * 20) + 10}</p>
							</div>
							<div className='rounded-full bg-blue-500/10 p-3'>
								<TrendingUp className='h-5 w-5 text-blue-600' />
							</div>
						</div>
					</Card>
				</div>
			</div>

			{/* Search and Filters */}
			{hasModels && (
				<div className='flex flex-col gap-4'>
					<div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
						{/* Search */}
						<div className='relative flex-1 max-w-md'>
							<Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
							<Input
								placeholder='Search by name or description...'
								className='pl-10 pr-4'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						{/* View Mode & Sort */}
						<div className='flex items-center gap-3'>
							{/* Sort Dropdown */}
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button variant='outline' size='default'>
											Sort: {sortBy === 'recent' ? 'Recent' : sortBy === 'popular' ? 'Popular' : sortBy === 'name' ? 'Name' : 'Generations'}
										</Button>
									}
								/>
								<DropdownMenuContent align='end'>
									<DropdownMenuLabel>Sort By</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => setSortBy('recent')}>Most Recent</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSortBy('popular')}>Most Popular</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSortBy('name')}>Name (A-Z)</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSortBy('generations')}>Most Generations</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							<Separator orientation='vertical' className='h-8' />

							{/* View Toggle */}
							<Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
								<TabsList>
									<TabsTrigger value='grid' className='gap-2'>
										<Grid3x3 className='h-4 w-4' />
										Grid
									</TabsTrigger>
									<TabsTrigger value='list' className='gap-2'>
										<List className='h-4 w-4' />
										List
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
					</div>

					{/* Filter Chips */}
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

							{/* Gender Filter */}
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button variant='outline' size='sm' className='h-9'>
											Gender
											{selectedGenders.length > 0 && (
												<Badge variant='secondary' className='ml-2 h-5 min-w-5 px-1 text-xs'>
													{selectedGenders.length}
												</Badge>
											)}
										</Button>
									}
								/>
								<DropdownMenuContent align='start' className='w-48'>
									<DropdownMenuLabel>Filter by Gender</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{filterOptions.genders.map((gender) => (
										<DropdownMenuCheckboxItem
											key={gender}
											checked={selectedGenders.includes(gender)}
											onCheckedChange={(checked) => {
												setSelectedGenders((prev) => (checked ? [...prev, gender] : prev.filter((g) => g !== gender)))
											}}>
											{gender}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Age Range Filter */}
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button variant='outline' size='sm' className='h-9'>
											Age
											{selectedAgeRanges.length > 0 && (
												<Badge variant='secondary' className='ml-2 h-5 min-w-5 px-1 text-xs'>
													{selectedAgeRanges.length}
												</Badge>
											)}
										</Button>
									}
								/>
								<DropdownMenuContent align='start' className='w-48'>
									<DropdownMenuLabel>Filter by Age Range</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{filterOptions.ageRanges.map((age) => (
										<DropdownMenuCheckboxItem
											key={age}
											checked={selectedAgeRanges.includes(age)}
											onCheckedChange={(checked) => {
												setSelectedAgeRanges((prev) => (checked ? [...prev, age] : prev.filter((a) => a !== age)))
											}}>
											{age}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Ethnicity Filter */}
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button variant='outline' size='sm' className='h-9'>
											Ethnicity
											{selectedEthnicities.length > 0 && (
												<Badge variant='secondary' className='ml-2 h-5 min-w-5 px-1 text-xs'>
													{selectedEthnicities.length}
												</Badge>
											)}
										</Button>
									}
								/>
								<DropdownMenuContent align='start' className='w-48'>
									<DropdownMenuLabel>Filter by Ethnicity</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{filterOptions.ethnicities.map((ethnicity) => (
										<DropdownMenuCheckboxItem
											key={ethnicity}
											checked={selectedEthnicities.includes(ethnicity)}
											onCheckedChange={(checked) => {
												setSelectedEthnicities((prev) =>
													checked ? [...prev, ethnicity] : prev.filter((e) => e !== ethnicity),
												)
											}}>
											{ethnicity}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Body Type Filter */}
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button variant='outline' size='sm' className='h-9'>
											Body Type
											{selectedBodyTypes.length > 0 && (
												<Badge variant='secondary' className='ml-2 h-5 min-w-5 px-1 text-xs'>
													{selectedBodyTypes.length}
												</Badge>
											)}
										</Button>
									}
								/>
								<DropdownMenuContent align='start' className='w-48'>
									<DropdownMenuLabel>Filter by Body Type</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{filterOptions.bodyTypes.map((bodyType) => (
										<DropdownMenuCheckboxItem
											key={bodyType}
											checked={selectedBodyTypes.includes(bodyType)}
											onCheckedChange={(checked) => {
												setSelectedBodyTypes((prev) =>
													checked ? [...prev, bodyType] : prev.filter((b) => b !== bodyType),
												)
											}}>
											{bodyType}
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
							{selectedGenders.map((gender) => (
								<Badge key={`gender-${gender}`} variant='secondary' className='gap-1'>
									{gender}
									<button
										type='button'
										onClick={() => removeFilter('gender', gender)}
										className='ml-1 hover:text-destructive'>
										<X className='h-3 w-3' />
									</button>
								</Badge>
							))}
							{selectedAgeRanges.map((age) => (
								<Badge key={`age-${age}`} variant='secondary' className='gap-1'>
									{age}
									<button
										type='button'
										onClick={() => removeFilter('ageRange', age)}
										className='ml-1 hover:text-destructive'>
										<X className='h-3 w-3' />
									</button>
								</Badge>
							))}
							{selectedEthnicities.map((ethnicity) => (
								<Badge key={`ethnicity-${ethnicity}`} variant='secondary' className='gap-1'>
									{ethnicity}
									<button
										type='button'
										onClick={() => removeFilter('ethnicity', ethnicity)}
										className='ml-1 hover:text-destructive'>
										<X className='h-3 w-3' />
									</button>
								</Badge>
							))}
							{selectedBodyTypes.map((bodyType) => (
								<Badge key={`bodyType-${bodyType}`} variant='secondary' className='gap-1'>
									{bodyType}
									<button
										type='button'
										onClick={() => removeFilter('bodyType', bodyType)}
										className='ml-1 hover:text-destructive'>
										<X className='h-3 w-3' />
									</button>
								</Badge>
							))}
						</div>
					)}

					{/* Results Count */}
					<div className='text-sm text-muted-foreground'>
						Showing {filteredModels.length} of {sampleModels.length} models
					</div>
				</div>
			)}

			{/* Models Grid/List */}
			{hasModels ? (
				filteredModels.length > 0 ? (
					<AnimatePresence mode='wait'>
						<motion.div
							key={viewMode}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className={
								viewMode === 'grid'
									? 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
									: 'flex flex-col gap-4'
							}>
							{filteredModels.map((model) => (
								<ModelCard key={model.id} model={model} t={t} viewMode={viewMode} />
							))}
						</motion.div>
					</AnimatePresence>
				) : (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}
						className='flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12'>
						<div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted'>
							<Search className='h-10 w-10 text-muted-foreground' />
						</div>
						<h3 className='mb-2 text-2xl font-bold'>No models found</h3>
						<p className='text-muted-foreground mb-6 max-w-md text-center'>
							Try adjusting your filters or search query to find what you're looking for.
						</p>
						<Button variant='outline' onClick={clearAllFilters} size='lg'>
							<X className='mr-2 h-4 w-4' />
							Clear all filters
						</Button>
					</motion.div>
				)
			) : (
				<EmptyState t={t} />
			)}
		</div>
	)
}
