'use client'

export const dynamic = 'force-dynamic'

import { PlusCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import type { Account, AccountFilter } from '@/features/accounts'
import {
	AccountCardGrid,
	AccountDetailDrawer,
	AccountSummaryCards,
	AccountTypeTabs,
	AddAccountDialog,
	DeleteAccountDialog,
	useAccounts,
} from '@/features/accounts'

export default function AccountsPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('accounts.breadcrumbs')
	const tActions = useTranslations('accounts.actions')

	const { filteredAccounts, summary, filter, isLoading, setFilter, addAccount, deleteAccount, getAccountTransactions } =
		useAccounts()

	const [addDialogOpen, setAddDialogOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
	const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

	useEffect(() => {
		setItems([{ label: t('accounts') }])
	}, [setItems, t])

	const handleFilterChange = (newFilter: AccountFilter) => {
		setFilter(newFilter)
	}

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

			{/* Filters and Actions */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<AccountTypeTabs value={filter} onChange={handleFilterChange} />
				<Button onClick={() => setAddDialogOpen(true)}>
					<PlusCircle className='mr-2 h-4 w-4' />
					{tActions('addAccount')}
				</Button>
			</div>

			{/* Account Grid */}
			<AccountCardGrid
				accounts={filteredAccounts}
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

			{/* Add Account Dialog */}
			<AddAccountDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onAdd={handleAddAccount} />

			{/* Delete Account Dialog */}
			<DeleteAccountDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				account={selectedAccount}
				onDelete={handleDeleteAccount}
			/>
		</div>
	)
}
