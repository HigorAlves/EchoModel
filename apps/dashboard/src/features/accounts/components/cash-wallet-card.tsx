'use client'

import { Banknote, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { CashAccount, WalletAccount } from '../types'

interface CashWalletCardProps {
	account: CashAccount | WalletAccount
	onClick?: (account: CashAccount | WalletAccount) => void
}

export function CashWalletCard({ account, onClick }: CashWalletCardProps) {
	const t = useTranslations('accounts')

	const formatCurrency = (amount: number, currency: string) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
		}).format(amount)
	}

	const isCash = account.type === 'cash'
	const Icon = isCash ? Banknote : Wallet
	const iconColor = account.color || (isCash ? '#228B22' : '#3D95CE')

	return (
		<Card className='cursor-pointer transition-shadow hover:shadow-md' onClick={() => onClick?.(account)}>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<div className='flex items-center gap-3'>
					<div
						className='flex h-10 w-10 items-center justify-center rounded-lg'
						style={{ backgroundColor: `${iconColor}20` }}>
						<Icon className='h-5 w-5' style={{ color: iconColor }} />
					</div>
					<div>
						<h3 className='font-semibold'>{account.name}</h3>
						{account.type === 'wallet' && account.provider && (
							<p className='text-sm text-muted-foreground'>{account.provider}</p>
						)}
						{account.type === 'cash' && account.location && (
							<p className='text-sm text-muted-foreground'>{account.location}</p>
						)}
					</div>
				</div>
				<Badge variant='secondary'>{t(`types.${account.type}`)}</Badge>
			</CardHeader>
			<CardContent>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-sm text-muted-foreground'>{t('card.balance')}</p>
						<p className='text-xl font-bold'>{formatCurrency(account.balance, account.currency.code)}</p>
					</div>
					{account.type === 'wallet' && (
						<p className='text-sm text-muted-foreground'>
							{t('card.provider')}: {account.provider || '-'}
						</p>
					)}
					{account.type === 'cash' && (
						<p className='text-sm text-muted-foreground'>
							{t('card.location')}: {account.location || '-'}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
