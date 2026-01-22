'use client'

import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = 'system' } = useTheme()

	// Memoize icons to prevent recreating on every render
	const icons = useMemo(
		() => ({
			success: <CircleCheckIcon className='size-4' />,
			info: <InfoIcon className='size-4' />,
			warning: <TriangleAlertIcon className='size-4' />,
			error: <OctagonXIcon className='size-4' />,
			loading: <Loader2Icon className='size-4 animate-spin' />,
		}),
		[],
	)

	// Memoize style object to prevent recreating on every render
	const customStyle = useMemo(
		() =>
			({
				'--normal-bg': 'var(--popover)',
				'--normal-text': 'var(--popover-foreground)',
				'--normal-border': 'var(--border)',
				'--border-radius': 'var(--radius)',
			}) as React.CSSProperties,
		[],
	)

	// Memoize toast options to prevent recreating on every render
	const toastOptions = useMemo(
		() => ({
			classNames: {
				toast: 'cn-toast',
			},
		}),
		[],
	)

	return (
		<Sonner
			theme={theme as ToasterProps['theme']}
			className='toaster group'
			icons={icons}
			style={customStyle}
			toastOptions={toastOptions}
			{...props}
		/>
	)
}

export { Toaster }
