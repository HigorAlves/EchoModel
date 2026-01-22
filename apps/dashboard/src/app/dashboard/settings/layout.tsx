'use client'

import { CreditCard, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const navItems = [
	{
		href: '/dashboard/settings',
		labelKey: 'general',
		icon: Settings,
	},
	{
		href: '/dashboard/settings/billing',
		labelKey: 'billing',
		icon: CreditCard,
	},
] as const

export default function SettingsLayout({ children }: { children: ReactNode }) {
	const pathname = usePathname()
	const t = useTranslations('settings.nav')

	return (
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0 md:flex-row'>
			{/* Side Navigation */}
			<aside className='w-full shrink-0 md:w-48 lg:w-56'>
				<nav className='flex flex-row gap-1 md:flex-col'>
					{navItems.map((item) => {
						const isActive = pathname === item.href
						const Icon = item.icon

						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
									isActive
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:bg-muted hover:text-foreground',
								)}>
								<Icon className='h-4 w-4' />
								{t(item.labelKey)}
							</Link>
						)
					})}
				</nav>
			</aside>

			{/* Main Content */}
			<main className='flex-1'>{children}</main>
		</div>
	)
}
