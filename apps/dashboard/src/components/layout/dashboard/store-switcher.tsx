'use client'

import { ChevronsUpDown, Plus, Store } from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'

export interface StoreData {
	id: string
	name: string
	plan: 'free' | 'pro' | 'enterprise'
}

export function StoreSwitcher({ stores }: { stores: StoreData[] }) {
	const { isMobile } = useSidebar()
	const [activeStore, setActiveStore] = React.useState(stores[0])
	const t = useTranslations('stores')

	if (!activeStore) {
		return null
	}

	const planLabels = {
		free: t('plans.free'),
		pro: t('plans.pro'),
		enterprise: t('plans.enterprise'),
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton
								size='lg'
								className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
							/>
						}>
						<div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
							<Store className='size-4' />
						</div>
						<div className='grid flex-1 text-left text-sm leading-tight'>
							<span className='truncate font-medium'>{activeStore.name}</span>
							<span className='truncate text-xs'>{planLabels[activeStore.plan]}</span>
						</div>
						<ChevronsUpDown className='ml-auto' />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-(--anchor-width) min-w-56 rounded-lg'
						align='start'
						side={isMobile ? 'bottom' : 'right'}
						sideOffset={4}>
						<DropdownMenuLabel className='text-muted-foreground text-xs'>{t('yourStores')}</DropdownMenuLabel>
						{stores.map((store, index) => (
							<DropdownMenuItem key={store.id} onClick={() => setActiveStore(store)} className='gap-2 p-2'>
								<div className='flex size-6 items-center justify-center rounded-md border'>
									<Store className='size-3.5 shrink-0' />
								</div>
								{store.name}
								<DropdownMenuShortcut>{index + 1}</DropdownMenuShortcut>
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem className='gap-2 p-2'>
							<div className='flex size-6 items-center justify-center rounded-md border bg-transparent'>
								<Plus className='size-4' />
							</div>
							<div className='text-muted-foreground font-medium'>{t('addStore')}</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
