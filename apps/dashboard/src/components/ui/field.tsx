'use client'

import type * as React from 'react'

import { cn } from '@/lib/utils'

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
	return <div data-slot='field-group' className={cn('flex flex-col gap-6', className)} {...props} />
}

function Field({ className, ...props }: React.ComponentProps<'div'>) {
	return <div data-slot='field' className={cn('grid gap-2', className)} {...props} />
}

function FieldLabel({ className, ...props }: React.ComponentProps<'label'>) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is passed via props
		<label
			data-slot='field-label'
			className={cn(
				'gap-2 text-sm leading-none font-medium group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50 flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed',
				className,
			)}
			{...props}
		/>
	)
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p
			data-slot='field-description'
			className={cn(
				'text-muted-foreground text-sm [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary',
				className,
			)}
			{...props}
		/>
	)
}

function FieldError({ className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p
			data-slot='field-error'
			role='alert'
			className={cn('text-destructive text-sm font-medium', className)}
			{...props}
		/>
	)
}

function FieldSeparator({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='field-separator'
			className={cn(
				'relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border',
				className,
			)}
			{...props}>
			<span data-slot='field-separator-content' className='relative z-10 bg-background px-2 text-muted-foreground'>
				{children}
			</span>
		</div>
	)
}

export { Field, FieldGroup, FieldLabel, FieldDescription, FieldError, FieldSeparator }
