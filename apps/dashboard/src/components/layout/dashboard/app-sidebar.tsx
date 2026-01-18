'use client'

import {
	Cog,
	FolderOpen,
	ImagePlus,
	LayoutDashboard,
	Sparkles,
	Users,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import type * as React from 'react'

import { NavMain } from '@/components/layout/dashboard/nav-main'
import { NavUser } from '@/components/layout/dashboard/nav-user'
import { StoreSwitcher, type StoreData } from '@/components/layout/dashboard/store-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'

// Sample user data - will be replaced with real auth data
const userData = {
	name: 'Store Owner',
	email: 'owner@example.com',
	avatar: '/avatars/default.jpg',
}

// Sample stores data - will be replaced with real store data
const storesData: StoreData[] = [
	{
		id: 'store-1',
		name: 'Fashion Forward',
		plan: 'pro',
	},
	{
		id: 'store-2',
		name: 'Urban Style Co.',
		plan: 'free',
	},
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const t = useTranslations('sidebar')

	const navMain = [
		{
			title: t('dashboard'),
			url: '/dashboard',
			icon: LayoutDashboard,
			isActive: true,
			items: [
				{ title: t('overview'), url: '/dashboard' },
				{ title: t('analytics'), url: '/dashboard/analytics' },
			],
		},
		{
			title: t('models'),
			url: '/dashboard/models',
			icon: Users,
			items: [
				{ title: t('allModels'), url: '/dashboard/models' },
				{ title: t('createModel'), url: '/dashboard/models/create' },
				{ title: t('calibration'), url: '/dashboard/models/calibration' },
			],
		},
		{
			title: t('generations'),
			url: '/dashboard/generations',
			icon: Sparkles,
			items: [
				{ title: t('allGenerations'), url: '/dashboard/generations' },
				{ title: t('newGeneration'), url: '/dashboard/generations/new' },
				{ title: t('history'), url: '/dashboard/generations/history' },
			],
		},
		{
			title: t('assets'),
			url: '/dashboard/assets',
			icon: FolderOpen,
			items: [
				{ title: t('allAssets'), url: '/dashboard/assets' },
				{ title: t('garments'), url: '/dashboard/assets/garments' },
				{ title: t('generated'), url: '/dashboard/assets/generated' },
				{ title: t('references'), url: '/dashboard/assets/references' },
			],
		},
		{
			title: t('settings'),
			url: '/dashboard/settings',
			icon: Cog,
			items: [
				{ title: t('storeSettings'), url: '/dashboard/settings' },
				{ title: t('branding'), url: '/dashboard/settings/branding' },
				{ title: t('billing'), url: '/dashboard/settings/billing' },
				{ title: t('team'), url: '/dashboard/settings/team' },
			],
		},
	]

	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader>
				<StoreSwitcher stores={storesData} />
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
