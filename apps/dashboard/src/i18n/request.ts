import { cookies, headers } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, type Locale, locales } from './config'

const LOCALE_COOKIE = 'NEXT_LOCALE'

function getLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale | null {
	if (!acceptLanguage) return null

	const languages = acceptLanguage.split(',').map((lang) => {
		const [code, quality = 'q=1'] = lang.trim().split(';')
		return {
			code: code?.trim(),
			quality: Number.parseFloat(quality.replace('q=', '')) || 1,
		}
	})

	languages.sort((a, b) => b.quality - a.quality)

	for (const { code } of languages) {
		if (!code) continue
		// Check for exact match
		if (locales.includes(code as Locale)) {
			return code as Locale
		}
		// Check for language match (e.g., "pt" matches "pt-BR")
		const languageCode = code.split('-')[0]
		const match = locales.find((locale) => locale.startsWith(languageCode ?? ''))
		if (match) return match
	}

	return null
}

export default getRequestConfig(async () => {
	const cookieStore = await cookies()
	const headerStore = await headers()

	// Try to get locale from cookie first
	const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined
	if (cookieLocale && locales.includes(cookieLocale)) {
		return {
			locale: cookieLocale,
			messages: (await import(`../../messages/${cookieLocale}.json`)).default,
		}
	}

	// Fall back to Accept-Language header
	const acceptLanguage = headerStore.get('Accept-Language')
	const detectedLocale = getLocaleFromAcceptLanguage(acceptLanguage)

	const locale = detectedLocale ?? defaultLocale

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
	}
})
