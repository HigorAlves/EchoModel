'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Image, Palette, Settings, User } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import type { Step } from '../../hooks'

interface WizardProgressProps {
	currentStep: Step
	onStepClick?: (step: Step) => void
}

const STEPS = [
	{ id: 1 as Step, icon: User, label: 'Basic Info' },
	{ id: 2 as Step, icon: Palette, label: 'Appearance' },
	{ id: 3 as Step, icon: Settings, label: 'Fashion' },
	{ id: 4 as Step, icon: Image, label: 'Images' },
	{ id: 5 as Step, icon: CheckCircle, label: 'Review' },
]

export function WizardProgress({ currentStep, onStepClick }: WizardProgressProps) {
	const progressPercentage = ((currentStep - 1) / 4) * 100

	return (
		<div className='w-full space-y-4'>
			{/* Progress Bar */}
			<Progress value={progressPercentage} className='h-2' />

			{/* Step Indicators */}
			<div className='flex justify-between'>
				{STEPS.map((step) => {
					const Icon = step.icon
					const isCompleted = currentStep > step.id
					const isCurrent = currentStep === step.id
					const isClickable = isCompleted || isCurrent

					return (
						<motion.button
							key={step.id}
							type='button'
							disabled={!isClickable}
							onClick={() => isClickable && onStepClick?.(step.id)}
							className={cn(
								'flex flex-col items-center gap-2 transition-all',
								isClickable ? 'cursor-pointer' : 'cursor-not-allowed',
							)}
							whileHover={isClickable ? { scale: 1.05 } : undefined}
							whileTap={isClickable ? { scale: 0.95 } : undefined}>
							<motion.div
								className={cn(
									'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
									isCompleted
										? 'border-primary bg-primary text-primary-foreground'
										: isCurrent
											? 'border-primary bg-primary/10 text-primary'
											: 'border-muted bg-muted/50 text-muted-foreground',
								)}
								initial={false}
								animate={{
									scale: isCurrent ? 1.1 : 1,
								}}
								transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
								{isCompleted ? (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
										<CheckCircle className='h-5 w-5' />
									</motion.div>
								) : (
									<Icon className='h-5 w-5' />
								)}
							</motion.div>
							<span
								className={cn(
									'text-xs font-medium transition-colors',
									isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground',
								)}>
								{step.label}
							</span>
						</motion.button>
					)
				})}
			</div>
		</div>
	)
}
