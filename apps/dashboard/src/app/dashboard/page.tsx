'use client'

import { FolderOpen, ImagePlus, Plus, Sparkles, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function StatsCard({
	title,
	value,
	description,
	icon: Icon,
	trend,
}: {
	title: string
	value: string | number
	description?: string
	icon: React.ElementType
	trend?: { value: number; positive: boolean }
}) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between pb-2'>
				<CardTitle className='text-sm font-medium'>{title}</CardTitle>
				<Icon className='text-muted-foreground h-4 w-4' />
			</CardHeader>
			<CardContent>
				<div className='text-2xl font-bold'>{value}</div>
				{description && <p className='text-muted-foreground text-xs'>{description}</p>}
				{trend && (
					<div className={`flex items-center text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
						<TrendingUp className={`mr-1 h-3 w-3 ${!trend.positive && 'rotate-180'}`} />
						{trend.positive ? '+' : ''}
						{trend.value}% from last month
					</div>
				)}
			</CardContent>
		</Card>
	)
}

function QuickActionCard({
	title,
	description,
	icon: Icon,
	href,
}: {
	title: string
	description: string
	icon: React.ElementType
	href: string
}) {
	return (
		<Link href={href}>
			<Card className='hover:bg-muted/50 cursor-pointer transition-colors'>
				<CardContent className='flex items-center gap-4 pt-6'>
					<div className='bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg'>
						<Icon className='h-6 w-6' />
					</div>
					<div>
						<CardTitle className='text-base'>{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</div>
				</CardContent>
			</Card>
		</Link>
	)
}

function RecentActivityItem({
	type,
	title,
	timestamp,
	status,
}: {
	type: 'model' | 'generation' | 'asset'
	title: string
	timestamp: string
	status?: string
}) {
	const icons = {
		model: Users,
		generation: Sparkles,
		asset: FolderOpen,
	}
	const Icon = icons[type]

	return (
		<div className='flex items-center gap-4 py-3'>
			<div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full'>
				<Icon className='h-5 w-5' />
			</div>
			<div className='flex-1'>
				<p className='text-sm font-medium'>{title}</p>
				<p className='text-muted-foreground text-xs'>{timestamp}</p>
			</div>
			{status && (
				<span
					className={`rounded-full px-2 py-1 text-xs ${
						status === 'completed'
							? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
							: status === 'processing'
								? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
								: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
					}`}>
					{status}
				</span>
			)}
		</div>
	)
}

export default function DashboardPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('dashboard')
	const tStats = useTranslations('dashboard.stats')
	const tActions = useTranslations('dashboard.quickActions')
	const tActivity = useTranslations('dashboard.recentActivity')

	useEffect(() => {
		setItems([{ label: t('breadcrumbs.dashboard'), href: '/dashboard' }, { label: t('breadcrumbs.overview') }])
	}, [setItems, t])

	return (
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
			{/* Welcome Section */}
			<div className='flex flex-col gap-2'>
				<h1 className='text-2xl font-bold tracking-tight'>{t('welcome')}</h1>
				<p className='text-muted-foreground'>{t('welcomeSubtitle')}</p>
			</div>

			{/* Stats Grid */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<StatsCard title={tStats('totalModels')} value={3} description={`${tStats('activeModels')}: 2`} icon={Users} />
				<StatsCard
					title={tStats('totalGenerations')}
					value={47}
					description={`${tStats('thisMonth')}: 12`}
					icon={Sparkles}
					trend={{ value: 15, positive: true }}
				/>
				<StatsCard title={tStats('totalAssets')} value={156} icon={FolderOpen} />
				<StatsCard title={tStats('storageUsed')} value='2.4 GB' description='of 10 GB' icon={ImagePlus} />
			</div>

			{/* Main Content Grid */}
			<div className='grid gap-6 lg:grid-cols-3'>
				{/* Quick Actions */}
				<div className='lg:col-span-1'>
					<h2 className='mb-4 text-lg font-semibold'>{tActions('title')}</h2>
					<div className='flex flex-col gap-3'>
						<QuickActionCard
							title={tActions('createModel')}
							description='Create a new AI influencer'
							icon={Plus}
							href='/dashboard/models/create'
						/>
						<QuickActionCard
							title={tActions('generateImage')}
							description='Generate new images'
							icon={Sparkles}
							href='/dashboard/generations/new'
						/>
						<QuickActionCard
							title={tActions('uploadAsset')}
							description='Upload garments or references'
							icon={FolderOpen}
							href='/dashboard/assets'
						/>
					</div>
				</div>

				{/* Recent Activity */}
				<div className='lg:col-span-2'>
					<div className='mb-4 flex items-center justify-between'>
						<h2 className='text-lg font-semibold'>{tActivity('title')}</h2>
						<Button variant='ghost' size='sm'>
							{tActivity('viewAll')}
						</Button>
					</div>
					<Card>
						<CardContent className='divide-y pt-0'>
							<RecentActivityItem
								type='generation'
								title='Summer Collection - Beach Scene'
								timestamp='2 hours ago'
								status='completed'
							/>
							<RecentActivityItem
								type='model'
								title='Sofia - Calibration Started'
								timestamp='5 hours ago'
								status='processing'
							/>
							<RecentActivityItem
								type='asset'
								title='Red Summer Dress uploaded'
								timestamp='Yesterday'
								status='completed'
							/>
							<RecentActivityItem
								type='generation'
								title='Urban Style - Street Photography'
								timestamp='Yesterday'
								status='completed'
							/>
							<RecentActivityItem type='model' title='Marcus - Model Approved' timestamp='2 days ago' />
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
