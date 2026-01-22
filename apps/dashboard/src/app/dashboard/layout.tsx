'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { AppSidebar } from '@/components/layout/dashboard/app-sidebar'
import { DashboardHeader, DashboardHeaderProvider } from '@/components/layout/dashboard/dashboard-header'
import { useAuth } from '@/components/providers'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { StoreProvider } from '@/features/stores'

function AuthGuard({ children }: { children: ReactNode }) {
	const router = useRouter()
	const { isAuthenticated, isLoading } = useAuth()

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/login')
		}
	}, [isAuthenticated, isLoading, router])

	if (isLoading) {
		return (
			<div className='flex h-screen w-screen items-center justify-center'>
				<div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
			</div>
		)
	}

	if (!isAuthenticated) {
		return null
	}

	return <>{children}</>
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const { user } = useAuth()

	return (
		<AuthGuard>
			<StoreProvider userId={user?.uid ?? null}>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset>
						<DashboardHeaderProvider>
							<DashboardHeader />
							{children}
						</DashboardHeaderProvider>
					</SidebarInset>
				</SidebarProvider>
			</StoreProvider>
		</AuthGuard>
	)
}
