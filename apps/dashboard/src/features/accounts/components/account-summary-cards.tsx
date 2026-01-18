'use client'

import { Building2, CreditCard, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AccountSummary } from '../types'

interface AccountSummaryCardsProps {
	summary: AccountSummary
	isLoading?: boolean
}

export function AccountSummaryCards({ summary, isLoading }: AccountSummaryCardsProps) {
	const t = useTranslations('accounts.summary')

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount)
	}

	const cards = [
		{
			title: t('bankBalance'),
			value: summary.totalBankBalance,
			icon: Building2,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50 dark:bg-blue-950',
		},
		{
			title: t('creditDebt'),
			value: summary.totalCreditDebt,
			icon: CreditCard,
			color: 'text-red-600',
			bgColor: 'bg-red-50 dark:bg-red-950',
			isDebt: true,
		},
		{
			title: t('availableCredit'),
			value: summary.totalAvailableCredit,
			icon: CreditCard,
			color: 'text-green-600',
			bgColor: 'bg-green-50 dark:bg-green-950',
		},
		{
			title: t('cashWallets'),
			value: summary.totalCashAndWallets,
			icon: Wallet,
			color: 'text-purple-600',
			bgColor: 'bg-purple-50 dark:bg-purple-950',
		},
	]

	if (isLoading) {
		return (
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{[1, 2, 3, 4].map((i) => (
					<Card key={i}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<div className='h-4 w-24 animate-pulse rounded bg-muted' />
							<div className='h-8 w-8 animate-pulse rounded bg-muted' />
						</CardHeader>
						<CardContent>
							<div className='h-8 w-32 animate-pulse rounded bg-muted' />
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
			{cards.map((card) => (
				<Card key={card.title}>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
						<div className={`rounded-lg p-2 ${card.bgColor}`}>
							<card.icon className={`h-4 w-4 ${card.color}`} />
						</div>
					</CardHeader>
					<CardContent>
						<div className={`text-2xl font-bold ${card.isDebt ? 'text-red-600' : ''}`}>
							{card.isDebt ? '-' : ''}
							{formatCurrency(card.value)}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
