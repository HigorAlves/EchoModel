'use client'

import { Banknote, Building2, CreditCard, Pencil, Trash2, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type {
	Account,
	BankAccount,
	CashAccount,
	CreditCard as CreditCardType,
	Transaction,
	WalletAccount,
} from '../types'

interface AccountDetailDrawerProps {
	account: Account | null
	transactions: Transaction[]
	open: boolean
	onOpenChange: (open: boolean) => void
	onEdit?: (account: Account) => void
	onDelete?: (account: Account) => void
}

export function AccountDetailDrawer({
	account,
	transactions,
	open,
	onOpenChange,
	onEdit,
	onDelete,
}: AccountDetailDrawerProps) {
	const t = useTranslations('accounts')

	if (!account) return null

	const getIcon = () => {
		switch (account.type) {
			case 'bank':
				return Building2
			case 'credit_card':
				return CreditCard
			case 'cash':
				return Banknote
			case 'wallet':
				return Wallet
		}
	}

	const Icon = getIcon()
	const iconColor = account.color || '#6b7280'

	const formatCurrency = (amount: number, currency: string) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
		}).format(Math.abs(amount))
	}

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}).format(new Date(date))
	}

	const getStatusVariant = (status: Account['status']) => {
		switch (status) {
			case 'active':
				return 'default'
			case 'inactive':
				return 'secondary'
			case 'closed':
				return 'destructive'
		}
	}

	const renderBankDetails = (acc: BankAccount) => (
		<div className='grid grid-cols-2 gap-4'>
			<div>
				<p className='text-xs text-muted-foreground'>{t('form.bankName')}</p>
				<p className='text-sm font-medium'>{acc.bankName}</p>
			</div>
			<div>
				<p className='text-xs text-muted-foreground'>{t('form.accountNumber')}</p>
				<p className='text-sm font-medium'>{acc.accountNumber}</p>
			</div>
			<div>
				<p className='text-xs text-muted-foreground'>{t('form.subtype')}</p>
				<p className='text-sm font-medium'>{t(`subtypes.${acc.subtype}`)}</p>
			</div>
			<div>
				<p className='text-xs text-muted-foreground'>{t('form.currency')}</p>
				<p className='text-sm font-medium'>{acc.currency.code}</p>
			</div>
		</div>
	)

	const renderCreditCardDetails = (acc: CreditCardType) => {
		const creditUsagePercent = Math.round((Math.abs(acc.balance) / acc.creditLimit) * 100)
		const getUsageColor = (percent: number) => {
			if (percent < 30) return 'bg-green-500'
			if (percent < 70) return 'bg-yellow-500'
			return 'bg-red-500'
		}

		return (
			<div className='space-y-4'>
				<div className='grid grid-cols-2 gap-4'>
					<div>
						<p className='text-xs text-muted-foreground'>{t('form.bankName')}</p>
						<p className='text-sm font-medium'>{acc.bankName}</p>
					</div>
					<div>
						<p className='text-xs text-muted-foreground'>{t('form.cardBrand')}</p>
						<p className='text-sm font-medium'>{t(`cardBrands.${acc.cardBrand}`)}</p>
					</div>
					<div>
						<p className='text-xs text-muted-foreground'>{t('card.dueDate')}</p>
						<p className='text-sm font-medium'>{formatDate(acc.dueDate)}</p>
					</div>
					<div>
						<p className='text-xs text-muted-foreground'>{t('card.apr')}</p>
						<p className='text-sm font-medium'>{acc.apr}%</p>
					</div>
				</div>

				<div className='rounded-lg border p-3 space-y-3'>
					<div className='flex items-center justify-between text-sm'>
						<span className='text-muted-foreground'>{t('card.creditUsage')}</span>
						<span className='font-medium'>{creditUsagePercent}%</span>
					</div>
					<Progress value={creditUsagePercent} className={getUsageColor(creditUsagePercent)} />
					<div className='grid grid-cols-3 gap-2 text-xs'>
						<div>
							<p className='text-muted-foreground'>{t('card.balance')}</p>
							<p className='font-medium text-red-600'>{formatCurrency(acc.balance, acc.currency.code)}</p>
						</div>
						<div>
							<p className='text-muted-foreground'>{t('card.available')}</p>
							<p className='font-medium text-green-600'>{formatCurrency(acc.availableCredit, acc.currency.code)}</p>
						</div>
						<div>
							<p className='text-muted-foreground'>{t('card.creditLimit')}</p>
							<p className='font-medium'>{formatCurrency(acc.creditLimit, acc.currency.code)}</p>
						</div>
					</div>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div>
						<p className='text-xs text-muted-foreground'>{t('card.minimumPayment')}</p>
						<p className='text-sm font-medium'>{formatCurrency(acc.minimumPayment, acc.currency.code)}</p>
					</div>
				</div>
			</div>
		)
	}

	const renderCashDetails = (acc: CashAccount) => (
		<div className='grid grid-cols-2 gap-4'>
			<div>
				<p className='text-xs text-muted-foreground'>{t('card.location')}</p>
				<p className='text-sm font-medium'>{acc.location || '-'}</p>
			</div>
			<div>
				<p className='text-xs text-muted-foreground'>{t('form.currency')}</p>
				<p className='text-sm font-medium'>{acc.currency.code}</p>
			</div>
		</div>
	)

	const renderWalletDetails = (acc: WalletAccount) => (
		<div className='grid grid-cols-2 gap-4'>
			<div>
				<p className='text-xs text-muted-foreground'>{t('card.provider')}</p>
				<p className='text-sm font-medium'>{acc.provider || '-'}</p>
			</div>
			<div>
				<p className='text-xs text-muted-foreground'>{t('form.walletType')}</p>
				<p className='text-sm font-medium'>{t(`walletTypes.${acc.walletType}`)}</p>
			</div>
			<div>
				<p className='text-xs text-muted-foreground'>{t('form.currency')}</p>
				<p className='text-sm font-medium'>{acc.currency.code}</p>
			</div>
		</div>
	)

	const renderAccountDetails = () => {
		switch (account.type) {
			case 'bank':
				return renderBankDetails(account)
			case 'credit_card':
				return renderCreditCardDetails(account)
			case 'cash':
				return renderCashDetails(account)
			case 'wallet':
				return renderWalletDetails(account)
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side='right' className='w-full sm:max-w-md overflow-y-auto'>
				<SheetHeader className='pb-0'>
					<div className='flex items-center gap-3'>
						<div
							className='flex h-12 w-12 items-center justify-center rounded-xl'
							style={{ backgroundColor: `${iconColor}20` }}>
							<Icon className='h-6 w-6' style={{ color: iconColor }} />
						</div>
						<div className='flex-1'>
							<div className='flex items-center gap-2'>
								<SheetTitle className='text-lg'>{account.name}</SheetTitle>
								<Badge variant={getStatusVariant(account.status)} className='text-xs'>
									{t(`status.${account.status}`)}
								</Badge>
							</div>
							<p className='text-sm text-muted-foreground'>{t(`types.${account.type}`)}</p>
						</div>
					</div>
				</SheetHeader>

				<div className='flex-1 space-y-6 p-4'>
					{/* Balance */}
					<div className='rounded-lg border p-4'>
						<p className='text-sm text-muted-foreground'>{t('card.balance')}</p>
						<p className={`text-3xl font-bold ${account.type === 'credit_card' ? 'text-red-600' : ''}`}>
							{account.type === 'credit_card' ? '-' : ''}
							{formatCurrency(account.balance, account.currency.code)}
						</p>
					</div>

					{/* Account Details */}
					<div className='space-y-3'>
						<h3 className='text-sm font-medium'>{t('detail.accountInfo')}</h3>
						{renderAccountDetails()}
					</div>

					{/* Recent Transactions */}
					{transactions.length > 0 && (
						<div className='space-y-3'>
							<h3 className='text-sm font-medium'>{t('detail.recentTransactions')}</h3>
							<div className='space-y-2'>
								{transactions.slice(0, 5).map((tx) => (
									<div key={tx.id} className='flex items-center justify-between rounded-lg border p-3'>
										<div>
											<p className='text-sm font-medium'>{tx.description}</p>
											<p className='text-xs text-muted-foreground'>{tx.category}</p>
										</div>
										<div className='text-right'>
											<p
												className={`text-sm font-medium ${tx.type === 'income' ? 'text-green-600' : tx.type === 'expense' ? 'text-red-600' : ''}`}>
												{tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
												{formatCurrency(tx.amount, 'USD')}
											</p>
											<p className='text-xs text-muted-foreground'>{formatDate(tx.date)}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Actions */}
					<div className='flex gap-2 pt-4'>
						{onEdit && (
							<Button variant='outline' className='flex-1' onClick={() => onEdit(account)}>
								<Pencil className='mr-2 h-4 w-4' />
								{t('actions.editAccount')}
							</Button>
						)}
						{onDelete && (
							<Button variant='destructive' className='flex-1' onClick={() => onDelete(account)}>
								<Trash2 className='mr-2 h-4 w-4' />
								{t('actions.deleteAccount')}
							</Button>
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	)
}
