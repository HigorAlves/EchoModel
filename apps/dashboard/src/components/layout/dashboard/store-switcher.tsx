'use client'

import { ChevronsUpDown, Plus, Store } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
import { useCurrentStore } from '@/features/stores'

export function StoreSwitcher() {
	const { isMobile } = useSidebar()
	const { currentStore, stores, selectStore, isLoading } = useCurrentStore()
	const t = useTranslations('stores')

	// Show loading state while stores are being fetched
	if (isLoading) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size='lg' className='animate-pulse'>
						<div className='bg-muted flex aspect-square size-8 items-center justify-center rounded-lg'>
							<Store className='size-4' />
						</div>
						<div className='grid flex-1 gap-1 text-left text-sm leading-tight'>
							<span className='bg-muted h-4 w-24 rounded' />
							<span className='bg-muted h-3 w-16 rounded' />
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		)
	}

	// Show nothing if no stores (user might need to create one)
	if (!currentStore || stores.length === 0) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size='lg' className='gap-2 p-2'>
						<div className='flex size-8 items-center justify-center rounded-md border bg-transparent'>
							<Plus className='size-4' />
						</div>
						<div className='text-muted-foreground text-sm font-medium'>{t('addStore')}</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		)
	}

	// Determine plan based on store status (could be enhanced with actual plan data)
	const getPlanLabel = (status: string) => {
		switch (status) {
			case 'ACTIVE':
				return t('plans.free')
			default:
				return t('plans.free')
		}
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
							<span className='truncate font-medium'>{currentStore.name}</span>
							<span className='truncate text-xs'>{getPlanLabel(currentStore.status)}</span>
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
							<DropdownMenuItem
								key={store.id}
								onClick={() => selectStore(store.id)}
								className={`gap-2 p-2 ${store.id === currentStore.id ? 'bg-accent' : ''}`}>
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
