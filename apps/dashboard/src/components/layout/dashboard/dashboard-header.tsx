'use client'

import { createContext, Fragment, type ReactNode, useContext, useState } from 'react'
import { LocaleSwitcher } from '@/components/common/locale-switcher'
import { ThemeSwitcher } from '@/components/common/theme-switcher'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export type BreadcrumbItemType = {
	label: string
	href?: string
}

type BreadcrumbContextType = {
	items: BreadcrumbItemType[]
	setItems: (items: BreadcrumbItemType[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null)

export function useBreadcrumbs() {
	const context = useContext(BreadcrumbContext)
	// Return a safe default during SSR/prerendering when context is not available
	if (!context) {
		return { items: [], setItems: () => {} }
	}
	return context
}

export function DashboardHeaderProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<BreadcrumbItemType[]>([])

	return <BreadcrumbContext.Provider value={{ items, setItems }}>{children}</BreadcrumbContext.Provider>
}

export function DashboardHeader() {
	const { items } = useBreadcrumbs()

	return (
		<header className='flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
			<div className='flex items-center gap-2 px-4'>
				<SidebarTrigger className='-ml-1' />
				<Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
				{items.length > 0 && (
					<Breadcrumb>
						<BreadcrumbList>
							{items.map((item, index) => {
								const isLast = index === items.length - 1
								return (
									<Fragment key={item.label}>
										<BreadcrumbItem className={!isLast ? 'hidden md:block' : ''}>
											{isLast ? (
												<BreadcrumbPage>{item.label}</BreadcrumbPage>
											) : (
												<BreadcrumbLink href={item.href ?? '#'}>{item.label}</BreadcrumbLink>
											)}
										</BreadcrumbItem>
										{!isLast && <BreadcrumbSeparator className='hidden md:block' />}
									</Fragment>
								)
							})}
						</BreadcrumbList>
					</Breadcrumb>
				)}
			</div>
			<div className='flex items-center gap-2 px-4'>
				<LocaleSwitcher />
				<ThemeSwitcher />
			</div>
		</header>
	)
}
