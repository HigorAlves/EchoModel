'use client'

import { useCallback, useState } from 'react'
import {
	calculateAccountSummary,
	filterAccountsByType,
	getAccountById,
	getTransactionsForAccount,
	mockAccounts,
} from '../data/mock-accounts'
import type { Account, AccountFilter, AccountSummary, CreateAccountInput, Transaction } from '../types'

interface UseAccountsState {
	accounts: Account[]
	filteredAccounts: Account[]
	summary: AccountSummary
	filter: AccountFilter
	isLoading: boolean
	error: { name: string; message: string } | null
}

export function useAccounts() {
	const [state, setState] = useState<UseAccountsState>(() => {
		const accounts = mockAccounts
		return {
			accounts,
			filteredAccounts: accounts,
			summary: calculateAccountSummary(accounts),
			filter: 'all',
			isLoading: false,
			error: null,
		}
	})

	const setFilter = useCallback((filter: AccountFilter) => {
		setState((prev) => ({
			...prev,
			filter,
			filteredAccounts: filterAccountsByType(prev.accounts, filter),
		}))
	}, [])

	const fetchAccounts = useCallback(async () => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }))
		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 500))
			const accounts = mockAccounts
			setState((prev) => ({
				...prev,
				accounts,
				filteredAccounts: filterAccountsByType(accounts, prev.filter),
				summary: calculateAccountSummary(accounts),
				isLoading: false,
			}))
		} catch (_err) {
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: { name: 'Error', message: 'Failed to fetch accounts' },
			}))
		}
	}, [])

	const addAccount = useCallback(async (input: CreateAccountInput) => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }))
		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 500))

			const newAccount = createAccountFromInput(input)

			setState((prev) => {
				const accounts = [...prev.accounts, newAccount]
				return {
					...prev,
					accounts,
					filteredAccounts: filterAccountsByType(accounts, prev.filter),
					summary: calculateAccountSummary(accounts),
					isLoading: false,
				}
			})
			return newAccount
		} catch (_err) {
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: { name: 'Error', message: 'Failed to add account' },
			}))
			throw _err
		}
	}, [])

	const updateAccount = useCallback(async (id: string, updates: Partial<Account>) => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }))
		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 500))

			setState((prev) => {
				const accounts = prev.accounts.map((account) =>
					account.id === id ? ({ ...account, ...updates, updatedAt: new Date() } as Account) : account,
				)
				return {
					...prev,
					accounts,
					filteredAccounts: filterAccountsByType(accounts, prev.filter),
					summary: calculateAccountSummary(accounts),
					isLoading: false,
				}
			})
		} catch (_err) {
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: { name: 'Error', message: 'Failed to update account' },
			}))
			throw _err
		}
	}, [])

	const deleteAccount = useCallback(async (id: string) => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }))
		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 500))

			setState((prev) => {
				const accounts = prev.accounts.filter((account) => account.id !== id)
				return {
					...prev,
					accounts,
					filteredAccounts: filterAccountsByType(accounts, prev.filter),
					summary: calculateAccountSummary(accounts),
					isLoading: false,
				}
			})
		} catch (_err) {
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: { name: 'Error', message: 'Failed to delete account' },
			}))
			throw _err
		}
	}, [])

	const getAccount = useCallback((id: string): Account | undefined => {
		return getAccountById(id)
	}, [])

	const getAccountTransactions = useCallback((accountId: string): Transaction[] => {
		return getTransactionsForAccount(accountId)
	}, [])

	return {
		...state,
		setFilter,
		fetchAccounts,
		addAccount,
		updateAccount,
		deleteAccount,
		getAccount,
		getAccountTransactions,
	}
}

// Helper function to create account from input
function createAccountFromInput(input: CreateAccountInput): Account {
	const baseAccount = {
		id: `account-${Date.now()}`,
		name: input.name,
		status: 'active' as const,
		balance: input.balance,
		currency: input.currency,
		color: input.color,
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	switch (input.type) {
		case 'bank':
			return {
				...baseAccount,
				type: 'bank',
				bankName: input.bankName,
				accountNumber: input.accountNumber,
				subtype: input.subtype,
			}
		case 'credit_card':
			return {
				...baseAccount,
				type: 'credit_card',
				bankName: input.bankName,
				cardNumber: input.cardNumber,
				cardBrand: input.cardBrand,
				creditLimit: input.creditLimit,
				availableCredit: input.creditLimit - Math.abs(input.balance),
				minimumPayment: Math.abs(input.balance) * 0.02,
				dueDate: input.dueDate,
				apr: input.apr,
			}
		case 'cash':
			return {
				...baseAccount,
				type: 'cash',
				location: input.location,
			}
		case 'wallet':
			return {
				...baseAccount,
				type: 'wallet',
				walletType: input.walletType,
				provider: input.provider,
			}
	}
}
