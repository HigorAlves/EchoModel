'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

export function ThemeSwitcher() {
	const { resolvedTheme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const buttonRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		setMounted(true)
	}, [])

	const handleClick = useCallback(() => {
		const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'

		// Check if View Transitions API is supported
		if (!document.startViewTransition) {
			setTheme(newTheme)
			return
		}

		// Get button position for the circular reveal origin
		const button = buttonRef.current
		if (!button) {
			setTheme(newTheme)
			return
		}

		const rect = button.getBoundingClientRect()
		const x = rect.left + rect.width / 2
		const y = rect.top + rect.height / 2

		// Calculate the maximum radius needed to cover the entire viewport
		const maxRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

		// Set CSS custom properties for the animation origin
		document.documentElement.style.setProperty('--theme-toggle-x', `${x}px`)
		document.documentElement.style.setProperty('--theme-toggle-y', `${y}px`)
		document.documentElement.style.setProperty('--theme-toggle-radius', `${maxRadius}px`)

		// Start the view transition
		document.startViewTransition(() => {
			setTheme(newTheme)
		})
	}, [resolvedTheme, setTheme])

	// Prevent hydration mismatch by not rendering theme-specific content until mounted
	if (!mounted) {
		return (
			<Button variant='outline' size='icon-sm' aria-label='Toggle theme' className='relative'>
				<span className='size-4' />
			</Button>
		)
	}

	return (
		<Button
			ref={buttonRef}
			variant='outline'
			size='icon-sm'
			onClick={handleClick}
			aria-label='Toggle theme'
			className='relative'>
			<Sun className='size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
			<Moon className='absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
		</Button>
	)
}
