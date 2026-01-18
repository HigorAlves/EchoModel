'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/providers'

interface FirebaseError extends Error {
	code?: string
}

function mapFirebaseError(error: Error): string {
	const firebaseError = error as FirebaseError
	const errorCode = firebaseError.code ?? ''

	const errorMessages: Record<string, string> = {
		'auth/email-already-in-use': 'An account with this email already exists.',
		'auth/invalid-email': 'Please enter a valid email address.',
		'auth/operation-not-allowed': 'This sign-in method is not enabled.',
		'auth/weak-password': 'Password should be at least 6 characters.',
		'auth/user-disabled': 'This account has been disabled.',
		'auth/user-not-found': 'No account found with this email.',
		'auth/wrong-password': 'Incorrect password.',
		'auth/invalid-credential': 'Invalid email or password.',
		'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
		'auth/network-request-failed': 'Network error. Please check your connection.',
		'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
		'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups.',
	}

	return errorMessages[errorCode] || firebaseError.message || 'An unexpected error occurred.'
}

export interface UseAuthFormReturn {
	error: string | null
	isSubmitting: boolean
	handleLogin: (email: string, password: string) => Promise<void>
	handleSignup: (email: string, password: string) => Promise<void>
	handleGoogleSignIn: () => Promise<void>
	clearError: () => void
}

export function useAuthForm(): UseAuthFormReturn {
	const router = useRouter()
	const { signIn, signUp, signInGoogle } = useAuth()
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const clearError = () => setError(null)

	const handleLogin = async (email: string, password: string) => {
		setError(null)
		setIsSubmitting(true)

		try {
			const result = await signIn(email, password)

			if (result.error) {
				setError(mapFirebaseError(result.error))
				return
			}

			router.push('/dashboard')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleSignup = async (email: string, password: string) => {
		setError(null)
		setIsSubmitting(true)

		try {
			const result = await signUp(email, password)

			if (result.error) {
				setError(mapFirebaseError(result.error))
				return
			}

			router.push('/dashboard')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleGoogleSignIn = async () => {
		setError(null)
		setIsSubmitting(true)

		try {
			const result = await signInGoogle()

			if (result.error) {
				setError(mapFirebaseError(result.error))
				return
			}

			router.push('/dashboard')
		} finally {
			setIsSubmitting(false)
		}
	}

	return {
		error,
		isSubmitting,
		handleLogin,
		handleSignup,
		handleGoogleSignIn,
		clearError,
	}
}
