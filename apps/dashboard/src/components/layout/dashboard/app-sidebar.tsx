'use client'

import {
	ArrowLeftRight,
	AudioWaveform,
	BarChart3,
	Command,
	Flag,
	GalleryVerticalEnd,
	LayoutDashboard,
	Receipt,
	Settings,
	Target,
	TrendingUp,
	Wallet,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import type * as React from 'react'

import { NavMain } from '@/components/layout/dashboard/nav-main'
import { NavUser } from '@/components/layout/dashboard/nav-user'
import { TeamSwitcher } from '@/components/layout/dashboard/team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'

// This is sample data.
const userData = {
	name: 'shadcn',
	email: 'm@example.com',
	avatar: '/avatars/shadcn.jpg',
}

const teamsData = [
	{
		name: 'Acme Inc',
		logo: GalleryVerticalEnd,
		plan: 'Enterprise',
	},
	{
		name: 'Acme Corp.',
		logo: AudioWaveform,
		plan: 'Startup',
	},
	{
		name: 'Evil Corp.',
		logo: Command,
		plan: 'Free',
	},
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const t = useTranslations('sidebar')

	const navMain = [
		{
			title: t('dashboard'),
			url: '#',
			icon: LayoutDashboard,
			isActive: true,
			items: [
				{ title: t('overview'), url: '#' },
				{ title: t('netWorth'), url: '#' },
				{ title: t('monthlySummary'), url: '#' },
			],
		},
		{
			title: t('accounts'),
			url: '/dashboard/accounts',
			icon: Wallet,
			items: [
				{ title: t('bankAccounts'), url: '/dashboard/accounts/bank' },
				{ title: t('creditCards'), url: '/dashboard/accounts/credit-cards' },
				{ title: t('cashWallets'), url: '/dashboard/accounts/cash-wallets' },
			],
		},
		{
			title: t('transactions'),
			url: '#',
			icon: ArrowLeftRight,
			items: [
				{ title: t('allTransactions'), url: '#' },
				{ title: t('income'), url: '#' },
				{ title: t('expenses'), url: '#' },
				{ title: t('transfers'), url: '#' },
				{ title: t('import'), url: '#' },
			],
		},
		{
			title: t('budget'),
			url: '#',
			icon: Target,
			items: [
				{ title: t('overview'), url: '#' },
				{ title: t('categories'), url: '#' },
				{ title: t('planning'), url: '#' },
				{ title: t('alerts'), url: '#' },
			],
		},
		{
			title: t('investments'),
			url: '#',
			icon: TrendingUp,
			items: [
				{ title: t('portfolio'), url: '#' },
				{ title: t('stocksEtfs'), url: '#' },
				{ title: t('crypto'), url: '#' },
				{ title: t('fixedIncome'), url: '#' },
				{ title: t('realEstate'), url: '#' },
				{ title: t('funds'), url: '#' },
			],
		},
		{
			title: t('goals'),
			url: '#',
			icon: Flag,
			items: [
				{ title: t('allGoals'), url: '#' },
				{ title: t('emergencyFund'), url: '#' },
				{ title: t('savings'), url: '#' },
				{ title: t('milestones'), url: '#' },
			],
		},
		{
			title: t('bills'),
			url: '#',
			icon: Receipt,
			items: [
				{ title: t('upcoming'), url: '#' },
				{ title: t('subscriptions'), url: '#' },
				{ title: t('recurring'), url: '#' },
				{ title: t('history'), url: '#' },
			],
		},
		{
			title: t('reports'),
			url: '#',
			icon: BarChart3,
			items: [
				{ title: t('overview'), url: '#' },
				{ title: t('cashFlow'), url: '#' },
				{ title: t('byCategory'), url: '#' },
				{ title: t('investments'), url: '#' },
				{ title: t('taxReport'), url: '#' },
			],
		},
		{
			title: t('settings'),
			url: '#',
			icon: Settings,
			items: [
				{ title: t('general'), url: '#' },
				{ title: t('currencies'), url: '#' },
				{ title: t('categories'), url: '#' },
				{ title: t('importExport'), url: '#' },
				{ title: t('notifications'), url: '#' },
			],
		},
	]

	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={teamsData} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={userData} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
