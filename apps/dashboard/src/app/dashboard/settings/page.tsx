'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentStore } from '@/features/stores'

function SettingsFormSkeleton() {
	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-32' />
					<Skeleton className='h-4 w-64' />
				</CardHeader>
				<CardContent className='space-y-6'>
					<div className='space-y-2'>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-10 w-full' />
					</div>
					<div className='space-y-2'>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-10 w-full' />
					</div>
					<Skeleton className='h-20 w-full' />
				</CardContent>
			</Card>
			<div className='flex justify-end'>
				<Skeleton className='h-10 w-32' />
			</div>
		</div>
	)
}

export default function SettingsPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('settings')
	const tStore = useTranslations('settings.store')

	const { currentStore, isCurrentStoreLoading, updateStoreInfo, updateStoreSettings, isUpdating } = useCurrentStore()

	// Local form state - synced with store data
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		watermarkEnabled: false,
	})

	// Track if form has been modified
	const [isDirty, setIsDirty] = useState(false)

	// Sync form data with store when store changes
	useEffect(() => {
		if (currentStore) {
			setFormData({
				name: currentStore.name,
				description: currentStore.description ?? '',
				watermarkEnabled: currentStore.settings.watermarkEnabled,
			})
			setIsDirty(false)
		}
	}, [currentStore])

	useEffect(() => {
		setItems([{ label: t('breadcrumbs.settings'), href: '/dashboard/settings' }, { label: t('breadcrumbs.store') }])
	}, [setItems, t])

	const handleInputChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
		setIsDirty(true)
	}

	const handleSave = async () => {
		if (!currentStore) return

		try {
			// Check what has changed
			const infoChanges: { name?: string; description?: string | null } = {}
			const settingsChanges: { watermarkEnabled?: boolean } = {}

			// Compare and build change objects
			if (formData.name !== currentStore.name) {
				infoChanges.name = formData.name
			}
			if (formData.description !== (currentStore.description ?? '')) {
				infoChanges.description = formData.description || null
			}

			if (formData.watermarkEnabled !== currentStore.settings.watermarkEnabled) {
				settingsChanges.watermarkEnabled = formData.watermarkEnabled
			}

			// Apply changes
			const promises: Promise<void>[] = []

			if (Object.keys(infoChanges).length > 0) {
				promises.push(updateStoreInfo(infoChanges))
			}

			if (Object.keys(settingsChanges).length > 0) {
				promises.push(updateStoreSettings(settingsChanges))
			}

			if (promises.length > 0) {
				await Promise.all(promises)
				toast.success(t('saveSuccess'))
				setIsDirty(false)
			}
		} catch {
			toast.error(t('saveError'))
		}
	}

	return (
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
			{/* Header */}
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>{t('title')}</h1>
				<p className='text-muted-foreground'>{t('subtitle')}</p>
			</div>

			{/* Main Content */}
			{isCurrentStoreLoading || !currentStore ? (
				<SettingsFormSkeleton />
			) : (
				<div className='max-w-2xl space-y-6'>
					<Card>
						<CardHeader>
							<CardTitle>{tStore('title')}</CardTitle>
							<CardDescription>{tStore('subtitle')}</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Store Name */}
							<div className='space-y-2'>
								<Label htmlFor='storeName'>{tStore('name')}</Label>
								<Input
									id='storeName'
									placeholder={tStore('namePlaceholder')}
									value={formData.name}
									onChange={(e) => handleInputChange('name', e.target.value)}
								/>
							</div>

							{/* Store Description */}
							<div className='space-y-2'>
								<Label htmlFor='storeDescription'>{tStore('description')}</Label>
								<Input
									id='storeDescription'
									placeholder={tStore('descriptionPlaceholder')}
									value={formData.description}
									onChange={(e) => handleInputChange('description', e.target.value)}
								/>
							</div>

							{/* Watermark */}
							<div className='flex items-center justify-between rounded-lg border p-4'>
								<div>
									<Label>{tStore('watermark')}</Label>
									<p className='text-muted-foreground text-sm'>{tStore('watermarkDescription')}</p>
								</div>
								<Button
									variant={formData.watermarkEnabled ? 'default' : 'outline'}
									onClick={() => handleInputChange('watermarkEnabled', !formData.watermarkEnabled)}>
									{formData.watermarkEnabled ? 'Enabled' : 'Disabled'}
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Save Button */}
					<div className='flex justify-end'>
						<Button onClick={handleSave} disabled={!isDirty || isUpdating}>
							{isUpdating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
							{t('saveChanges')}
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}
