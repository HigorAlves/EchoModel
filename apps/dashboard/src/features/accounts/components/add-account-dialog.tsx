'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Banknote, Building2, Check, CreditCard, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { BankCardPreview } from '@/components/ui/bank-card-preview'
import { Button } from '@/components/ui/button'
import { CashWalletPreview } from '@/components/ui/cash-wallet-preview'
import {
	CreditCardCvvInput,
	CreditCardDisplay,
	CreditCardExpiryInput,
	CreditCardFlipProvider,
	CreditCardHolderInput,
	CreditCardNumberInput,
	detectCardBrand,
} from '@/components/ui/credit-card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { currencies } from '../data/mock-accounts'
import type { AccountType, CreateAccountInput } from '../types'

interface AddAccountDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onAdd: (input: CreateAccountInput) => Promise<void>
}

// Validation helpers
const validateRequired = (value: string) => value.trim().length > 0
const validateNumber = (value: string) => !Number.isNaN(Number.parseFloat(value)) && Number.parseFloat(value) >= 0
const validateCardNumber = (value: string) => value.replace(/\D/g, '').length >= 13
const validateExpiry = (value: string) => {
	const cleaned = value.replace(/\D/g, '')
	if (cleaned.length < 4) return false
	const month = Number.parseInt(cleaned.slice(0, 2), 10)
	return month >= 1 && month <= 12
}
const validateCvv = (value: string) => value.length >= 3

interface FieldError {
	field: string
	message: string
}

export function AddAccountDialog({ open, onOpenChange, onAdd }: AddAccountDialogProps) {
	const t = useTranslations('accounts')
	const tCommon = useTranslations('common')

	const [step, setStep] = useState<1 | 2>(1)
	const [accountType, setAccountType] = useState<AccountType>('bank')
	const [isLoading, setIsLoading] = useState(false)
	const [errors, setErrors] = useState<FieldError[]>([])
	const [touched, setTouched] = useState<Set<string>>(new Set())

	// Form state
	const [name, setName] = useState('')
	const [balance, setBalance] = useState('')
	const [currency, setCurrency] = useState('USD')

	// Bank specific
	const [bankName, setBankName] = useState('')
	const [accountNumber, setAccountNumber] = useState('')
	const [subtype, setSubtype] = useState<'checking' | 'savings'>('checking')

	// Credit card specific
	const [cardNumber, setCardNumber] = useState('')
	const [cardHolder, setCardHolder] = useState('')
	const [expiryDate, setExpiryDate] = useState('')
	const [cvv, setCvv] = useState('')
	const [creditLimit, setCreditLimit] = useState('')
	const [apr, setApr] = useState('')

	// Cash specific
	const [location, setLocation] = useState('')

	// Wallet specific
	const [walletType, setWalletType] = useState<'digital' | 'physical'>('digital')
	const [provider, setProvider] = useState('')

	const resetForm = () => {
		setStep(1)
		setAccountType('bank')
		setName('')
		setBalance('')
		setCurrency('USD')
		setBankName('')
		setAccountNumber('')
		setSubtype('checking')
		setCardNumber('')
		setCardHolder('')
		setExpiryDate('')
		setCvv('')
		setCreditLimit('')
		setApr('')
		setLocation('')
		setWalletType('digital')
		setProvider('')
		setErrors([])
		setTouched(new Set())
	}

	const handleClose = () => {
		resetForm()
		onOpenChange(false)
	}

	const getSelectedCurrency = () => {
		const curr = currencies[currency as keyof typeof currencies]
		return curr ?? currencies.USD
	}

	const markTouched = (field: string) => {
		setTouched((prev) => new Set(prev).add(field))
	}

	const getFieldError = (field: string) => {
		if (!touched.has(field)) return null
		return errors.find((e) => e.field === field)?.message ?? null
	}

	const validateForm = (): boolean => {
		const newErrors: FieldError[] = []

		if (accountType === 'bank') {
			if (!validateRequired(name)) newErrors.push({ field: 'name', message: t('validation.nameRequired') })
			if (!validateRequired(bankName)) newErrors.push({ field: 'bankName', message: t('validation.bankNameRequired') })
		} else if (accountType === 'credit_card') {
			if (!validateCardNumber(cardNumber))
				newErrors.push({ field: 'cardNumber', message: t('validation.cardNumberRequired') })
			if (!validateRequired(cardHolder)) newErrors.push({ field: 'cardHolder', message: 'Card holder is required' })
			if (!validateExpiry(expiryDate)) newErrors.push({ field: 'expiryDate', message: 'Valid expiry date is required' })
			if (!validateCvv(cvv)) newErrors.push({ field: 'cvv', message: 'Valid CVV is required' })
			if (!validateNumber(creditLimit))
				newErrors.push({ field: 'creditLimit', message: t('validation.creditLimitRequired') })
		} else if (accountType === 'cash') {
			if (!validateRequired(name)) newErrors.push({ field: 'name', message: t('validation.nameRequired') })
		} else if (accountType === 'wallet') {
			if (!validateRequired(name)) newErrors.push({ field: 'name', message: t('validation.nameRequired') })
		}

		setErrors(newErrors)
		// Mark all fields as touched to show errors
		const allFields = ['name', 'bankName', 'cardNumber', 'cardHolder', 'expiryDate', 'cvv', 'creditLimit']
		setTouched(new Set(allFields))
		return newErrors.length === 0
	}

	const handleSubmit = async () => {
		if (!validateForm()) return

		setIsLoading(true)
		try {
			const selectedCurrency = getSelectedCurrency()
			let input: CreateAccountInput

			switch (accountType) {
				case 'bank':
					input = {
						type: 'bank',
						name,
						bankName,
						accountNumber: `****${accountNumber}`,
						subtype,
						balance: Number.parseFloat(balance) || 0,
						currency: selectedCurrency,
					}
					break
				case 'credit_card': {
					const detectedBrand = detectCardBrand(cardNumber)
					const lastFour = cardNumber.slice(-4)
					input = {
						type: 'credit_card',
						name: cardHolder || name || 'Credit Card',
						bankName: bankName || 'Unknown Bank',
						cardNumber: `****${lastFour}`,
						cardBrand: detectedBrand === 'unknown' ? 'visa' : detectedBrand,
						creditLimit: Number.parseFloat(creditLimit) || 0,
						balance: -(Number.parseFloat(balance) || 0),
						apr: Number.parseFloat(apr) || 0,
						dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
						currency: selectedCurrency,
					}
					break
				}
				case 'cash':
					input = {
						type: 'cash',
						name,
						balance: Number.parseFloat(balance) || 0,
						currency: selectedCurrency,
						location: location || undefined,
					}
					break
				case 'wallet':
					input = {
						type: 'wallet',
						name,
						walletType,
						provider: provider || undefined,
						balance: Number.parseFloat(balance) || 0,
						currency: selectedCurrency,
					}
					break
			}

			await onAdd(input)
			handleClose()
		} finally {
			setIsLoading(false)
		}
	}

	const accountTypeOptions = [
		{
			type: 'bank' as const,
			icon: Building2,
			label: t('types.bank'),
			description: 'Checking & savings accounts',
			color: 'from-blue-500 to-blue-700',
		},
		{
			type: 'credit_card' as const,
			icon: CreditCard,
			label: t('types.credit_card'),
			description: 'Credit cards & lines of credit',
			color: 'from-slate-700 to-slate-900',
		},
		{
			type: 'cash' as const,
			icon: Banknote,
			label: t('types.cash'),
			description: 'Physical cash reserves',
			color: 'from-green-500 to-green-700',
		},
		{
			type: 'wallet' as const,
			icon: Wallet,
			label: t('types.wallet'),
			description: 'Digital wallets & payment apps',
			color: 'from-indigo-500 to-indigo-700',
		},
	]

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.05 },
		},
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	}

	const slideVariants = {
		enter: (direction: number) => ({
			x: direction > 0 ? 300 : -300,
			opacity: 0,
		}),
		center: {
			x: 0,
			opacity: 1,
		},
		exit: (direction: number) => ({
			x: direction < 0 ? 300 : -300,
			opacity: 0,
		}),
	}

	const renderPreviewCard = () => {
		switch (accountType) {
			case 'bank':
				return (
					<BankCardPreview
						bankName={bankName}
						accountHolder={name}
						accountNumber={accountNumber}
						accountType={subtype}
					/>
				)
			case 'credit_card':
				return (
					<CreditCardDisplay
						style='base'
						cardNumber={cardNumber}
						cardHolder={cardHolder}
						expiryDate={expiryDate}
						cvv={cvv}
					/>
				)
			case 'cash':
				return <CashWalletPreview type='cash' name={name} location={location} />
			case 'wallet':
				return <CashWalletPreview type='wallet' name={name} provider={provider} walletType={walletType} />
		}
	}

	const renderFormFields = () => {
		const inputClasses = (field: string) =>
			cn(
				getFieldError(field) && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50',
			)

		const ErrorMessage = ({ field }: { field: string }) => {
			const error = getFieldError(field)
			if (!error) return null
			return (
				<motion.p
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className='mt-1 text-xs text-destructive'>
					{error}
				</motion.p>
			)
		}

		switch (accountType) {
			case 'bank':
				return (
					<motion.div variants={containerVariants} initial='hidden' animate='visible' className='space-y-4'>
						<motion.div variants={itemVariants}>
							<Label htmlFor='name'>{t('form.name')}</Label>
							<Input
								id='name'
								placeholder={t('form.namePlaceholder')}
								value={name}
								onChange={(e) => setName(e.target.value)}
								onBlur={() => markTouched('name')}
								className={inputClasses('name')}
							/>
							<ErrorMessage field='name' />
						</motion.div>

						<motion.div variants={itemVariants}>
							<Label htmlFor='bankName'>{t('form.bankName')}</Label>
							<Input
								id='bankName'
								placeholder={t('form.bankNamePlaceholder')}
								value={bankName}
								onChange={(e) => setBankName(e.target.value)}
								onBlur={() => markTouched('bankName')}
								className={inputClasses('bankName')}
							/>
							<ErrorMessage field='bankName' />
						</motion.div>

						<motion.div variants={itemVariants} className='grid grid-cols-2 gap-3'>
							<div>
								<Label htmlFor='accountNumber'>{t('form.accountNumber')}</Label>
								<Input
									id='accountNumber'
									placeholder={t('form.accountNumberPlaceholder')}
									maxLength={4}
									value={accountNumber}
									onChange={(e) => setAccountNumber(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor='subtype'>{t('form.subtype')}</Label>
								<Select value={subtype} onValueChange={(v) => v && setSubtype(v as 'checking' | 'savings')}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='checking'>{t('subtypes.checking')}</SelectItem>
										<SelectItem value='savings'>{t('subtypes.savings')}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</motion.div>

						<motion.div variants={itemVariants} className='grid grid-cols-2 gap-3'>
							<div>
								<Label htmlFor='balance'>{t('form.balance')}</Label>
								<Input
									id='balance'
									type='number'
									placeholder={t('form.balancePlaceholder')}
									value={balance}
									onChange={(e) => setBalance(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor='currency'>{t('form.currency')}</Label>
								<Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.values(currencies).map((curr) => (
											<SelectItem key={curr.code} value={curr.code}>
												{curr.symbol} {curr.code}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</motion.div>
					</motion.div>
				)

			case 'credit_card':
				return (
					<motion.div variants={containerVariants} initial='hidden' animate='visible' className='space-y-4'>
						<motion.div variants={itemVariants}>
							<CreditCardNumberInput
								label={t('form.cardNumber')}
								value={cardNumber}
								onChange={(v) => {
									setCardNumber(v)
									markTouched('cardNumber')
								}}
							/>
							<ErrorMessage field='cardNumber' />
						</motion.div>

						<motion.div variants={itemVariants}>
							<CreditCardHolderInput
								label={t('form.cardHolder')}
								value={cardHolder}
								onChange={(v) => {
									setCardHolder(v)
									markTouched('cardHolder')
								}}
							/>
							<ErrorMessage field='cardHolder' />
						</motion.div>

						<motion.div variants={itemVariants} className='grid grid-cols-2 gap-3'>
							<div>
								<CreditCardExpiryInput
									label={t('form.expiryDate')}
									value={expiryDate}
									onChange={(v) => {
										setExpiryDate(v)
										markTouched('expiryDate')
									}}
								/>
								<ErrorMessage field='expiryDate' />
							</div>
							<div>
								<CreditCardCvvInput
									label={t('form.cvv')}
									value={cvv}
									onChange={(v) => {
										setCvv(v)
										markTouched('cvv')
									}}
								/>
								<ErrorMessage field='cvv' />
							</div>
						</motion.div>

						<motion.div variants={itemVariants}>
							<Label htmlFor='bankName'>{t('form.bankName')}</Label>
							<Input
								id='bankName'
								placeholder={t('form.bankNamePlaceholder')}
								value={bankName}
								onChange={(e) => setBankName(e.target.value)}
							/>
						</motion.div>

						<motion.div variants={itemVariants} className='grid grid-cols-2 gap-3'>
							<div>
								<Label htmlFor='creditLimit'>{t('form.creditLimit')}</Label>
								<Input
									id='creditLimit'
									type='number'
									placeholder={t('form.creditLimitPlaceholder')}
									value={creditLimit}
									onChange={(e) => setCreditLimit(e.target.value)}
									onBlur={() => markTouched('creditLimit')}
									className={inputClasses('creditLimit')}
								/>
								<ErrorMessage field='creditLimit' />
							</div>
							<div>
								<Label htmlFor='apr'>{t('form.apr')}</Label>
								<Input
									id='apr'
									type='number'
									step='0.01'
									placeholder={t('form.aprPlaceholder')}
									value={apr}
									onChange={(e) => setApr(e.target.value)}
								/>
							</div>
						</motion.div>

						<motion.div variants={itemVariants} className='grid grid-cols-2 gap-3'>
							<div>
								<Label htmlFor='balance'>{t('form.currentBalance')}</Label>
								<Input
									id='balance'
									type='number'
									placeholder={t('form.balancePlaceholder')}
									value={balance}
									onChange={(e) => setBalance(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor='currency'>{t('form.currency')}</Label>
								<Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.values(currencies).map((curr) => (
											<SelectItem key={curr.code} value={curr.code}>
												{curr.symbol} {curr.code}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</motion.div>
					</motion.div>
				)

			case 'cash':
				return (
					<motion.div variants={containerVariants} initial='hidden' animate='visible' className='space-y-4'>
						<motion.div variants={itemVariants}>
							<Label htmlFor='name'>{t('form.name')}</Label>
							<Input
								id='name'
								placeholder={t('form.namePlaceholder')}
								value={name}
								onChange={(e) => setName(e.target.value)}
								onBlur={() => markTouched('name')}
								className={inputClasses('name')}
							/>
							<ErrorMessage field='name' />
						</motion.div>

						<motion.div variants={itemVariants}>
							<Label htmlFor='location'>{t('form.location')}</Label>
							<Input
								id='location'
								placeholder={t('form.locationPlaceholder')}
								value={location}
								onChange={(e) => setLocation(e.target.value)}
							/>
						</motion.div>

						<motion.div variants={itemVariants} className='grid grid-cols-2 gap-3'>
							<div>
								<Label htmlFor='balance'>{t('form.balance')}</Label>
								<Input
									id='balance'
									type='number'
									placeholder={t('form.balancePlaceholder')}
									value={balance}
									onChange={(e) => setBalance(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor='currency'>{t('form.currency')}</Label>
								<Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.values(currencies).map((curr) => (
											<SelectItem key={curr.code} value={curr.code}>
												{curr.symbol} {curr.code}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</motion.div>
					</motion.div>
				)

			case 'wallet':
				return (
					<motion.div variants={containerVariants} initial='hidden' animate='visible' className='space-y-4'>
						<motion.div variants={itemVariants}>
							<Label htmlFor='name'>{t('form.name')}</Label>
							<Input
								id='name'
								placeholder={t('form.namePlaceholder')}
								value={name}
								onChange={(e) => setName(e.target.value)}
								onBlur={() => markTouched('name')}
								className={inputClasses('name')}
							/>
							<ErrorMessage field='name' />
						</motion.div>

						<motion.div variants={itemVariants} className='grid grid-cols-2 gap-3'>
							<div>
								<Label htmlFor='walletType'>{t('form.walletType')}</Label>
								<Select value={walletType} onValueChange={(v) => v && setWalletType(v as 'digital' | 'physical')}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='digital'>{t('walletTypes.digital')}</SelectItem>
										<SelectItem value='physical'>{t('walletTypes.physical')}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor='provider'>{t('form.provider')}</Label>
								<Input
									id='provider'
									placeholder={t('form.providerPlaceholder')}
									value={provider}
									onChange={(e) => setProvider(e.target.value)}
								/>
							</div>
						</motion.div>

						<motion.div variants={itemVariants} className='grid grid-cols-2 gap-3'>
							<div>
								<Label htmlFor='balance'>{t('form.balance')}</Label>
								<Input
									id='balance'
									type='number'
									placeholder={t('form.balancePlaceholder')}
									value={balance}
									onChange={(e) => setBalance(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor='currency'>{t('form.currency')}</Label>
								<Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.values(currencies).map((curr) => (
											<SelectItem key={curr.code} value={curr.code}>
												{curr.symbol} {curr.code}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</motion.div>
					</motion.div>
				)
		}
	}

	// Dialog content - extracted as JSX to avoid re-creating component on each render
	const dialogContent = (
		<div className='flex h-full flex-col lg:flex-row'>
			{/* Preview Section - Only shown on step 2 */}
			{step === 2 && (
				<>
					{/* Mobile: Preview at top */}
					<div className='flex items-center justify-center bg-muted/50 p-6 lg:hidden'>
						<AnimatePresence mode='wait'>
							<motion.div
								key={accountType}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								transition={{ duration: 0.2 }}
								className='scale-[0.7]'>
								{renderPreviewCard()}
							</motion.div>
						</AnimatePresence>
					</div>

					{/* Desktop: Preview on left */}
					<div className='hidden w-[380px] shrink-0 items-center justify-center bg-muted/50 p-8 lg:flex'>
						<AnimatePresence mode='wait'>
							<motion.div
								key={accountType}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								transition={{ duration: 0.2 }}
								className='scale-[0.85]'>
								{renderPreviewCard()}
							</motion.div>
						</AnimatePresence>
					</div>
				</>
			)}

			{/* Form Section */}
			<div className='flex min-w-0 flex-1 flex-col p-6'>
				<DialogHeader className='mb-4 shrink-0'>
					<DialogTitle>{t('dialog.addTitle')}</DialogTitle>
					<DialogDescription>{t('dialog.addDescription')}</DialogDescription>
				</DialogHeader>

				<div className='min-h-0 flex-1 overflow-x-hidden overflow-y-auto'>
					<AnimatePresence mode='wait' custom={step === 1 ? -1 : 1}>
						{step === 1 ? (
							<motion.div
								key='step1'
								custom={-1}
								variants={slideVariants}
								initial='enter'
								animate='center'
								exit='exit'
								transition={{ duration: 0.2 }}>
								<p className='mb-4 text-sm font-medium text-muted-foreground'>{t('dialog.step1')}</p>
								<motion.div
									variants={containerVariants}
									initial='hidden'
									animate='visible'
									className='grid grid-cols-2 gap-3'>
									{accountTypeOptions.map((option) => (
										<motion.button
											key={option.type}
											variants={itemVariants}
											type='button'
											onClick={() => setAccountType(option.type)}
											className={cn(
												'group relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all',
												accountType === option.type
													? 'border-primary bg-primary/5 shadow-sm'
													: 'border-muted hover:border-muted-foreground/30 hover:bg-muted/50',
											)}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}>
											<div
												className={cn(
													'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white transition-transform group-hover:scale-110',
													option.color,
												)}>
												<option.icon className='h-5 w-5' />
											</div>
											<div>
												<p className='font-medium'>{option.label}</p>
												<p className='text-xs text-muted-foreground'>{option.description}</p>
											</div>
											{accountType === option.type && (
												<motion.div
													initial={{ scale: 0 }}
													animate={{ scale: 1 }}
													className='absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground'>
													<Check className='h-3 w-3' />
												</motion.div>
											)}
										</motion.button>
									))}
								</motion.div>
							</motion.div>
						) : (
							<motion.div
								key='step2'
								custom={1}
								variants={slideVariants}
								initial='enter'
								animate='center'
								exit='exit'
								transition={{ duration: 0.2 }}>
								<p className='mb-4 text-sm font-medium text-muted-foreground'>{t('dialog.step2')}</p>
								{renderFormFields()}
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Footer */}
				<div className='mt-4 flex shrink-0 items-center justify-between border-t pt-4'>
					{step === 2 ? (
						<Button variant='ghost' onClick={() => setStep(1)} className='gap-2'>
							<ArrowLeft className='h-4 w-4' />
							Back
						</Button>
					) : (
						<div />
					)}
					<div className='flex gap-2'>
						<Button variant='outline' onClick={handleClose}>
							{tCommon('cancel')}
						</Button>
						{step === 1 ? (
							<Button onClick={() => setStep(2)}>Continue</Button>
						) : (
							<Button onClick={handleSubmit} disabled={isLoading}>
								{isLoading ? tCommon('loading') : tCommon('save')}
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	)

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent
				className={cn(
					'max-h-[90vh] w-full overflow-hidden p-0',
					step === 1 ? 'max-w-[480px]' : 'max-w-[480px] lg:max-w-[900px]',
				)}>
				{accountType === 'credit_card' && step === 2 ? (
					<CreditCardFlipProvider>{dialogContent}</CreditCardFlipProvider>
				) : (
					dialogContent
				)}
			</DialogContent>
		</Dialog>
	)
}
