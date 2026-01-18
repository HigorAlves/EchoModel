'use client'

import { Folder, Forward, type LucideIcon, MoreHorizontal, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar'

export function NavProjects({
	projects,
}: {
	projects: {
		name: string
		url: string
		icon: LucideIcon
	}[]
}) {
	const { isMobile } = useSidebar()
	const t = useTranslations('navigation')
	const tProjects = useTranslations('projects')
	const tCommon = useTranslations('common')

	return (
		<SidebarGroup className='group-data-[collapsible=icon]:hidden'>
			<SidebarGroupLabel>{t('projects')}</SidebarGroupLabel>
			<SidebarMenu>
				{projects.map((item) => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton render={<Link href={item.url} />}>
							<item.icon />
							<span>{item.name}</span>
						</SidebarMenuButton>
						<DropdownMenu>
							<DropdownMenuTrigger render={<SidebarMenuAction showOnHover />}>
								<MoreHorizontal />
								<span className='sr-only'>{tCommon('more')}</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className='w-48 rounded-lg'
								side={isMobile ? 'bottom' : 'right'}
								align={isMobile ? 'end' : 'start'}>
								<DropdownMenuItem>
									<Folder className='text-muted-foreground' />
									<span>{tProjects('viewProject')}</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Forward className='text-muted-foreground' />
									<span>{tProjects('shareProject')}</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<Trash2 className='text-muted-foreground' />
									<span>{tProjects('deleteProject')}</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				))}
				<SidebarMenuItem>
					<SidebarMenuButton className='text-sidebar-foreground/70'>
						<MoreHorizontal className='text-sidebar-foreground/70' />
						<span>{tCommon('more')}</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	)
}
