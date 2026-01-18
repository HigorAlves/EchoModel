'use client'

import { Languages } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { type Locale, localeNames, locales } from '@/i18n'
import { setLocale } from '@/i18n/actions'

export function LocaleSwitcher() {
	const t = useTranslations('localeSwitcher')
	const currentLocale = useLocale()
	const [isPending, startTransition] = useTransition()

	function handleLocaleChange(locale: Locale) {
		startTransition(async () => {
			await setLocale(locale)
			window.location.reload()
		})
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant='ghost' size='icon' disabled={isPending} />}>
				<Languages className='h-5 w-5' />
				<span className='sr-only'>{t('label')}</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				{locales.map((locale) => (
					<DropdownMenuItem
						key={locale}
						onClick={() => handleLocaleChange(locale)}
						className={currentLocale === locale ? 'bg-accent' : ''}>
						{localeNames[locale]}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
