'use client'

import { motion } from 'framer-motion'
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { Label } from './label'

// Card brand detection based on card number prefix
type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'

function detectCardBrand(cardNumber: string): CardBrand {
	const cleaned = cardNumber.replace(/\s/g, '')
	if (/^4/.test(cleaned)) return 'visa'
	if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard'
	if (/^3[47]/.test(cleaned)) return 'amex'
	if (/^6(?:011|5)/.test(cleaned)) return 'discover'
	return 'unknown'
}

// Card brand logos
const CardLogo = ({ brand }: { brand: CardBrand }) => {
	switch (brand) {
		case 'visa':
			return (
				<svg viewBox='0 0 48 48' className='h-10 w-14' role='img' aria-label='Visa'>
					<path
						fill='#1565C0'
						d='M45,35c0,2.2-1.8,4-4,4H7c-2.2,0-4-1.8-4-4V13c0-2.2,1.8-4,4-4h34c2.2,0,4,1.8,4,4V35z'
					/>
					<path
						fill='#FFF'
						d='M15.186 19l-2.626 7.832c0 0-.667-3.313-.733-3.729-1.495-3.411-3.701-3.221-3.701-3.221L10.846 30v-.002h3.023L18.281 19H15.186zM17.689 30L20.56 30 22.296 19 19.389 19zM38.008 19h-3.021l-4.71 11h2.852l.588-1.571h3.596L37.619 30h2.613L38.008 19zM34.513 26.328l1.563-4.157.818 4.157H34.513zM26.369 22.206c0-.606.498-1.057 1.926-1.057.928 0 1.991.674 1.991.674l.466-2.309c0 0-1.358-.515-2.691-.515-3.019 0-4.576 1.444-4.576 3.272 0 3.306 3.979 2.853 3.979 4.551 0 .291-.231.964-1.888.964-1.662 0-2.759-.609-2.759-.609l-.495 2.216c0 0 1.063.606 3.117.606 2.059 0 4.915-1.54 4.915-3.752C30.354 23.586 26.369 23.394 26.369 22.206z'
					/>
					<path
						fill='#FFC107'
						d='M12.212,24.945l-0.966-4.748c0,0-0.437-1.029-1.573-1.029c-1.136,0-4.44,0-4.44,0S10.894,20.84,12.212,24.945z'
					/>
				</svg>
			)
		case 'mastercard':
			return (
				<svg viewBox='0 0 48 48' className='h-10 w-14' role='img' aria-label='Mastercard'>
					<path
						fill='#3F51B5'
						d='M45,35c0,2.2-1.8,4-4,4H7c-2.2,0-4-1.8-4-4V13c0-2.2,1.8-4,4-4h34c2.2,0,4,1.8,4,4V35z'
					/>
					<path fill='#FFC107' d='M30 14A10 10 0 1 0 30 34A10 10 0 1 0 30 14Z' />
					<path
						fill='#FF3D00'
						d='M22.014,30c-0.464-0.617-0.863-1.284-1.176-2h6.325c0.278-0.636,0.496-1.304,0.637-2h-7.598c-0.131-0.657-0.2-1.32-0.2-2c0-0.68,0.069-1.343,0.2-2h7.598c-0.14-0.696-0.359-1.364-0.637-2h-6.325c0.313-0.716,0.711-1.383,1.176-2h3.972c-0.504-0.673-1.096-1.275-1.762-1.789L24,14.211V14c-1.291,0-2.531,0.248-3.665,0.695c-1.078,0.433-2.058,1.053-2.901,1.826C16.156,17.747,15.175,19.307,14.634,21h0.001C14.224,22.28,14,23.622,14,25c0,1.379,0.224,2.72,0.635,4c0.401,1.2,0.979,2.329,1.712,3.352l0,0c0.089,0.123,0.185,0.239,0.279,0.358C18.612,35.023,21.161,36,24,36l0.221-0.211c0.666-0.514,1.258-1.116,1.762-1.789H22.014z'
					/>
					<path fill='#E53935' d='M18 14A10 10 0 1 0 18 34A10 10 0 1 0 18 14Z' />
				</svg>
			)
		case 'amex':
			return (
				<svg viewBox='0 0 48 48' className='h-10 w-14' role='img' aria-label='American Express'>
					<path
						fill='#1976D2'
						d='M45,35c0,2.2-1.8,4-4,4H7c-2.2,0-4-1.8-4-4V13c0-2.2,1.8-4,4-4h34c2.2,0,4,1.8,4,4V35z'
					/>
					<path
						fill='#FFF'
						d='M22.255 20l-2.113 4.683L18.039 20h-2.695v6.726L12.341 20h-2.274L7 28h1.815l.671-1.558h3.432L13.59 28h3.393v-5.078l2.267 5.078h1.596l2.278-5.11V28h1.86v-8H22.255zM10.135 25.034l1.033-2.397 1.037 2.397H10.135zM32.921 20l-1.529 2.283L29.865 20h-2.181l2.659 3.843L27.627 28h2.132l1.6-2.4 1.605 2.4h2.227l-2.731-4.052L35.135 20H32.921zM40.857 20h-4.635v8h4.663c1.216 0 2.115-1.009 2.115-2.188v-3.624C43 20.97 42.101 20 40.857 20zM41.1 25.63c0 0.519-0.388 0.94-0.865 0.94h-2.007v-5.139h2.007c0.477 0 0.865 0.409 0.865 0.912V25.63z'
					/>
				</svg>
			)
		case 'discover':
			return (
				<svg viewBox='0 0 48 48' className='h-10 w-14' role='img' aria-label='Discover'>
					<path
						fill='#E1E2E1'
						d='M45,35c0,2.2-1.8,4-4,4H7c-2.2,0-4-1.8-4-4V13c0-2.2,1.8-4,4-4h34c2.2,0,4,1.8,4,4V35z'
					/>
					<path fill='#FF6D00' d='M28 24A4 4 0 1 0 28 32A4 4 0 1 0 28 24Z' />
					<path
						fill='#424242'
						d='M14.5,20c-1.93,0-3.5,1.794-3.5,4s1.57,4,3.5,4h0.5v-2h-0.5c-0.828,0-1.5-0.895-1.5-2s0.672-2,1.5-2H15v-2H14.5zM17,20v8h2v-8H17zM28,22c-1.105,0-2,0.895-2,2v4c0,1.105,0.895,2,2,2h2v-1.5h-2c-0.276,0-0.5-0.224-0.5-0.5v-4c0-0.276,0.224-0.5,0.5-0.5h2V22H28zM31,20v8h2v-8H31zM35,20v8h2v-3h1c1.657,0,3-1.343,3-3v-0.5c0-0.828-0.672-1.5-1.5-1.5H35zM37,22h1c0.552,0,1,0.448,1,1s-0.448,1-1,1h-1V22z'
					/>
					<path
						fill='#FF6D00'
						d='M20,20v8h2v-3h1c1.657,0,3-1.343,3-3s-1.343-2-3-2H20zM22,22h1c0.552,0,1,0.448,1,1s-0.448,1-1,1h-1V22z'
					/>
				</svg>
			)
		default:
			return (
				<div className='flex h-10 w-14 items-center justify-center rounded bg-white/20 text-xs font-bold text-white'>
					CARD
				</div>
			)
	}
}

// Format card number with spaces
function formatCardNumber(value: string): string {
	const cleaned = value.replace(/\D/g, '')
	const groups = cleaned.match(/.{1,4}/g)
	return groups ? groups.join(' ') : cleaned
}

// Format expiry date
function formatExpiryDate(value: string): string {
	const cleaned = value.replace(/\D/g, '')
	if (cleaned.length >= 2) {
		return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
	}
	return cleaned
}

// Card styles
const cardStyles = {
	base: 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800',
	'shiny-silver': 'bg-gradient-to-br from-gray-300 via-gray-100 to-gray-400',
	'amex-green': 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700',
	'amex-black': 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-black',
	metal: 'bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700',
}

type CardStyle = keyof typeof cardStyles

// Context only for flip state (minimal state in context)
interface CreditCardFlipContextValue {
	isFlipped: boolean
	setIsFlipped: (value: boolean) => void
}

const CreditCardFlipContext = createContext<CreditCardFlipContextValue | null>(null)

function useCreditCardFlipContext() {
	const context = useContext(CreditCardFlipContext)
	if (!context) {
		throw new Error('CreditCard components must be used within a CreditCardFlipProvider')
	}
	return context
}

interface CreditCardFlipProviderProps {
	children: ReactNode
}

function CreditCardFlipProvider({ children }: CreditCardFlipProviderProps) {
	const [isFlipped, setIsFlipped] = useState(false)

	const value = useMemo(() => ({ isFlipped, setIsFlipped }), [isFlipped])

	return <CreditCardFlipContext.Provider value={value}>{children}</CreditCardFlipContext.Provider>
}

interface CreditCardDisplayProps {
	style?: CardStyle
	className?: string
	cardNumber?: string
	cardHolder?: string
	expiryDate?: string
	cvv?: string
}

function CreditCardDisplay({
	style = 'base',
	className,
	cardNumber = '',
	cardHolder = '',
	expiryDate = '',
	cvv = '',
}: CreditCardDisplayProps) {
	const { isFlipped } = useCreditCardFlipContext()

	const displayNumber = cardNumber ? formatCardNumber(cardNumber) : '•••• •••• •••• ••••'
	const displayHolder = cardHolder || 'YOUR NAME'
	const displayExpiry = expiryDate ? formatExpiryDate(expiryDate) : 'MM/YY'
	const cardBrand = detectCardBrand(cardNumber)

	const textColorClass = style === 'shiny-silver' ? 'text-gray-800' : 'text-white'

	return (
		<div className={cn('perspective-1000 h-48 w-80', className)}>
			<motion.div
				className='relative h-full w-full'
				style={{ transformStyle: 'preserve-3d' }}
				animate={{ rotateY: isFlipped ? 180 : 0 }}
				transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}>
				{/* Front of card */}
				<div className={cn('absolute inset-0 rounded-xl p-6 shadow-2xl', cardStyles[style], 'backface-hidden')}>
					{/* Chip */}
					<div className='mb-4 flex items-center justify-between'>
						<div className='h-10 w-12 rounded bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 p-1'>
							<div className='grid h-full w-full grid-cols-3 gap-0.5'>
								<div className='rounded-sm bg-yellow-500/50' />
								<div className='rounded-sm bg-yellow-500/50' />
								<div className='rounded-sm bg-yellow-500/50' />
								<div className='rounded-sm bg-yellow-500/50' />
								<div className='rounded-sm bg-yellow-500/50' />
								<div className='rounded-sm bg-yellow-500/50' />
							</div>
						</div>
						<CardLogo brand={cardBrand} />
					</div>

					{/* Card Number */}
					<div className={cn('mb-4 font-mono text-xl tracking-wider', textColorClass)}>{displayNumber}</div>

					{/* Card Holder and Expiry */}
					<div className='flex justify-between'>
						<div>
							<p className={cn('text-xs uppercase opacity-70', textColorClass)}>Card Holder</p>
							<p className={cn('font-medium uppercase tracking-wide', textColorClass)}>{displayHolder}</p>
						</div>
						<div className='text-right'>
							<p className={cn('text-xs uppercase opacity-70', textColorClass)}>Expires</p>
							<p className={cn('font-medium tracking-wide', textColorClass)}>{displayExpiry}</p>
						</div>
					</div>
				</div>

				{/* Back of card */}
				<div
					className={cn('absolute inset-0 rounded-xl shadow-2xl', cardStyles[style], 'backface-hidden')}
					style={{ transform: 'rotateY(180deg)' }}>
					{/* Magnetic stripe */}
					<div className='mt-6 h-12 w-full bg-black/80' />

					{/* Signature strip and CVV */}
					<div className='mt-6 flex items-center gap-4 px-6'>
						<div className='flex-1 rounded bg-white/90 p-2'>
							<div className='h-6 w-full bg-gradient-to-r from-gray-200 via-white to-gray-200' />
						</div>
						<div className='rounded bg-white px-3 py-2'>
							<p className='font-mono text-sm font-bold text-gray-800'>{cvv || '•••'}</p>
						</div>
					</div>

					{/* Card network info */}
					<div className='mt-4 px-6'>
						<p className={cn('text-xs opacity-60', textColorClass)}>
							This card is property of the issuing bank. Unauthorized use is prohibited.
						</p>
					</div>

					{/* Logo on back */}
					<div className='absolute bottom-4 right-4'>
						<CardLogo brand={cardBrand} />
					</div>
				</div>
			</motion.div>
		</div>
	)
}

interface CreditCardInputProps {
	label?: string
	className?: string
	value: string
	onChange: (value: string) => void
}

function CreditCardNumberInput({ label = 'Card Number', className, value, onChange }: CreditCardInputProps) {
	const { setIsFlipped } = useCreditCardFlipContext()

	return (
		<div className={cn('space-y-2', className)}>
			<Label htmlFor='card-number'>{label}</Label>
			<Input
				id='card-number'
				placeholder='1234 5678 9012 3456'
				value={formatCardNumber(value)}
				onFocus={() => setIsFlipped(false)}
				onChange={(e) => {
					const newValue = e.target.value.replace(/\D/g, '').slice(0, 16)
					onChange(newValue)
				}}
				maxLength={19}
			/>
		</div>
	)
}

function CreditCardHolderInput({ label = 'Card Holder', className, value, onChange }: CreditCardInputProps) {
	const { setIsFlipped } = useCreditCardFlipContext()

	return (
		<div className={cn('space-y-2', className)}>
			<Label htmlFor='card-holder'>{label}</Label>
			<Input
				id='card-holder'
				placeholder='John Doe'
				value={value}
				onFocus={() => setIsFlipped(false)}
				onChange={(e) => {
					onChange(e.target.value.toUpperCase())
				}}
				maxLength={24}
			/>
		</div>
	)
}

function CreditCardExpiryInput({ label = 'Expiry Date', className, value, onChange }: CreditCardInputProps) {
	const { setIsFlipped } = useCreditCardFlipContext()

	return (
		<div className={cn('space-y-2', className)}>
			<Label htmlFor='card-expiry'>{label}</Label>
			<Input
				id='card-expiry'
				placeholder='MM/YY'
				value={formatExpiryDate(value)}
				onFocus={() => setIsFlipped(false)}
				onChange={(e) => {
					const newValue = e.target.value.replace(/\D/g, '').slice(0, 4)
					onChange(newValue)
				}}
				maxLength={5}
			/>
		</div>
	)
}

function CreditCardCvvInput({ label = 'CVV', className, value, onChange }: CreditCardInputProps) {
	const { setIsFlipped } = useCreditCardFlipContext()

	return (
		<div className={cn('space-y-2', className)}>
			<Label htmlFor='card-cvv'>{label}</Label>
			<Input
				id='card-cvv'
				type='password'
				placeholder='•••'
				value={value}
				onFocus={() => setIsFlipped(true)}
				onBlur={() => setIsFlipped(false)}
				onChange={(e) => {
					const newValue = e.target.value.replace(/\D/g, '').slice(0, 4)
					onChange(newValue)
				}}
				maxLength={4}
			/>
		</div>
	)
}

export {
	CreditCardFlipProvider,
	CreditCardDisplay,
	CreditCardNumberInput,
	CreditCardHolderInput,
	CreditCardExpiryInput,
	CreditCardCvvInput,
	detectCardBrand,
	formatCardNumber,
	formatExpiryDate,
	type CardBrand,
	type CardStyle,
}
