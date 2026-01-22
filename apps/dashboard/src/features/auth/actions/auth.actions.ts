'use client'

import { signInWithEmail, signUpWithEmail } from '@/lib/firebase'
import { LoginSchema, SignupSchema } from '../schemas/auth.schema'

export interface AuthActionState {
	success: boolean
	error?: string
	fieldErrors?: Record<string, string[]>
}

export async function loginAction(_prevState: AuthActionState | null, formData: FormData): Promise<AuthActionState> {
	// Extract form data
	const rawData = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	}

	// Validate with Zod
	const result = LoginSchema.safeParse(rawData)

	if (!result.success) {
		const fieldErrors: Record<string, string[]> = {}
		result.error.issues.forEach((issue) => {
			const field = issue.path[0] as string
			if (!fieldErrors[field]) fieldErrors[field] = []
			fieldErrors[field].push(issue.message)
		})
		return { success: false, fieldErrors }
	}

	// Attempt Firebase authentication
	try {
		const authResult = await signInWithEmail(result.data.email, result.data.password)

		if (authResult.error) {
			return {
				success: false,
				error: mapFirebaseError(authResult.error),
			}
		}

		return { success: true }
	} catch {
		return {
			success: false,
			error: 'An unexpected error occurred. Please try again.',
		}
	}
}

export async function signupAction(_prevState: AuthActionState | null, formData: FormData): Promise<AuthActionState> {
	const rawData = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
		confirmPassword: formData.get('confirmPassword') as string,
	}

	const result = SignupSchema.safeParse(rawData)

	if (!result.success) {
		const fieldErrors: Record<string, string[]> = {}
		result.error.issues.forEach((issue) => {
			const field = issue.path[0] as string
			if (!fieldErrors[field]) fieldErrors[field] = []
			fieldErrors[field].push(issue.message)
		})
		return { success: false, fieldErrors }
	}

	try {
		const authResult = await signUpWithEmail(result.data.email, result.data.password)

		if (authResult.error) {
			return {
				success: false,
				error: mapFirebaseError(authResult.error),
			}
		}

		return { success: true }
	} catch {
		return {
			success: false,
			error: 'An unexpected error occurred. Please try again.',
		}
	}
}

// Firebase error mapping (from useAuthForm)
function mapFirebaseError(error: Error): string {
	const firebaseError = error as any
	const errorCode = firebaseError.code ?? ''

	const errorMessages: Record<string, string> = {
		'auth/email-already-in-use': 'An account with this email already exists.',
		'auth/invalid-email': 'Please enter a valid email address.',
		'auth/weak-password': 'Password should be at least 6 characters.',
		'auth/user-not-found': 'No account found with this email.',
		'auth/wrong-password': 'Incorrect password.',
		'auth/invalid-credential': 'Invalid email or password.',
		'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
		'auth/user-disabled': 'This account has been disabled.',
		'auth/operation-not-allowed': 'This sign-in method is not enabled.',
		'auth/network-request-failed': 'Network error. Please check your connection.',
		'auth/popup-closed-by-user': 'Sign-in popup was closed.',
		'auth/popup-blocked': 'Sign-in popup was blocked by your browser.',
	}

	return errorMessages[errorCode] || error.message || 'An unexpected error occurred.'
}
