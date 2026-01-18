'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'

export default function DashboardPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('dashboard.breadcrumbs')

	useEffect(() => {
		setItems([{ label: t('buildingYourApplication'), href: '#' }, { label: t('dataFetching') }])
	}, [setItems, t])

	return (
		<div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
			<div className='grid auto-rows-min gap-4 md:grid-cols-3'>
				<div className='bg-muted/50 aspect-video rounded-xl' />
				<div className='bg-muted/50 aspect-video rounded-xl' />
				<div className='bg-muted/50 aspect-video rounded-xl' />
			</div>
			<div className='bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min' />
		</div>
	)
}
