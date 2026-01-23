'use client'

import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface SelectionCardProps {
	selected: boolean
	onClick: () => void
	disabled?: boolean
	className?: string
	children: React.ReactNode
}

export function SelectionCard({ selected, onClick, disabled, className, children }: SelectionCardProps) {
	return (
		<motion.button
			type='button'
			onClick={onClick}
			disabled={disabled}
			className={cn(
				'relative rounded-lg border p-4 text-left transition-all',
				selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted hover:border-primary/50',
				disabled && 'cursor-not-allowed opacity-50',
				className,
			)}
			whileHover={disabled ? undefined : { scale: 1.02 }}
			whileTap={disabled ? undefined : { scale: 0.98 }}>
			{selected && (
				<motion.div
					className='absolute right-2 top-2 h-2 w-2 rounded-full bg-primary'
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: 'spring', stiffness: 500, damping: 25 }}
				/>
			)}
			{children}
		</motion.button>
	)
}

interface SelectionCardGridProps {
	children: React.ReactNode
	columns?: 2 | 3 | 4
	className?: string
}

export function SelectionCardGrid({ children, columns = 3, className }: SelectionCardGridProps) {
	const gridCols = {
		2: 'sm:grid-cols-2',
		3: 'sm:grid-cols-3',
		4: 'sm:grid-cols-2 lg:grid-cols-4',
	}

	return <div className={cn('grid gap-3', gridCols[columns], className)}>{children}</div>
}

interface SelectionCardContentProps {
	label: string
	description?: string
	className?: string
}

export function SelectionCardContent({ label, description, className }: SelectionCardContentProps) {
	return (
		<div className={className}>
			<div className='font-medium'>{label}</div>
			{description && <div className='text-muted-foreground mt-1 text-xs'>{description}</div>}
		</div>
	)
}
