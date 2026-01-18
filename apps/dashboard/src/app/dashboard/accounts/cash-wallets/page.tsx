'use client'

export const dynamic = 'force-dynamic'

import { PlusCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import type { Account } from '@/features/accounts'
import {
	AccountCardGrid,
	AccountDetailDrawer,
	AccountSummaryCards,
	AddAccountDialog,
	DeleteAccountDialog,
	useAccounts,
} from '@/features/accounts'

export default function CashWalletsPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('accounts.breadcrumbs')
	const tActions = useTranslations('accounts.actions')

	const { accounts, summary, isLoading, addAccount, deleteAccount, getAccountTransactions } = useAccounts()

	const [addDialogOpen, setAddDialogOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
	const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

	// Filter to cash and wallet accounts only
	const cashAndWallets = accounts.filter((acc) => acc.type === 'cash' || acc.type === 'wallet')

	useEffect(() => {
		setItems([{ label: t('accounts'), href: '/dashboard/accounts' }, { label: t('cashWallets') }])
	}, [setItems, t])

	const handleAddAccount = async (input: Parameters<typeof addAccount>[0]) => {
		await addAccount(input)
	}

	const handleDeleteAccount = async (id: string) => {
		await deleteAccount(id)
		setSelectedAccount(null)
		setDetailDrawerOpen(false)
	}

	const handleAccountClick = (account: Account) => {
		setSelectedAccount(account)
		setDetailDrawerOpen(true)
	}

	const handleDeleteFromDrawer = (_account: Account) => {
		setDetailDrawerOpen(false)
		setDeleteDialogOpen(true)
	}

	const transactions = selectedAccount ? getAccountTransactions(selectedAccount.id) : []

	return (
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
			{/* Summary Cards */}
			<AccountSummaryCards summary={summary} isLoading={isLoading} />

			{/* Header with Actions */}
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-semibold'>{t('cashWallets')}</h2>
				<Button onClick={() => setAddDialogOpen(true)}>
					<PlusCircle className='mr-2 h-4 w-4' />
					{tActions('addAccount')}
				</Button>
			</div>

			{/* Account Grid */}
			<AccountCardGrid
				accounts={cashAndWallets}
				isLoading={isLoading}
				onAddAccount={() => setAddDialogOpen(true)}
				onAccountClick={handleAccountClick}
			/>

			{/* Account Detail Drawer */}
			<AccountDetailDrawer
				account={selectedAccount}
				transactions={transactions}
				open={detailDrawerOpen}
				onOpenChange={setDetailDrawerOpen}
				onDelete={handleDeleteFromDrawer}
			/>

			{/* Dialogs */}
			<AddAccountDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onAdd={handleAddAccount} />
			<DeleteAccountDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				account={selectedAccount}
				onDelete={handleDeleteAccount}
			/>
		</div>
	)
}
