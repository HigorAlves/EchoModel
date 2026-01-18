'use client'

import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Bank card styles
const cardStyles = {
	blue: 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900',
	green: 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900',
	purple: 'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900',
	orange: 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-800',
}

type CardStyle = keyof typeof cardStyles

interface BankCardPreviewProps {
	style?: CardStyle
	className?: string
	bankName?: string
	accountHolder?: string
	accountNumber?: string
	accountType?: 'checking' | 'savings'
}

export function BankCardPreview({
	style = 'blue',
	className,
	bankName = '',
	accountHolder = '',
	accountNumber = '',
	accountType = 'checking',
}: BankCardPreviewProps) {
	const displayBankName = bankName || 'BANK NAME'
	const displayHolder = accountHolder || 'ACCOUNT HOLDER'
	const displayNumber = accountNumber ? `****${accountNumber.slice(-4)}` : '****0000'
	const displayType = accountType === 'checking' ? 'Checking' : 'Savings'

	return (
		<div className={cn('h-48 w-80', className)}>
			<div className={cn('relative h-full w-full rounded-xl p-6 shadow-2xl', cardStyles[style])}>
				{/* Bank Logo and Name */}
				<div className='mb-6 flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<div className='flex h-10 w-10 items-center justify-center rounded-full bg-white/20'>
							<Building2 className='h-5 w-5 text-white' />
						</div>
						<span className='font-semibold text-white'>{displayBankName}</span>
					</div>
					<span className='rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white'>{displayType}</span>
				</div>

				{/* Account Number */}
				<div className='mb-6'>
					<p className='text-xs uppercase text-white/70'>Account Number</p>
					<p className='font-mono text-xl tracking-wider text-white'>{displayNumber}</p>
				</div>

				{/* Account Holder */}
				<div className='flex justify-between'>
					<div>
						<p className='text-xs uppercase text-white/70'>Account Holder</p>
						<p className='font-medium uppercase tracking-wide text-white'>{displayHolder}</p>
					</div>
					<div className='flex items-end'>
						<div className='h-8 w-12 rounded bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 opacity-80' />
					</div>
				</div>
			</div>
		</div>
	)
}

export type { CardStyle as BankCardStyle }
