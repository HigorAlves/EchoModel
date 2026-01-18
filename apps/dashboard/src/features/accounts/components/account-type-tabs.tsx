'use client'

import { useTranslations } from 'next-intl'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AccountFilter } from '../types'

interface AccountTypeTabsProps {
	value: AccountFilter
	onChange: (value: AccountFilter) => void
}

export function AccountTypeTabs({ value, onChange }: AccountTypeTabsProps) {
	const t = useTranslations('accounts.tabs')

	return (
		<Tabs value={value} onValueChange={(v) => onChange(v as AccountFilter)}>
			<TabsList>
				<TabsTrigger value='all'>{t('all')}</TabsTrigger>
				<TabsTrigger value='bank'>{t('bank')}</TabsTrigger>
				<TabsTrigger value='credit_card'>{t('creditCards')}</TabsTrigger>
				<TabsTrigger value='cash'>{t('cashWallets')}</TabsTrigger>
				<TabsTrigger value='wallet'>{t('cashWallets')}</TabsTrigger>
			</TabsList>
		</Tabs>
	)
}
