import type React from 'react'

interface PresetCategoryProps {
	title: string
	description?: string
	children: React.ReactNode
}

export function PresetCategory({ title, description, children }: PresetCategoryProps) {
	return (
		<div className='space-y-3'>
			<div>
				<h3 className='text-sm font-semibold'>{title}</h3>
				{description && (
					<p className='text-xs text-muted-foreground'>{description}</p>
				)}
			</div>
			<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
				{children}
			</div>
		</div>
	)
}
