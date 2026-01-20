'use client'

import type * as React from 'react'

import { cn } from '@/lib/utils'

interface SwitchProps extends Omit<React.ComponentProps<'input'>, 'type'> {
	checked?: boolean
	onCheckedChange?: (checked: boolean) => void
}

function Switch({ className, checked, onCheckedChange, onChange, ...props }: SwitchProps) {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange?.(e)
		onCheckedChange?.(e.target.checked)
	}

	return (
		<label
			className={cn(
				'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors',
				checked ? 'bg-primary' : 'bg-input',
				props.disabled && 'cursor-not-allowed opacity-50',
				className,
			)}>
			<input type='checkbox' className='sr-only' checked={checked} onChange={handleChange} {...props} />
			<span
				className={cn(
					'inline-block h-5 w-5 transform rounded-full bg-background shadow-lg transition-transform',
					checked ? 'translate-x-5' : 'translate-x-0.5',
				)}
			/>
		</label>
	)
}

export { Switch }
