'use client'

import { CreditCard, Palette, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function SettingsNav({ activeSection }: { activeSection: string }) {
	const t = useTranslations('settings.breadcrumbs')

	const navItems = [
		{ id: 'store', label: t('store'), icon: Settings, href: '/dashboard/settings' },
		{ id: 'branding', label: t('branding'), icon: Palette, href: '/dashboard/settings/branding' },
		{ id: 'billing', label: t('billing'), icon: CreditCard, href: '/dashboard/settings/billing' },
		{ id: 'team', label: t('team'), icon: Users, href: '/dashboard/settings/team' },
	]

	return (
		<nav className='flex flex-col gap-1'>
			{navItems.map((item) => (
				<Link
					key={item.id}
					href={item.href}
					className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
						activeSection === item.id
							? 'bg-primary text-primary-foreground'
							: 'hover:bg-muted text-muted-foreground hover:text-foreground'
					}`}>
					<item.icon className='h-4 w-4' />
					{item.label}
				</Link>
			))}
		</nav>
	)
}

export default function SettingsPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('settings')
	const tStore = useTranslations('settings.store')

	const [formData, setFormData] = useState({
		name: 'Fashion Forward',
		description: 'Premium clothing store specializing in modern fashion',
		defaultAspectRatio: '4:5',
		defaultImageCount: '2',
		watermarkEnabled: false,
	})

	useEffect(() => {
		setItems([{ label: t('breadcrumbs.settings'), href: '/dashboard/settings' }, { label: t('breadcrumbs.store') }])
	}, [setItems, t])

	return (
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
			{/* Header */}
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>{t('title')}</h1>
				<p className='text-muted-foreground'>{t('subtitle')}</p>
			</div>

			<div className='grid gap-6 lg:grid-cols-[240px_1fr]'>
				{/* Sidebar Navigation */}
				<Card className='h-fit'>
					<CardContent className='p-4'>
						<SettingsNav activeSection='store' />
					</CardContent>
				</Card>

				{/* Main Content */}
				<div className='space-y-6'>
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
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								/>
							</div>

							{/* Store Description */}
							<div className='space-y-2'>
								<Label htmlFor='storeDescription'>{tStore('description')}</Label>
								<Input
									id='storeDescription'
									placeholder={tStore('descriptionPlaceholder')}
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								/>
							</div>

							{/* Default Settings */}
							<div className='grid gap-4 sm:grid-cols-2'>
								<div className='space-y-2'>
									<Label>{tStore('defaultAspectRatio')}</Label>
									<Select
										value={formData.defaultAspectRatio || undefined}
										onValueChange={(value) => setFormData({ ...formData, defaultAspectRatio: value ?? '4:5' })}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='4:5'>Portrait (4:5)</SelectItem>
											<SelectItem value='9:16'>Story (9:16)</SelectItem>
											<SelectItem value='1:1'>Square (1:1)</SelectItem>
											<SelectItem value='16:9'>Landscape (16:9)</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className='space-y-2'>
									<Label>{tStore('defaultImageCount')}</Label>
									<Select
										value={formData.defaultImageCount || undefined}
										onValueChange={(value) => setFormData({ ...formData, defaultImageCount: value ?? '2' })}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1'>1 image</SelectItem>
											<SelectItem value='2'>2 images</SelectItem>
											<SelectItem value='3'>3 images</SelectItem>
											<SelectItem value='4'>4 images</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Watermark */}
							<div className='flex items-center justify-between rounded-lg border p-4'>
								<div>
									<Label>{tStore('watermark')}</Label>
									<p className='text-muted-foreground text-sm'>{tStore('watermarkDescription')}</p>
								</div>
								<Button
									variant={formData.watermarkEnabled ? 'default' : 'outline'}
									onClick={() => setFormData({ ...formData, watermarkEnabled: !formData.watermarkEnabled })}>
									{formData.watermarkEnabled ? 'Enabled' : 'Disabled'}
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Save Button */}
					<div className='flex justify-end'>
						<Button>Save Changes</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
