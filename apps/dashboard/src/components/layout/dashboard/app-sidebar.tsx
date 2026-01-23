'use client'

import { Cog, FolderOpen, LayoutDashboard, Sparkles, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type * as React from 'react'
import { NavMain } from '@/components/layout/dashboard/nav-main'
import { NavUser } from '@/components/layout/dashboard/nav-user'
import { StoreSwitcher } from '@/components/layout/dashboard/store-switcher'
import { useAuth } from '@/components/providers'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const t = useTranslations('sidebar')
	const { user } = useAuth()

	// Get user display name and email from Firebase user
	const userData = {
		name: user?.displayName || user?.email?.split('@')[0] || 'User',
		email: user?.email || '',
		avatar: user?.photoURL || '',
	}

	const navMain = [
		{
			title: t('dashboard'),
			url: '/dashboard',
			icon: LayoutDashboard,
			isActive: true,
			items: [
				{ title: t('overview'), url: '/dashboard' },
			],
		},
		{
			title: t('models'),
			url: '/dashboard/models',
			icon: Users,
			items: [
				{ title: t('allModels'), url: '/dashboard/models' },
			],
		},
		{
			title: t('generations'),
			url: '/dashboard/generations',
			icon: Sparkles,
			items: [
				{ title: t('allGenerations'), url: '/dashboard/generations' },
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
			],
		},
		{
			title: t('settings'),
			url: '/dashboard/settings',
			icon: Cog,
			items: [
				{ title: t('storeSettings'), url: '/dashboard/settings' },
				{ title: t('billing'), url: '/dashboard/settings/billing' },
			],
		},
	]

	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader>
				<StoreSwitcher />
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
