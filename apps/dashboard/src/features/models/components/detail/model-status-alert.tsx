'use client'

import { Loader2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ModelDocument } from '@/lib/firebase'

interface ModelStatusAlertProps {
	status: ModelDocument['status']
	failureReason?: string | null
	onRetry?: () => void
}

export function ModelStatusAlert({ status, failureReason, onRetry }: ModelStatusAlertProps) {
	if (status === 'CALIBRATING') {
		return (
			<Card className='border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'>
				<CardContent className='flex items-center gap-4 p-6'>
					<div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
						<Loader2 className='h-6 w-6 animate-spin text-blue-600 dark:text-blue-400' />
					</div>
					<div>
						<h3 className='font-semibold text-blue-900 dark:text-blue-100'>Model is being generated</h3>
						<p className='text-sm text-blue-700 dark:text-blue-300'>
							This process may take a few minutes. You'll be notified when it's ready.
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (status === 'FAILED') {
		return (
			<Card className='border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20'>
				<CardContent className='flex items-center gap-4 p-6'>
					<div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900'>
						<X className='h-6 w-6 text-red-600 dark:text-red-400' />
					</div>
					<div className='flex-1'>
						<h3 className='font-semibold text-red-900 dark:text-red-100'>Model generation failed</h3>
						<p className='text-sm text-red-700 dark:text-red-300'>
							{failureReason ?? 'An unknown error occurred. Please try again.'}
						</p>
					</div>
					{onRetry && (
						<Button variant='outline' size='sm' onClick={onRetry}>
							Retry
						</Button>
					)}
				</CardContent>
			</Card>
		)
	}

	return null
}
