import { z } from 'zod'

export const LoginSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
	password: z.string().min(1, 'Password is required'),
})

export const SignupSchema = z
	.object({
		email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string().min(1, 'Please confirm your password'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	})

export const ForgotPasswordSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type SignupInput = z.infer<typeof SignupSchema>
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
