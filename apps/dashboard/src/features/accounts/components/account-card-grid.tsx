'use client'

import { PlusCircle, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Account } from '../types'
import { BankAccountCard } from './bank-account-card'
import { CashWalletCard } from './cash-wallet-card'
import { CreditCardCard } from './credit-card-card'

interface AccountCardGridProps {
	accounts: Account[]
	isLoading?: boolean
	onAddAccount?: () => void
	onAccountClick?: (account: Account) => void
}

export function AccountCardGrid({ accounts = [], isLoading, onAddAccount, onAccountClick }: AccountCardGridProps) {
	const t = useTranslations('accounts')

	if (isLoading) {
		return (
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Card key={i}>
						<CardContent className='p-6'>
							<div className='space-y-4'>
								<div className='flex items-center gap-3'>
									<div className='h-10 w-10 animate-pulse rounded-lg bg-muted' />
									<div className='space-y-2'>
										<div className='h-4 w-24 animate-pulse rounded bg-muted' />
										<div className='h-3 w-16 animate-pulse rounded bg-muted' />
									</div>
								</div>
								<div className='h-6 w-32 animate-pulse rounded bg-muted' />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	if (accounts.length === 0) {
		return (
			<Card>
				<CardContent className='flex flex-col items-center justify-center py-12'>
					<Wallet className='h-12 w-12 text-muted-foreground' />
					<h3 className='mt-4 text-lg font-semibold'>{t('empty.title')}</h3>
					<p className='mt-2 text-sm text-muted-foreground'>{t('empty.description')}</p>
					{onAddAccount && (
						<Button onClick={onAddAccount} className='mt-4'>
							<PlusCircle className='mr-2 h-4 w-4' />
							{t('empty.addButton')}
						</Button>
					)}
				</CardContent>
			</Card>
		)
	}

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
			{accounts.map((account) => {
				switch (account.type) {
					case 'bank':
						return <BankAccountCard key={account.id} account={account} onClick={onAccountClick} />
					case 'credit_card':
						return <CreditCardCard key={account.id} account={account} onClick={onAccountClick} />
					case 'cash':
					case 'wallet':
						return <CashWalletCard key={account.id} account={account} onClick={onAccountClick} />
					default:
						return null
				}
			})}
		</div>
	)
}
