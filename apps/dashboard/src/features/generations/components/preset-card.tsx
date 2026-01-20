import type React from 'react'

import { cn } from '@/lib/utils'

interface PresetCardProps {
	id: string
	label: string
	icon: React.ComponentType<{ className?: string }>
	selected: boolean
	onSelect: () => void
}

export function PresetCard({ id: _id, label, icon: Icon, selected, onSelect }: PresetCardProps) {
	return (
		<button
			type='button'
			onClick={onSelect}
			className={cn(
				'relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
				'hover:border-primary/50 hover:bg-accent/50',
				selected ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2' : 'border-border bg-card',
			)}>
			<Icon className={cn('h-6 w-6', selected ? 'text-primary' : 'text-muted-foreground')} />
			<span className={cn('text-sm font-medium', selected ? 'text-primary' : 'text-foreground')}>{label}</span>
		</button>
	)
}
