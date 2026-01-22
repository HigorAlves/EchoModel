'use client'

import { ArrowLeft, Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useActionState, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { forgotPasswordAction } from '../actions/auth.actions'

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
	const t = useTranslations('auth.forgotPassword')
	const tCommon = useTranslations('common')
	const router = useRouter()

	const [state, formAction, isPending] = useActionState(forgotPasswordAction, null)
	const [emailSent, setEmailSent] = useState(false)

	useEffect(() => {
		if (state?.success) {
			setEmailSent(true)
		}
	}, [state?.success])

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card className='overflow-hidden p-0'>
				<CardContent className='grid p-0 md:grid-cols-2'>
					<form className='p-6 md:p-8' action={formAction}>
						<FieldGroup>
							<div className='flex flex-col items-center gap-2 text-center'>
								<h1 className='text-2xl font-bold'>{t('title')}</h1>
								<p className='text-muted-foreground text-balance'>{t('subtitle')}</p>
							</div>

							{emailSent ? (
								<>
									{/* Success message */}
									<div className='bg-primary/10 text-primary rounded-md p-4 text-center'>
										<p className='font-medium'>{t('successTitle')}</p>
										<p className='text-muted-foreground mt-2 text-sm'>{t('successMessage')}</p>
									</div>

									<Field>
										<Button type='button' variant='outline' onClick={() => router.push('/login')} className='w-full'>
											<ArrowLeft className='size-4' />
											{t('backToLogin')}
										</Button>
									</Field>
								</>
							) : (
								<>
									{/* Global error display */}
									{state?.error && (
										<div className='bg-destructive/10 text-destructive rounded-md p-3 text-sm'>{state.error}</div>
									)}

									{/* Email field with icon */}
									<Field>
										<FieldLabel htmlFor='email'>{tCommon('email')}</FieldLabel>
										<InputGroup>
											<InputGroupInput
												id='email'
												name='email'
												type='email'
												placeholder='m@example.com'
												aria-invalid={!!state?.fieldErrors?.email}
												required
											/>
											<InputGroupAddon>
												<Mail className='size-4' />
											</InputGroupAddon>
										</InputGroup>
										{state?.fieldErrors?.email ? (
											<FieldError>{state.fieldErrors.email.join(', ')}</FieldError>
										) : (
											<FieldDescription>{t('emailDescription')}</FieldDescription>
										)}
									</Field>

									{/* Submit button */}
									<Field>
										<Button type='submit' disabled={isPending} className='w-full'>
											{isPending ? t('sendingLink') : t('sendResetLink')}
										</Button>
									</Field>

									<FieldDescription className='text-center'>
										<Link href='/login' className='hover:underline'>
											<ArrowLeft className='mr-1 inline size-3' />
											{t('backToLogin')}
										</Link>
									</FieldDescription>
								</>
							)}
						</FieldGroup>
					</form>
					<div className='bg-muted relative hidden md:block'>
						<Image
							src='/images/alexi-romano.jpg'
							alt='Image'
							fill
							className='object-cover dark:brightness-[0.4] dark:grayscale'
						/>
					</div>
				</CardContent>
			</Card>
			<FieldDescription className='px-6 text-center'>
				{t('termsAgreementStart')} <Link href='#'>{tCommon('termsOfService')}</Link> {t('termsAgreementMiddle')}{' '}
				<Link href='#'>{tCommon('privacyPolicy')}</Link>.
			</FieldDescription>
		</div>
	)
}
