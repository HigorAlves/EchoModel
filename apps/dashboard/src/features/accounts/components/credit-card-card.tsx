'use client'

import { CreditCard } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { CreditCard as CreditCardType } from '../types'

interface CreditCardCardProps {
	account: CreditCardType
	onClick?: (account: CreditCardType) => void
}

export function CreditCardCard({ account, onClick }: CreditCardCardProps) {
	const t = useTranslations('accounts')

	const formatCurrency = (amount: number, currency: string) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
		}).format(amount)
	}

	const creditUsagePercent = Math.round((Math.abs(account.balance) / account.creditLimit) * 100)

	const getUsageColor = (percent: number) => {
		if (percent < 30) return 'bg-green-500'
		if (percent < 70) return 'bg-yellow-500'
		return 'bg-red-500'
	}

	const getDueDateStatus = () => {
		const today = new Date()
		const dueDate = new Date(account.dueDate)
		const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

		if (daysUntilDue < 0) return { text: t('card.overdue'), color: 'bg-red-500 text-white' }
		if (daysUntilDue <= 7) return { text: t('card.dueSoon'), color: 'bg-yellow-500 text-black' }
		return null
	}

	const dueDateStatus = getDueDateStatus()

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
		}).format(new Date(date))
	}

	const getBrandIcon = () => {
		// Return appropriate brand styling based on card brand
		const brandColors: Record<string, string> = {
			visa: '#1A1F71',
			mastercard: '#EB001B',
			amex: '#006FCF',
			discover: '#FF6000',
		}
		return brandColors[account.cardBrand] || '#6b7280'
	}

	return (
		<Card className='cursor-pointer transition-shadow hover:shadow-md' onClick={() => onClick?.(account)}>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<div className='flex items-center gap-3'>
					<div
						className='flex h-10 w-10 items-center justify-center rounded-lg'
						style={{ backgroundColor: `${getBrandIcon()}20` }}>
						<CreditCard className='h-5 w-5' style={{ color: getBrandIcon() }} />
					</div>
					<div>
						<h3 className='font-semibold'>{account.name}</h3>
						<p className='text-sm text-muted-foreground'>{t(`cardBrands.${account.cardBrand}`)}</p>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					{dueDateStatus && <Badge className={dueDateStatus.color}>{dueDateStatus.text}</Badge>}
				</div>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-sm text-muted-foreground'>{t('card.balance')}</p>
						<p className='text-xl font-bold text-red-600'>
							{formatCurrency(Math.abs(account.balance), account.currency.code)}
						</p>
					</div>
					<div className='text-right'>
						<p className='text-sm text-muted-foreground'>{t('card.dueDate')}</p>
						<p className='font-medium'>{formatDate(account.dueDate)}</p>
					</div>
				</div>
				<div className='space-y-2'>
					<div className='flex items-center justify-between text-sm'>
						<span className='text-muted-foreground'>{t('card.creditUsage')}</span>
						<span className='font-medium'>{creditUsagePercent}%</span>
					</div>
					<Progress value={creditUsagePercent} className={getUsageColor(creditUsagePercent)} />
					<div className='flex items-center justify-between text-xs text-muted-foreground'>
						<span>
							{t('card.available')}: {formatCurrency(account.availableCredit, account.currency.code)}
						</span>
						<span>
							{t('card.creditLimit')}: {formatCurrency(account.creditLimit, account.currency.code)}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
