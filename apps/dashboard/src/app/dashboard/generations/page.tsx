'use client'

import { Download, Eye, MoreHorizontal, Plus, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

// Sample generation data
const sampleGenerations = [
	{
		id: '1',
		modelName: 'Sofia',
		scenePrompt: 'Summer beach photoshoot with casual vibes',
		status: 'completed' as const,
		imageCount: 4,
		aspectRatio: '4:5',
		createdAt: '2024-01-18T10:30:00',
		thumbnails: ['/placeholder1.jpg', '/placeholder2.jpg', '/placeholder3.jpg', '/placeholder4.jpg'],
	},
	{
		id: '2',
		modelName: 'Marcus',
		scenePrompt: 'Urban streetwear look in downtown setting',
		status: 'processing' as const,
		imageCount: 2,
		aspectRatio: '9:16',
		createdAt: '2024-01-18T14:00:00',
		thumbnails: [],
	},
	{
		id: '3',
		modelName: 'Sofia',
		scenePrompt: 'Professional office setting with modern decor',
		status: 'completed' as const,
		imageCount: 3,
		aspectRatio: '4:5',
		createdAt: '2024-01-17T09:15:00',
		thumbnails: ['/placeholder1.jpg', '/placeholder2.jpg', '/placeholder3.jpg'],
	},
]

function GenerationCard({
	generation,
	t,
}: {
	generation: (typeof sampleGenerations)[0]
	t: ReturnType<typeof useTranslations>
}) {
	const statusColors = {
		pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
		processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
		completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
		failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
	}

	return (
		<Card>
			<CardHeader className='pb-3'>
				<div className='flex items-start justify-between'>
					<div>
						<CardTitle className='text-base'>{generation.scenePrompt}</CardTitle>
						<CardDescription>
							{t('card.model')}: {generation.modelName}
						</CardDescription>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger render={<Button variant='ghost' size='icon' className='h-8 w-8' />}>
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
			</CardHeader>
			<CardContent>
				{/* Thumbnail Grid */}
				<div className='bg-muted mb-4 grid grid-cols-4 gap-1 overflow-hidden rounded-lg'>
					{generation.status === 'completed' ? (
						generation.thumbnails.map((_, i) => <div key={i} className='bg-muted-foreground/10 aspect-square' />)
					) : (
						<div className='col-span-4 flex items-center justify-center py-8'>
							<div className='text-center'>
								<Sparkles className='text-muted-foreground mx-auto mb-2 h-8 w-8 animate-pulse' />
								<p className='text-muted-foreground text-sm'>Generating...</p>
							</div>
						</div>
					)}
				</div>

				{/* Footer Info */}
				<div className='flex items-center justify-between text-sm'>
					<div className='text-muted-foreground flex items-center gap-4'>
						<span>
							{t('card.images')}: {generation.imageCount}
						</span>
						<span>{generation.aspectRatio}</span>
						<span>
							{t('card.created')}: {new Date(generation.createdAt).toLocaleDateString()}
						</span>
					</div>
					<Badge className={statusColors[generation.status]}>{t(`status.${generation.status}`)}</Badge>
				</div>
			</CardContent>
		</Card>
	)
}

function EmptyState({ t }: { t: ReturnType<typeof useTranslations> }) {
	return (
		<Card className='flex flex-col items-center justify-center py-12'>
			<div className='bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
				<Sparkles className='h-8 w-8' />
			</div>
			<CardTitle className='mb-2'>{t('empty.title')}</CardTitle>
			<CardDescription className='mb-4 text-center'>{t('empty.description')}</CardDescription>
			<Button render={<Link href='/dashboard/generations/new' />}>
				<Plus className='mr-2 h-4 w-4' />
				{t('empty.createButton')}
			</Button>
		</Card>
	)
}

export default function GenerationsPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('generations')

	useEffect(() => {
		setItems([{ label: t('breadcrumbs.generations'), href: '/dashboard/generations' }, { label: t('breadcrumbs.all') }])
	}, [setItems, t])

	const hasGenerations = sampleGenerations.length > 0

	return (
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
			{/* Header */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>{t('title')}</h1>
					<p className='text-muted-foreground'>{t('subtitle')}</p>
				</div>
				<Button render={<Link href='/dashboard/generations/new' />}>
					<Plus className='mr-2 h-4 w-4' />
					New Generation
				</Button>
			</div>

			{/* Search */}
			{hasGenerations && (
				<div className='flex items-center gap-4'>
					<div className='relative flex-1'>
						<Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
						<Input placeholder='Search generations...' className='pl-9' />
					</div>
				</div>
			)}

			{/* Generations Grid */}
			{hasGenerations ? (
				<div className='grid gap-4 md:grid-cols-2'>
					{sampleGenerations.map((generation) => (
						<GenerationCard key={generation.id} generation={generation} t={t} />
					))}
				</div>
			) : (
				<EmptyState t={t} />
			)}
		</div>
	)
}
