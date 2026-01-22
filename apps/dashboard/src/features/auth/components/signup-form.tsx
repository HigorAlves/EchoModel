'use client'

import { Apple, Chrome, Lock, Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useActionState, useEffect, useState } from 'react'
import { useAuth } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { PasswordInput } from '@/components/ui/password-input'
import { PasswordStrength } from '@/components/ui/password-strength'
import { cn } from '@/lib/utils'
import { signupAction } from '../actions/auth.actions'

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
	const t = useTranslations('auth.signup')
	const tCommon = useTranslations('common')
	const router = useRouter()
	const { signInGoogle } = useAuth()

	const [state, formAction, isPending] = useActionState(signupAction, null)
	const [googleLoading, setGoogleLoading] = useState(false)
	const [passwordValue, setPasswordValue] = useState('')

	useEffect(() => {
		if (state?.success) {
			router.push('/dashboard')
		}
	}, [state?.success, router])

	const handleGoogleSignIn = async () => {
		setGoogleLoading(true)
		try {
			const result = await signInGoogle()
			if (!result.error) {
				router.push('/dashboard')
			}
		} finally {
			setGoogleLoading(false)
		}
	}

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card className='overflow-hidden p-0'>
				<CardContent className='grid p-0 md:grid-cols-2'>
					<form className='p-6 md:p-8' action={formAction}>
						<FieldGroup>
							<div className='flex flex-col items-center gap-2 text-center'>
								<h1 className='text-2xl font-bold'>{t('title')}</h1>
								<p className='text-muted-foreground text-sm text-balance'>{t('subtitle')}</p>
							</div>

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

							{/* Password field with icon and strength meter */}
							<Field>
								<FieldLabel htmlFor='password'>{tCommon('password')}</FieldLabel>
								<div className='relative flex w-full items-center'>
									<Lock className='text-muted-foreground absolute left-2.5 size-4 pointer-events-none z-10' />
									<PasswordInput
										id='password'
										name='password'
										className='pl-9'
										value={passwordValue}
										onChange={(e) => setPasswordValue(e.target.value)}
										aria-invalid={!!state?.fieldErrors?.password}
										required
									/>
								</div>
								<PasswordStrength password={passwordValue} />
								{state?.fieldErrors?.password && <FieldError>{state.fieldErrors.password.join(', ')}</FieldError>}
							</Field>

							{/* Confirm password field with icon */}
							<Field>
								<FieldLabel htmlFor='confirm-password'>{tCommon('confirmPassword')}</FieldLabel>
								<div className='relative flex w-full items-center'>
									<Lock className='text-muted-foreground absolute left-2.5 size-4 pointer-events-none z-10' />
									<PasswordInput
										id='confirm-password'
										name='confirmPassword'
										className='pl-9'
										aria-invalid={!!state?.fieldErrors?.confirmPassword}
										required
									/>
								</div>
								{state?.fieldErrors?.confirmPassword ? (
									<FieldError>{state.fieldErrors.confirmPassword.join(', ')}</FieldError>
								) : (
									<FieldDescription>{t('passwordMinLength')}</FieldDescription>
								)}
							</Field>

							{/* Submit button */}
							<Field>
								<Button type='submit' disabled={isPending}>
									{isPending ? t('creatingAccount') : t('createAccountButton')}
								</Button>
							</Field>

							<FieldSeparator className='*:data-[slot=field-separator-content]:bg-card'>
								{t('orContinueWith')}
							</FieldSeparator>

							{/* Social login buttons */}
							<Field className='grid grid-cols-3 gap-4'>
								<Button variant='outline' type='button'>
									<Apple className='size-5' />
									<span className='sr-only'>{t('signupWithApple')}</span>
								</Button>
								<Button variant='outline' type='button' onClick={handleGoogleSignIn} disabled={googleLoading}>
									<Chrome className='size-5' />
									<span className='sr-only'>{t('signupWithGoogle')}</span>
								</Button>
								<Button variant='outline' type='button'>
									<Apple className='size-5' />
									<span className='sr-only'>{t('signupWithMeta')}</span>
								</Button>
							</Field>

							<FieldDescription className='text-center'>
								{t('hasAccount')} <Link href='/login'>{t('signinLink')}</Link>
							</FieldDescription>
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
