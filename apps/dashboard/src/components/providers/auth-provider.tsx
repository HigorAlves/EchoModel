'use client'

import type { User } from 'firebase/auth'
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import {
	type AuthResult,
	signInWithEmail,
	signInWithGoogle,
	signOut,
	signUpWithEmail,
	subscribeToAuthState,
} from '@/lib/firebase'

interface AuthContextValue {
	user: User | null
	isLoading: boolean
	isAuthenticated: boolean
	signUp: (email: string, password: string) => Promise<AuthResult>
	signIn: (email: string, password: string) => Promise<AuthResult>
	signInGoogle: () => Promise<AuthResult>
	logout: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
	children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const unsubscribe = subscribeToAuthState((firebaseUser) => {
			setUser(firebaseUser)
			setIsLoading(false)
		})

		return unsubscribe
	}, [])

	const value: AuthContextValue = {
		user,
		isLoading,
		isAuthenticated: !!user,
		signUp: signUpWithEmail,
		signIn: signInWithEmail,
		signInGoogle: signInWithGoogle,
		logout: signOut,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
