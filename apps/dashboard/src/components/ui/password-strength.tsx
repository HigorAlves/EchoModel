'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
	password: string
	className?: string
}

interface StrengthResult {
	score: number
	labelKey: 'veryWeak' | 'weak' | 'fair' | 'strong' | 'veryStrong'
	color: string
}

function calculateStrength(password: string): StrengthResult {
	if (!password) {
		return { score: 0, labelKey: 'veryWeak', color: 'bg-muted' }
	}

	let score = 0

	// Length checks
	if (password.length >= 8) score += 1
	if (password.length >= 12) score += 1
	if (password.length >= 16) score += 1

	// Character variety checks
	if (/[a-z]/.test(password)) score += 1
	if (/[A-Z]/.test(password)) score += 1
	if (/[0-9]/.test(password)) score += 1
	if (/[^a-zA-Z0-9]/.test(password)) score += 1

	// Normalize to 0-4 scale
	const normalizedScore = Math.min(4, Math.floor(score / 1.75))

	const levels: StrengthResult[] = [
		{ score: 0, labelKey: 'veryWeak', color: 'bg-destructive' },
		{ score: 1, labelKey: 'weak', color: 'bg-orange-500' },
		{ score: 2, labelKey: 'fair', color: 'bg-yellow-500' },
		{ score: 3, labelKey: 'strong', color: 'bg-emerald-500' },
		{ score: 4, labelKey: 'veryStrong', color: 'bg-emerald-600' },
	]

	return levels[normalizedScore] as StrengthResult
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
	const t = useTranslations('passwordStrength')
	const strength = useMemo(() => calculateStrength(password), [password])

	return (
		<div className={cn('space-y-2', className)}>
			<div className='flex gap-1'>
				{[0, 1, 2, 3].map((index) => (
					<div
						key={index}
						className={cn(
							'h-1.5 flex-1 rounded-full transition-colors duration-300',
							password && index <= strength.score - 1 ? strength.color : 'bg-muted',
						)}
					/>
				))}
			</div>
			{password && (
				<p className={cn('text-xs transition-opacity duration-300', password ? 'opacity-100' : 'opacity-0')}>
					{t('label')} <span className='font-medium'>{t(strength.labelKey)}</span>
				</p>
			)}
		</div>
	)
}
