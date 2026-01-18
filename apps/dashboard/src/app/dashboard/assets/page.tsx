'use client'

import { Download, FolderOpen, MoreHorizontal, Search, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Sample assets data
const sampleAssets = [
	{
		id: '1',
		filename: 'red-summer-dress.jpg',
		category: 'garment' as const,
		status: 'ready' as const,
		sizeBytes: 2456789,
		uploadedAt: '2024-01-18T10:30:00',
		thumbnailUrl: null,
	},
	{
		id: '2',
		filename: 'sofia-beach-1.jpg',
		category: 'generated' as const,
		status: 'ready' as const,
		sizeBytes: 3245678,
		uploadedAt: '2024-01-18T14:00:00',
		thumbnailUrl: null,
	},
	{
		id: '3',
		filename: 'model-reference-01.jpg',
		category: 'modelReference' as const,
		status: 'ready' as const,
		sizeBytes: 1876543,
		uploadedAt: '2024-01-17T09:15:00',
		thumbnailUrl: null,
	},
	{
		id: '4',
		filename: 'blue-blazer.jpg',
		category: 'garment' as const,
		status: 'processing' as const,
		sizeBytes: 2123456,
		uploadedAt: '2024-01-18T15:00:00',
		thumbnailUrl: null,
	},
]

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function AssetCard({ asset, t }: { asset: (typeof sampleAssets)[0]; t: ReturnType<typeof useTranslations> }) {
	const statusColors = {
		pendingUpload: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
		uploaded: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
		processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
		ready: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
		failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
	}

	const categoryLabels = {
		garment: t('categories.garment'),
		generated: t('categories.generated'),
		modelReference: t('categories.modelReference'),
		calibration: t('categories.calibration'),
		storeLogo: t('categories.storeLogo'),
	}

	return (
		<Card className='group overflow-hidden'>
			{/* Thumbnail */}
			<div className='bg-muted relative aspect-square'>
				{asset.thumbnailUrl ? (
					<Image src={asset.thumbnailUrl} alt={asset.filename} fill className='object-cover' />
				) : (
					<div className='flex h-full w-full items-center justify-center'>
						<FolderOpen className='text-muted-foreground h-12 w-12' />
					</div>
				)}
				{/* Hover Actions */}
				<div className='absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
					<Button size='icon' variant='secondary'>
						<Download className='h-4 w-4' />
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger render={<Button size='icon' variant='secondary' />}>
							<MoreHorizontal className='h-4 w-4' />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem>{t('card.viewDetails')}</DropdownMenuItem>
							<DropdownMenuItem>{t('card.download')}</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className='text-destructive'>
								<Trash2 className='mr-2 h-4 w-4' />
								{t('card.delete')}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<CardContent className='p-3'>
				<p className='mb-1 truncate text-sm font-medium' title={asset.filename}>
					{asset.filename}
				</p>
				<div className='flex items-center justify-between'>
					<span className='text-muted-foreground text-xs'>{formatFileSize(asset.sizeBytes)}</span>
					<Badge variant='outline' className={`text-xs ${statusColors[asset.status]}`}>
						{categoryLabels[asset.category]}
					</Badge>
				</div>
			</CardContent>
		</Card>
	)
}

function EmptyState({ t }: { t: ReturnType<typeof useTranslations> }) {
	return (
		<Card className='flex flex-col items-center justify-center py-12'>
			<div className='bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
				<FolderOpen className='h-8 w-8' />
			</div>
			<CardTitle className='mb-2'>{t('empty.title')}</CardTitle>
			<CardDescription className='mb-4 text-center'>{t('empty.description')}</CardDescription>
			<Button>
				<Upload className='mr-2 h-4 w-4' />
				{t('empty.uploadButton')}
			</Button>
		</Card>
	)
}

function UploadZone({ t }: { t: ReturnType<typeof useTranslations> }) {
	return (
		<div className='border-muted hover:border-primary/50 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors'>
			<Upload className='text-muted-foreground mb-4 h-10 w-10' />
			<p className='text-muted-foreground mb-1'>{t('upload.dragDrop')}</p>
			<p className='text-muted-foreground text-sm'>{t('upload.or')}</p>
			<Button variant='outline' className='mt-4'>
				{t('upload.browse')}
			</Button>
			<p className='text-muted-foreground mt-4 text-xs'>
				{t('upload.supportedFormats')} - {t('upload.maxSize')}
			</p>
		</div>
	)
}

export default function AssetsPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('assets')

	const [activeTab, setActiveTab] = useState('all')
	const [showUpload, setShowUpload] = useState(false)

	useEffect(() => {
		setItems([{ label: t('breadcrumbs.assets'), href: '/dashboard/assets' }, { label: t('breadcrumbs.all') }])
	}, [setItems, t])

	const filterAssets = (category: string) => {
		if (category === 'all') return sampleAssets
		return sampleAssets.filter((asset) => asset.category === category)
	}

	const filteredAssets = filterAssets(activeTab)

	return (
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
			{/* Header */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>{t('title')}</h1>
					<p className='text-muted-foreground'>{t('subtitle')}</p>
				</div>
				<Button onClick={() => setShowUpload(!showUpload)}>
					<Upload className='mr-2 h-4 w-4' />
					{t('upload.title')}
				</Button>
			</div>

			{/* Upload Zone */}
			{showUpload && (
				<Card>
					<CardContent className='p-4'>
						<UploadZone t={t} />
					</CardContent>
				</Card>
			)}

			{/* Tabs and Search */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value='all'>{t('categories.all')}</TabsTrigger>
						<TabsTrigger value='garment'>{t('categories.garment')}</TabsTrigger>
						<TabsTrigger value='generated'>{t('categories.generated')}</TabsTrigger>
						<TabsTrigger value='modelReference'>{t('categories.modelReference')}</TabsTrigger>
					</TabsList>
				</Tabs>
				<div className='relative w-full sm:w-64'>
					<Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
					<Input placeholder='Search assets...' className='pl-9' />
				</div>
			</div>

			{/* Assets Grid */}
			{filteredAssets.length > 0 ? (
				<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
					{filteredAssets.map((asset) => (
						<AssetCard key={asset.id} asset={asset} t={t} />
					))}
				</div>
			) : (
				<EmptyState t={t} />
			)}
		</div>
	)
}
