'use client'

import { Filter, Heart, MoreHorizontal, Plus, Search, Sparkles, Users, X } from 'lucide-react'
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

function ModelCard({ model, t }: { model: (typeof sampleModels)[0]; t: ReturnType<typeof useTranslations> }) {
	const statusColors = {
		draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
		calibrating: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
		active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
		failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
		archived: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
	}

	return (
		<Card className='group relative overflow-hidden'>
			{/* Image Container - Instagram-like */}
			<div className='relative aspect-[4/5] w-full overflow-hidden bg-muted'>
				{model.thumbnailUrl ? (
					// biome-ignore lint/performance/noImgElement: Dynamic user-generated content from Firebase Storage, not suitable for Next.js Image
					<img
						src={model.thumbnailUrl}
						alt={model.name}
						className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
					/>
				) : (
					<div className='flex h-full w-full items-center justify-center'>
						<Users className='h-16 w-16 text-muted-foreground' />
					</div>
				)}

				{/* Status Badge Overlay */}
				<div className='absolute right-3 top-3'>
					<Badge className={statusColors[model.status]}>{t(`status.${model.status}`)}</Badge>
				</div>

				{/* Actions Menu Overlay */}
				<div className='absolute right-3 top-12'>
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
							<DropdownMenuItem>{t('card.viewDetails')}</DropdownMenuItem>
							{model.status === 'active' && <DropdownMenuItem>{t('card.generateImage')}</DropdownMenuItem>}
							{model.status === 'draft' && <DropdownMenuItem>{t('card.startCalibration')}</DropdownMenuItem>}
							<DropdownMenuSeparator />
							<DropdownMenuItem>{t('actions.edit')}</DropdownMenuItem>
							<DropdownMenuItem className='text-destructive'>{t('actions.archive')}</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Content Below Image */}
			<div className='p-4'>
				{/* Model Name and Description */}
				<div className='mb-3'>
					<h3 className='mb-1 text-lg font-semibold'>{model.name}</h3>
					<p className='text-muted-foreground text-sm'>{model.description}</p>
				</div>

				{/* Model Attributes */}
				<div className='mb-3 flex flex-wrap gap-2'>
					<Badge variant='outline' className='text-xs'>
						{model.gender}
					</Badge>
					<Badge variant='outline' className='text-xs'>
						{model.ageRange}
					</Badge>
					<Badge variant='outline' className='text-xs'>
						{model.ethnicity}
					</Badge>
					<Badge variant='outline' className='text-xs'>
						{model.bodyType}
					</Badge>
				</div>

				{/* Stats */}
				<div className='flex items-center justify-between border-t pt-3'>
					<div className='flex items-center gap-4 text-sm text-muted-foreground'>
						<div className='flex items-center gap-1'>
							<Sparkles className='h-4 w-4' />
							<span>{model.generations}</span>
						</div>
						<div className='flex items-center gap-1'>
							<Heart className='h-4 w-4' />
							<span>{Math.floor(Math.random() * 100)}</span>
						</div>
					</div>
					<span className='text-xs text-muted-foreground'>{new Date(model.createdAt).toLocaleDateString()}</span>
				</div>
			</div>
		</Card>
	)
}

function EmptyState({ t }: { t: ReturnType<typeof useTranslations> }) {
	return (
		<div className='flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-12'>
			<div className='bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
				<Users className='h-8 w-8 text-muted-foreground' />
			</div>
			<h3 className='mb-2 text-xl font-semibold'>{t('empty.title')}</h3>
			<p className='text-muted-foreground mb-6 max-w-md text-center text-sm'>{t('empty.description')}</p>
			<Button render={<Link href='/dashboard/models/create' />} size='lg'>
				<Plus className='mr-2 h-4 w-4' />
				{t('empty.createButton')}
			</Button>
		</div>
	)
}

export default function ModelsPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('models')

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

	// Filter models based on search and filters
	const filteredModels = useMemo(() => {
		return sampleModels.filter((model) => {
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
	}, [searchQuery, selectedStatuses, selectedGenders, selectedAgeRanges, selectedEthnicities, selectedBodyTypes])

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
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
			{/* Header */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>{t('title')}</h1>
					<p className='text-muted-foreground'>{t('subtitle')}</p>
				</div>
				<Button render={<Link href='/dashboard/models/create' />} size='default'>
					<Plus className='mr-2 h-4 w-4' />
					{t('actions.create')}
				</Button>
			</div>

			{/* Search and Filters */}
			{hasModels && (
				<div className='flex flex-col gap-4'>
					<div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
						{/* Search */}
						<div className='relative flex-1 max-w-md'>
							<Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
							<Input
								placeholder='Search models...'
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

			{/* Models Grid - Instagram-like Layout */}
			{hasModels ? (
				filteredModels.length > 0 ? (
					<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
						{filteredModels.map((model) => (
							<ModelCard key={model.id} model={model} t={t} />
						))}
					</div>
				) : (
					<div className='flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-12'>
						<div className='bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
							<Search className='h-8 w-8 text-muted-foreground' />
						</div>
						<h3 className='mb-2 text-xl font-semibold'>No models found</h3>
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
