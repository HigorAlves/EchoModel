'use client'

import { Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { BankAccount } from '../types'

interface BankAccountCardProps {
	account: BankAccount
	onClick?: (account: BankAccount) => void
}

export function BankAccountCard({ account, onClick }: BankAccountCardProps) {
	const t = useTranslations('accounts')

	const formatCurrency = (amount: number, currency: string) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
		}).format(amount)
	}

	return (
		<Card className='cursor-pointer transition-shadow hover:shadow-md' onClick={() => onClick?.(account)}>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<div className='flex items-center gap-3'>
					<div
						className='flex h-10 w-10 items-center justify-center rounded-lg'
						style={{ backgroundColor: account.color ? `${account.color}20` : '#f3f4f6' }}>
						<Building2 className='h-5 w-5' style={{ color: account.color || '#6b7280' }} />
					</div>
					<div>
						<h3 className='font-semibold'>{account.name}</h3>
						<p className='text-sm text-muted-foreground'>{account.bankName}</p>
					</div>
				</div>
				<Badge variant='secondary'>{t(`subtypes.${account.subtype}`)}</Badge>
			</CardHeader>
			<CardContent>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-sm text-muted-foreground'>{t('card.balance')}</p>
						<p className='text-xl font-bold'>{formatCurrency(account.balance, account.currency.code)}</p>
					</div>
					<p className='text-sm text-muted-foreground'>
						{t('card.accountNumber')}: {account.accountNumber}
					</p>
				</div>
			</CardContent>
		</Card>
	)
}
