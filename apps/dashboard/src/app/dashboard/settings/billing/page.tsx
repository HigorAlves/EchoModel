'use client'

import { CreditCard } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export default function BillingPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('settings')
	const tBilling = useTranslations('settings.billing')

	useEffect(() => {
		setItems([
			{ label: t('breadcrumbs.settings'), href: '/dashboard/settings' },
			{ label: t('breadcrumbs.billing') },
		])
	}, [setItems, t])

	return (
		<div className='flex flex-1 flex-col gap-6'>
			{/* Header */}
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>{tBilling('title')}</h1>
				<p className='text-muted-foreground'>{tBilling('subtitle')}</p>
			</div>

			{/* Empty State */}
			<Card className='flex-1'>
				<CardContent className='flex h-full min-h-[400px] items-center justify-center p-6'>
					<Empty className='border-none'>
						<EmptyHeader>
							<EmptyMedia variant='icon'>
								<CreditCard />
							</EmptyMedia>
							<EmptyTitle>{tBilling('emptyTitle')}</EmptyTitle>
							<EmptyDescription>{tBilling('emptyDescription')}</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</CardContent>
			</Card>
		</div>
	)
}
