'use client'

import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface PasswordInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ className, ...props }, ref) => {
	const [showPassword, setShowPassword] = useState(false)

	return (
		<div className='relative'>
			<input
				type={showPassword ? 'text' : 'password'}
				data-slot='input'
				className={cn(
					'dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-9 rounded-md border bg-transparent px-2.5 py-1 pr-9 text-base shadow-xs transition-[color,box-shadow] focus-visible:ring-[3px] aria-invalid:ring-[3px] md:text-sm placeholder:text-muted-foreground w-full min-w-0 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
					className,
				)}
				ref={ref}
				{...props}
			/>
			<button
				type='button'
				onClick={() => setShowPassword(!showPassword)}
				className='text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors'
				tabIndex={-1}
				aria-label={showPassword ? 'Hide password' : 'Show password'}>
				{showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
			</button>
		</div>
	)
})
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
