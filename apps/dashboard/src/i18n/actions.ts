'use server'

import { cookies } from 'next/headers'
import { LOCALE_COOKIE, type Locale, locales } from './index'

export async function setLocale(locale: Locale) {
	if (!locales.includes(locale)) {
		throw new Error(`Invalid locale: ${locale}`)
	}

	const cookieStore = await cookies()
	cookieStore.set(LOCALE_COOKIE, locale, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365, // 1 year
		sameSite: 'lax',
	})
}
