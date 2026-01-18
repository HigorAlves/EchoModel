import type {
	Account,
	AccountSummary,
	BankAccount,
	CashAccount,
	CreditCard,
	Currency,
	Transaction,
	WalletAccount,
} from '../types'

// Common currencies
export const currencies = {
	USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
	BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
	EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
	GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
} as const satisfies Record<string, Currency>

// Mock bank accounts
export const mockBankAccounts: BankAccount[] = [
	{
		id: 'bank-1',
		name: 'Chase Checking',
		type: 'bank',
		status: 'active',
		balance: 5847.32,
		currency: currencies.USD,
		color: '#0066CC',
		bankName: 'Chase',
		accountNumber: '****4521',
		subtype: 'checking',
		createdAt: new Date('2023-01-15'),
		updatedAt: new Date('2024-12-01'),
	},
	{
		id: 'bank-2',
		name: 'Chase Savings',
		type: 'bank',
		status: 'active',
		balance: 15230.0,
		currency: currencies.USD,
		color: '#0066CC',
		bankName: 'Chase',
		accountNumber: '****7832',
		subtype: 'savings',
		createdAt: new Date('2023-01-15'),
		updatedAt: new Date('2024-11-28'),
	},
	{
		id: 'bank-3',
		name: 'Bank of America Savings',
		type: 'bank',
		status: 'active',
		balance: 8450.75,
		currency: currencies.USD,
		color: '#E31837',
		bankName: 'Bank of America',
		accountNumber: '****9156',
		subtype: 'savings',
		createdAt: new Date('2022-06-20'),
		updatedAt: new Date('2024-11-15'),
	},
	{
		id: 'bank-4',
		name: 'Itaú Conta Corrente',
		type: 'bank',
		status: 'active',
		balance: 12500.0,
		currency: currencies.BRL,
		color: '#FF6600',
		bankName: 'Itaú',
		accountNumber: '****3847',
		subtype: 'checking',
		createdAt: new Date('2023-03-10'),
		updatedAt: new Date('2024-12-05'),
	},
]

// Mock credit cards
export const mockCreditCards: CreditCard[] = [
	{
		id: 'cc-1',
		name: 'Chase Sapphire Preferred',
		type: 'credit_card',
		status: 'active',
		balance: -2340.5, // Negative represents debt
		currency: currencies.USD,
		color: '#1A1F71',
		cardNumber: '****4587',
		cardBrand: 'visa',
		creditLimit: 15000,
		availableCredit: 12659.5,
		minimumPayment: 75.0,
		dueDate: new Date('2025-01-25'),
		apr: 21.99,
		bankName: 'Chase',
		createdAt: new Date('2022-08-01'),
		updatedAt: new Date('2024-12-10'),
	},
	{
		id: 'cc-2',
		name: 'American Express Gold',
		type: 'credit_card',
		status: 'active',
		balance: -1250.0,
		currency: currencies.USD,
		color: '#B8860B',
		cardNumber: '****1234',
		cardBrand: 'amex',
		creditLimit: 20000,
		availableCredit: 18750.0,
		minimumPayment: 50.0,
		dueDate: new Date('2025-01-20'),
		apr: 19.99,
		bankName: 'American Express',
		createdAt: new Date('2021-05-15'),
		updatedAt: new Date('2024-12-08'),
	},
	{
		id: 'cc-3',
		name: 'Capital One Venture',
		type: 'credit_card',
		status: 'active',
		balance: -890.25,
		currency: currencies.USD,
		color: '#D03027',
		cardNumber: '****9876',
		cardBrand: 'mastercard',
		creditLimit: 10000,
		availableCredit: 9109.75,
		minimumPayment: 35.0,
		dueDate: new Date('2025-01-15'),
		apr: 24.99,
		bankName: 'Capital One',
		createdAt: new Date('2023-02-28'),
		updatedAt: new Date('2024-12-05'),
	},
]

// Mock cash accounts
export const mockCashAccounts: CashAccount[] = [
	{
		id: 'cash-1',
		name: 'Home Safe',
		type: 'cash',
		status: 'active',
		balance: 500.0,
		currency: currencies.USD,
		color: '#228B22',
		location: 'Home office',
		createdAt: new Date('2023-06-01'),
		updatedAt: new Date('2024-11-20'),
	},
	{
		id: 'cash-2',
		name: 'Emergency Cash',
		type: 'cash',
		status: 'active',
		balance: 200.0,
		currency: currencies.USD,
		color: '#228B22',
		location: 'Car',
		createdAt: new Date('2023-06-01'),
		updatedAt: new Date('2024-10-15'),
	},
]

// Mock wallet accounts
export const mockWalletAccounts: WalletAccount[] = [
	{
		id: 'wallet-1',
		name: 'PayPal',
		type: 'wallet',
		status: 'active',
		balance: 342.18,
		currency: currencies.USD,
		color: '#003087',
		walletType: 'digital',
		provider: 'PayPal',
		createdAt: new Date('2020-01-15'),
		updatedAt: new Date('2024-12-01'),
	},
	{
		id: 'wallet-2',
		name: 'Venmo',
		type: 'wallet',
		status: 'active',
		balance: 125.5,
		currency: currencies.USD,
		color: '#3D95CE',
		walletType: 'digital',
		provider: 'Venmo',
		createdAt: new Date('2021-03-20'),
		updatedAt: new Date('2024-11-28'),
	},
]

// All accounts combined
export const mockAccounts: Account[] = [
	...mockBankAccounts,
	...mockCreditCards,
	...mockCashAccounts,
	...mockWalletAccounts,
]

// Mock transactions for detail pages
export const mockTransactions: Transaction[] = [
	{
		id: 'tx-1',
		accountId: 'bank-1',
		description: 'Salary Deposit',
		amount: 5200.0,
		date: new Date('2024-12-01'),
		category: 'Income',
		type: 'income',
	},
	{
		id: 'tx-2',
		accountId: 'bank-1',
		description: 'Grocery Store',
		amount: -156.32,
		date: new Date('2024-12-05'),
		category: 'Food',
		type: 'expense',
	},
	{
		id: 'tx-3',
		accountId: 'bank-1',
		description: 'Electric Bill',
		amount: -124.5,
		date: new Date('2024-12-03'),
		category: 'Utilities',
		type: 'expense',
	},
	{
		id: 'tx-4',
		accountId: 'cc-1',
		description: 'Amazon.com',
		amount: -89.99,
		date: new Date('2024-12-08'),
		category: 'Shopping',
		type: 'expense',
	},
	{
		id: 'tx-5',
		accountId: 'cc-1',
		description: 'Netflix Subscription',
		amount: -15.99,
		date: new Date('2024-12-01'),
		category: 'Entertainment',
		type: 'expense',
	},
	{
		id: 'tx-6',
		accountId: 'cc-2',
		description: 'Restaurant',
		amount: -78.5,
		date: new Date('2024-12-06'),
		category: 'Food',
		type: 'expense',
	},
	{
		id: 'tx-7',
		accountId: 'wallet-1',
		description: 'Freelance Payment',
		amount: 250.0,
		date: new Date('2024-12-04'),
		category: 'Income',
		type: 'income',
	},
	{
		id: 'tx-8',
		accountId: 'wallet-2',
		description: 'Split Dinner',
		amount: 45.0,
		date: new Date('2024-12-07'),
		category: 'Food',
		type: 'income',
	},
]

// Helper function to calculate account summary
export function calculateAccountSummary(accounts: Account[]): AccountSummary {
	const summary: AccountSummary = {
		totalBankBalance: 0,
		totalCreditDebt: 0,
		totalAvailableCredit: 0,
		totalCashAndWallets: 0,
		accountCount: {
			bank: 0,
			creditCard: 0,
			cash: 0,
			wallet: 0,
			total: accounts.length,
		},
	}

	for (const account of accounts) {
		switch (account.type) {
			case 'bank':
				summary.totalBankBalance += account.balance
				summary.accountCount.bank++
				break
			case 'credit_card':
				summary.totalCreditDebt += Math.abs(account.balance)
				summary.totalAvailableCredit += account.availableCredit
				summary.accountCount.creditCard++
				break
			case 'cash':
				summary.totalCashAndWallets += account.balance
				summary.accountCount.cash++
				break
			case 'wallet':
				summary.totalCashAndWallets += account.balance
				summary.accountCount.wallet++
				break
		}
	}

	return summary
}

// Helper to get transactions for a specific account
export function getTransactionsForAccount(accountId: string): Transaction[] {
	return mockTransactions.filter((tx) => tx.accountId === accountId)
}

// Helper to get account by ID
export function getAccountById(id: string): Account | undefined {
	return mockAccounts.find((account) => account.id === id)
}

// Helper to filter accounts by type
export function filterAccountsByType(accounts: Account[], type: 'all' | Account['type']): Account[] {
	if (type === 'all') {
		return accounts
	}
	return accounts.filter((account) => account.type === type)
}
