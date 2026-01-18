'use client'

import { MoreHorizontal, Plus, Search, Users } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
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
		generations: 24,
		createdAt: '2024-01-15',
		thumbnailUrl: null,
	},
	{
		id: '2',
		name: 'Marcus',
		description: 'Athletic, casual, streetwear focus',
		status: 'active' as const,
		gender: 'male',
		ageRange: '26-35',
		generations: 18,
		createdAt: '2024-01-10',
		thumbnailUrl: null,
	},
	{
		id: '3',
		name: 'Luna',
		description: 'Elegant, sophisticated, formal wear',
		status: 'calibrating' as const,
		gender: 'female',
		ageRange: '26-35',
		generations: 0,
		createdAt: '2024-01-18',
		thumbnailUrl: null,
	},
	{
		id: '4',
		name: 'Alex',
		description: 'Versatile, modern, gender-neutral aesthetic',
		status: 'draft' as const,
		gender: 'non-binary',
		ageRange: '18-25',
		generations: 0,
		createdAt: '2024-01-19',
		thumbnailUrl: null,
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
		<Card className='group relative'>
			<CardHeader>
				<div className='flex items-start justify-between'>
					<div className='flex items-center gap-3'>
						<div className='bg-muted flex h-12 w-12 items-center justify-center rounded-full'>
							{model.thumbnailUrl ? (
								<img src={model.thumbnailUrl} alt={model.name} className='h-12 w-12 rounded-full object-cover' />
							) : (
								<Users className='h-6 w-6' />
							)}
						</div>
						<div>
							<CardTitle className='text-lg'>{model.name}</CardTitle>
							<CardDescription>{model.description}</CardDescription>
						</div>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger render={<Button variant='ghost' size='icon' className='h-8 w-8' />}>
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
			</CardHeader>
			<CardContent>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4 text-sm'>
						<span className='text-muted-foreground'>
							{t('card.generations')}: {model.generations}
						</span>
						<span className='text-muted-foreground'>
							{t('card.created')}: {new Date(model.createdAt).toLocaleDateString()}
						</span>
					</div>
					<Badge className={statusColors[model.status]}>{t(`status.${model.status}`)}</Badge>
				</div>
			</CardContent>
		</Card>
	)
}

function EmptyState({ t }: { t: ReturnType<typeof useTranslations> }) {
	return (
		<Card className='flex flex-col items-center justify-center py-12'>
			<div className='bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
				<Users className='h-8 w-8' />
			</div>
			<CardTitle className='mb-2'>{t('empty.title')}</CardTitle>
			<CardDescription className='mb-4 text-center'>{t('empty.description')}</CardDescription>
			<Button render={<Link href='/dashboard/models/create' />}>
				<Plus className='mr-2 h-4 w-4' />
				{t('empty.createButton')}
			</Button>
		</Card>
	)
}

export default function ModelsPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('models')

	useEffect(() => {
		setItems([{ label: t('breadcrumbs.models'), href: '/dashboard/models' }, { label: t('breadcrumbs.all') }])
	}, [setItems, t])

	const hasModels = sampleModels.length > 0

	return (
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
			{/* Header */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>{t('title')}</h1>
					<p className='text-muted-foreground'>{t('subtitle')}</p>
				</div>
				<Button render={<Link href='/dashboard/models/create' />}>
					<Plus className='mr-2 h-4 w-4' />
					{t('actions.create')}
				</Button>
			</div>

			{/* Search and Filters */}
			{hasModels && (
				<div className='flex items-center gap-4'>
					<div className='relative flex-1'>
						<Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
						<Input placeholder='Search models...' className='pl-9' />
					</div>
				</div>
			)}

			{/* Models Grid */}
			{hasModels ? (
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					{sampleModels.map((model) => (
						<ModelCard key={model.id} model={model} t={t} />
					))}
				</div>
			) : (
				<EmptyState t={t} />
			)}
		</div>
	)
}
