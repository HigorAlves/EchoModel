'use client'

import { useCallback, useEffect, useState } from 'react'

export interface UseLightboxOptions {
	totalImages: number
}

export interface UseLightboxReturn {
	isOpen: boolean
	currentIndex: number
	open: (index: number) => void
	close: () => void
	next: () => void
	previous: () => void
}

export function useLightbox({ totalImages }: UseLightboxOptions): UseLightboxReturn {
	const [isOpen, setIsOpen] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)

	const open = useCallback((index: number) => {
		setCurrentIndex(index)
		setIsOpen(true)
	}, [])

	const close = useCallback(() => {
		setIsOpen(false)
	}, [])

	const next = useCallback(() => {
		setCurrentIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0))
	}, [totalImages])

	const previous = useCallback(() => {
		setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1))
	}, [totalImages])

	// Keyboard navigation
	useEffect(() => {
		if (!isOpen || totalImages === 0) return

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowLeft':
					previous()
					break
				case 'ArrowRight':
					next()
					break
				case 'Escape':
					close()
					break
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, totalImages, next, previous, close])

	return {
		isOpen,
		currentIndex,
		open,
		close,
		next,
		previous,
	}
}
