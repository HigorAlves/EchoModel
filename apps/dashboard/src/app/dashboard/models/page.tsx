'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
	Filter,
	Grid3x3,
	Heart,
	List,
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
	},
]

type ViewMode = 'grid' | 'list'

function ModelCard({
	model,
	t,
	viewMode,
}: {
	model: (typeof sampleModels)[0]
	t: ReturnType<typeof useTranslations>
	viewMode: ViewMode
}) {
	const statusColors = {
		draft: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
		calibrating:
			'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
		active:
			'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
		failed: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800/50',
		archived:
			'bg-gray-50 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400 border-gray-200 dark:border-gray-800/50',
	}

	const statusIcons = {
		draft: Zap,
		calibrating: TrendingUp,
		active: Star,
		failed: X,
		archived: Users,
	}

	const StatusIcon = statusIcons[model.status]

	if (viewMode === 'list') {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				transition={{ duration: 0.2 }}
				className='group'>
				<Card className='overflow-hidden transition-all hover:shadow-lg'>
					<div className='flex gap-6 p-6'>
						{/* Image - Smaller in list view */}
						<div className='relative h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-muted'>
							{model.thumbnailUrl ? (
								// biome-ignore lint/performance/noImgElement: Dynamic user-generated content
								<img
									src={model.thumbnailUrl}
									alt={model.name}
									className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
								/>
							) : (
								<div className='flex h-full w-full items-center justify-center'>
									<Users className='h-12 w-12 text-muted-foreground/50' />
								</div>
							)}
						</div>

						{/* Content */}
						<div className='flex flex-1 flex-col justify-between'>
							<div>
								<div className='mb-2 flex items-start justify-between'>
									<div>
										<h3 className='text-xl font-semibold tracking-tight'>{model.name}</h3>
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
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-6'>
									<div className='flex items-center gap-2 text-sm text-muted-foreground'>
										<Sparkles className='h-4 w-4 text-violet-500' />
										<span className='font-medium'>{model.generations}</span>
										<span className='text-xs'>generations</span>
									</div>
									<div className='flex items-center gap-2 text-sm text-muted-foreground'>
										<Eye className='h-4 w-4 text-blue-500' />
										<span className='font-medium'>{Math.floor(Math.random() * 1000)}</span>
										<span className='text-xs'>views</span>
									</div>
									<div className='flex items-center gap-2 text-sm text-muted-foreground'>
										<Heart className='h-4 w-4 text-rose-500' />
										<span className='font-medium'>{Math.floor(Math.random() * 100)}</span>
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
			</motion.div>
		)
	}

	// Grid view
	return (
		<motion.div
			layout
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.3 }}
			className='group'>
			<Card className='overflow-hidden transition-all hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-black/40 hover:-translate-y-1'>
				{/* Image Container */}
				<Link href={`/dashboard/models/${model.id}`} className='block'>
					<div className='relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-muted/50 via-muted to-muted/80'>
						{model.thumbnailUrl ? (
							<>
								{/* biome-ignore lint/performance/noImgElement: Dynamic user-generated content */}
								<img
									src={model.thumbnailUrl}
									alt={model.name}
									className='h-full w-full object-cover transition-all duration-700 group-hover:scale-110'
								/>
								{/* Subtle vignette effect */}
								<div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none' />
							</>
						) : (
							<div className='flex h-full w-full items-center justify-center'>
								<Users className='h-20 w-20 text-muted-foreground/30' />
							</div>
						)}

						{/* Gradient Overlay on Hover */}
						<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

						{/* Status Badge */}
						<div className='absolute left-3 top-3 z-10'>
							<Badge variant='outline' className={`${statusColors[model.status]} backdrop-blur-md shadow-lg`}>
								<StatusIcon className='mr-1.5 h-3 w-3' />
								{t(`status.${model.status}`)}
							</Badge>
						</div>

						{/* Quick Actions - Show on Hover */}
						<div className='absolute right-3 top-3 z-10 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2'>
							<Button
								variant='ghost'
								size='icon-sm'
								className='h-8 w-8 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md hover:bg-white dark:hover:bg-gray-900 shadow-lg'>
								<Heart className='h-4 w-4' />
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button
											variant='ghost'
											size='icon-sm'
											className='h-8 w-8 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md hover:bg-white dark:hover:bg-gray-900 shadow-lg'
										/>
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

						{/* Stats Overlay - Show on Hover */}
						<div className='absolute bottom-0 left-0 right-0 z-10 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0'>
							<div className='flex items-center gap-5 text-white drop-shadow-lg'>
								<div className='flex items-center gap-2'>
									<div className='rounded-full bg-violet-500/90 p-1.5'>
										<Sparkles className='h-3.5 w-3.5' />
									</div>
									<div className='flex flex-col'>
										<span className='text-xs text-white/80'>Generations</span>
										<span className='text-sm font-bold'>{model.generations}</span>
									</div>
								</div>
								<div className='flex items-center gap-2'>
									<div className='rounded-full bg-blue-500/90 p-1.5'>
										<Eye className='h-3.5 w-3.5' />
									</div>
									<div className='flex flex-col'>
										<span className='text-xs text-white/80'>Views</span>
										<span className='text-sm font-bold'>{Math.floor(Math.random() * 1000)}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Link>

				{/* Content */}
				<div className='p-5'>
					<Link href={`/dashboard/models/${model.id}`} className='block'>
						<h3 className='mb-2 text-xl font-bold tracking-tight transition-colors hover:text-primary'>
							{model.name}
						</h3>
					</Link>
					<p className='mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground'>{model.description}</p>

					{/* Attributes */}
					<div className='flex flex-wrap gap-2'>
						<Badge variant='secondary' className='bg-secondary/80 text-secondary-foreground dark:bg-secondary/40 dark:text-foreground text-xs font-medium px-2.5 py-0.5 border-0'>
							{model.gender}
						</Badge>
						<Badge variant='secondary' className='bg-secondary/80 text-secondary-foreground dark:bg-secondary/40 dark:text-foreground text-xs font-medium px-2.5 py-0.5 border-0'>
							{model.ageRange}
						</Badge>
						<Badge variant='secondary' className='bg-secondary/80 text-secondary-foreground dark:bg-secondary/40 dark:text-foreground text-xs font-medium px-2.5 py-0.5 border-0'>
							{model.ethnicity}
						</Badge>
					</div>
				</div>
			</Card>
		</motion.div>
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
	const filteredModels = useMemo(() => {
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

		return filtered
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
