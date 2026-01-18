'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Account } from '../types'

interface DeleteAccountDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	account: Account | null
	onDelete: (id: string) => Promise<void>
}

export function DeleteAccountDialog({ open, onOpenChange, account, onDelete }: DeleteAccountDialogProps) {
	const t = useTranslations('accounts.dialog')
	const tCommon = useTranslations('common')
	const [isLoading, setIsLoading] = useState(false)

	const handleDelete = async () => {
		if (!account) return
		setIsLoading(true)
		try {
			await onDelete(account.id)
			onOpenChange(false)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t('deleteTitle')}</DialogTitle>
					<DialogDescription>{t('deleteDescription')}</DialogDescription>
				</DialogHeader>
				{account && (
					<div className='rounded-lg border p-4'>
						<p className='font-medium'>{account.name}</p>
						<p className='text-sm text-muted-foreground'>
							{account.currency.symbol}
							{Math.abs(account.balance).toFixed(2)}
						</p>
					</div>
				)}
				<div className='flex justify-end gap-2'>
					<Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
						{tCommon('cancel')}
					</Button>
					<Button variant='destructive' onClick={handleDelete} disabled={isLoading}>
						{isLoading ? tCommon('loading') : t('deleteConfirm')}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
