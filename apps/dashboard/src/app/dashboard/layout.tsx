import type { ReactNode } from 'react'

import { AppSidebar } from '@/components/layout/dashboard/app-sidebar'
import { DashboardHeader, DashboardHeaderProvider } from '@/components/layout/dashboard/dashboard-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<DashboardHeaderProvider>
					<DashboardHeader />
					{children}
				</DashboardHeaderProvider>
			</SidebarInset>
		</SidebarProvider>
	)
}
