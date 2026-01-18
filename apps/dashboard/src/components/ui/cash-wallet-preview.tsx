'use client'

import { Banknote, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

// Card styles
const cardStyles = {
	cash: 'bg-gradient-to-br from-green-500 via-green-600 to-green-800',
	wallet: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800',
}

interface CashWalletPreviewProps {
	type: 'cash' | 'wallet'
	className?: string
	name?: string
	location?: string
	provider?: string
	walletType?: 'digital' | 'physical'
}

export function CashWalletPreview({
	type,
	className,
	name = '',
	location = '',
	provider = '',
	walletType = 'digital',
}: CashWalletPreviewProps) {
	const isCash = type === 'cash'
	const Icon = isCash ? Banknote : Wallet
	const displayName = name || (isCash ? 'CASH RESERVE' : 'DIGITAL WALLET')
	const displaySubtitle = isCash ? location || 'Location' : provider || 'Provider'
	const typeLabel = isCash ? 'Cash' : walletType === 'digital' ? 'Digital Wallet' : 'Physical Wallet'

	return (
		<div className={cn('h-48 w-80', className)}>
			<div className={cn('relative h-full w-full rounded-xl p-6 shadow-2xl', cardStyles[type])}>
				{/* Icon and Type */}
				<div className='mb-6 flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='flex h-12 w-12 items-center justify-center rounded-xl bg-white/20'>
							<Icon className='h-6 w-6 text-white' />
						</div>
						<div>
							<p className='text-xs uppercase text-white/70'>{typeLabel}</p>
							<p className='font-semibold text-white'>{displayName}</p>
						</div>
					</div>
				</div>

				{/* Decorative Pattern */}
				<div className='absolute right-6 top-6 opacity-10'>
					{isCash ? (
						<div className='flex gap-1'>
							<div className='h-16 w-8 rounded bg-white' style={{ transform: 'rotate(-5deg)' }} />
							<div className='h-16 w-8 rounded bg-white' style={{ transform: 'rotate(0deg)' }} />
							<div className='h-16 w-8 rounded bg-white' style={{ transform: 'rotate(5deg)' }} />
						</div>
					) : (
						<div className='grid grid-cols-3 gap-1'>
							<div className='h-4 w-4 rounded-full bg-white' />
							<div className='h-4 w-4 rounded-full bg-white' />
							<div className='h-4 w-4 rounded-full bg-white' />
							<div className='h-4 w-4 rounded-full bg-white' />
							<div className='h-4 w-4 rounded-full bg-white' />
							<div className='h-4 w-4 rounded-full bg-white' />
							<div className='h-4 w-4 rounded-full bg-white' />
							<div className='h-4 w-4 rounded-full bg-white' />
							<div className='h-4 w-4 rounded-full bg-white' />
						</div>
					)}
				</div>

				{/* Balance Display Area */}
				<div className='mb-4 rounded-lg bg-white/10 p-4'>
					<p className='text-xs uppercase text-white/70'>Available Balance</p>
					<p className='font-mono text-2xl font-bold text-white'>$0.00</p>
				</div>

				{/* Bottom Info */}
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-xs uppercase text-white/70'>{isCash ? 'Location' : 'Provider'}</p>
						<p className='text-sm font-medium text-white'>{displaySubtitle}</p>
					</div>
					{!isCash && (
						<div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/20'>
							<div className='h-4 w-4 rounded-full bg-white/60' />
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
