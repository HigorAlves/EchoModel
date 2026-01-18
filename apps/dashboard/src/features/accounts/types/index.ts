// Account types
export type AccountType = 'bank' | 'credit_card' | 'cash' | 'wallet'
export type AccountStatus = 'active' | 'inactive' | 'closed'
export type BankAccountSubtype = 'checking' | 'savings'
export type CreditCardBrand = 'visa' | 'mastercard' | 'amex' | 'discover'
export type WalletType = 'digital' | 'physical'

// Currency interface
export interface Currency {
	code: string
	symbol: string
	name: string
}

// Base account interface
export interface BaseAccount {
	id: string
	name: string
	type: AccountType
	status: AccountStatus
	balance: number
	currency: Currency
	color?: string
	createdAt: Date
	updatedAt: Date
}

// Bank account interface
export interface BankAccount extends BaseAccount {
	type: 'bank'
	bankName: string
	accountNumber: string
	subtype: BankAccountSubtype
}

// Credit card interface
export interface CreditCard extends BaseAccount {
	type: 'credit_card'
	cardNumber: string
	cardBrand: CreditCardBrand
	creditLimit: number
	availableCredit: number
	minimumPayment: number
	dueDate: Date
	apr: number
	bankName: string
}

// Cash account interface
export interface CashAccount extends BaseAccount {
	type: 'cash'
	location?: string
}

// Wallet account interface
export interface WalletAccount extends BaseAccount {
	type: 'wallet'
	walletType: WalletType
	provider?: string
}

// Union type for all account types
export type Account = BankAccount | CreditCard | CashAccount | WalletAccount

// Account summary for dashboard
export interface AccountSummary {
	totalBankBalance: number
	totalCreditDebt: number
	totalAvailableCredit: number
	totalCashAndWallets: number
	accountCount: {
		bank: number
		creditCard: number
		cash: number
		wallet: number
		total: number
	}
}

// Account filter options
export type AccountFilter = 'all' | AccountType

// Transaction for account detail page
export interface Transaction {
	id: string
	accountId: string
	description: string
	amount: number
	date: Date
	category: string
	type: 'income' | 'expense' | 'transfer'
}

// Input types for creating accounts
export interface CreateBankAccountInput {
	name: string
	bankName: string
	accountNumber: string
	subtype: BankAccountSubtype
	balance: number
	currency: Currency
	color?: string
}

export interface CreateCreditCardInput {
	name: string
	bankName: string
	cardNumber: string
	cardBrand: CreditCardBrand
	creditLimit: number
	balance: number
	apr: number
	dueDate: Date
	currency: Currency
	color?: string
}

export interface CreateCashAccountInput {
	name: string
	balance: number
	currency: Currency
	location?: string
	color?: string
}

export interface CreateWalletAccountInput {
	name: string
	walletType: WalletType
	provider?: string
	balance: number
	currency: Currency
	color?: string
}

export type CreateAccountInput =
	| ({ type: 'bank' } & CreateBankAccountInput)
	| ({ type: 'credit_card' } & CreateCreditCardInput)
	| ({ type: 'cash' } & CreateCashAccountInput)
	| ({ type: 'wallet' } & CreateWalletAccountInput)
