'use client'

import { Loader2, Store } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createStore } from '@/lib/firebase'

interface CreateStoreDialogProps {
	open: boolean
	userId: string
	onStoreCreated?: () => void
}

export function CreateStoreDialog({ open, userId, onStoreCreated }: CreateStoreDialogProps) {
	const t = useTranslations('stores.createDialog')
	const [storeName, setStoreName] = useState('')
	const [isCreating, setIsCreating] = useState(false)

	const handleCreate = async () => {
		if (!storeName.trim()) return

		setIsCreating(true)

		try {
			await createStore({
				name: storeName.trim(),
				ownerId: userId,
				description: 'My store',
			})

			toast.success(t('success'))
			setStoreName('')
			onStoreCreated?.()
		} catch (error) {
			toast.error(t('error'))
		} finally {
			setIsCreating(false)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && storeName.trim() && !isCreating) {
			handleCreate()
		}
	}

	return (
		<Dialog open={open}>
			<DialogContent showCloseButton={false} className='sm:max-w-md'>
				<DialogHeader>
					<div className='bg-primary/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full'>
						<Store className='text-primary h-6 w-6' />
					</div>
					<DialogTitle className='text-center text-xl'>{t('title')}</DialogTitle>
					<DialogDescription className='text-center'>{t('description')}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-2'>
					<div className='space-y-2'>
						<Label htmlFor='storeName'>{t('nameLabel')}</Label>
						<Input
							id='storeName'
							placeholder={t('namePlaceholder')}
							value={storeName}
							onChange={(e) => setStoreName(e.target.value)}
							onKeyDown={handleKeyDown}
							autoFocus
						/>
					</div>
				</div>

				<DialogFooter className='sm:justify-center'>
					<Button onClick={handleCreate} disabled={!storeName.trim() || isCreating} className='w-full sm:w-auto'>
						{isCreating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
						{t('createButton')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
