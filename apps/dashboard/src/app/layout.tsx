import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { ThemeProvider } from '@/components/providers'
import './globals.css'

const notoSans = Noto_Sans({
	variable: '--font-noto-sans',
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
	title: 'Foundry Dashboard',
	description: 'Foundry Dashboard Application',
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const locale = await getLocale()
	const messages = await getMessages()

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`${notoSans.variable} font-sans antialiased`}>
				<NextIntlClientProvider messages={messages}>
					<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
						{children}
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
