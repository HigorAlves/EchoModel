/**
 * @fileoverview Rate Limiter Service
 *
 * Implements distributed rate limiting for the Seedream 4.5 API
 * using Firestore as the backing store for distributed state.
 *
 * Rate limit: 500 images per minute (per BytePlus docs)
 *
 * Uses a sliding window algorithm with Firestore transactions
 * to ensure accurate counts across multiple function instances.
 */

import { FieldValue, type Firestore } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
	/** Firestore instance */
	db: Firestore
	/** Maximum images allowed per window */
	maxImages?: number
	/** Window duration in seconds */
	windowSeconds?: number
	/** Collection name for rate limit documents */
	collectionName?: string
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
	/** Whether the request is allowed */
	allowed: boolean
	/** Remaining quota in current window */
	remaining: number
	/** Time until window resets (in seconds) */
	resetInSeconds: number
	/** Current count of images used */
	currentCount: number
}

/**
 * Rate limit document structure in Firestore
 */
interface RateLimitDoc {
	/** Current image count in window */
	count: number
	/** Window start timestamp (ms) */
	windowStart: number
	/** Last updated timestamp */
	updatedAt: FirebaseFirestore.Timestamp | FieldValue
}

// BytePlus Seedream 4.5 rate limit: 500 images/minute
const DEFAULT_MAX_IMAGES = 500
const DEFAULT_WINDOW_SECONDS = 60
const DEFAULT_COLLECTION = '_rateLimits'
const RATE_LIMIT_DOC_ID = 'seedream45-api'

/**
 * Distributed Rate Limiter Service
 *
 * Manages rate limiting for Seedream 4.5 API calls using Firestore
 * for distributed state. Implements sliding window algorithm.
 */
export class RateLimiterService {
	private readonly db: Firestore
	private readonly maxImages: number
	private readonly windowMs: number
	private readonly collectionName: string

	constructor(config: RateLimiterConfig) {
		this.db = config.db
		this.maxImages = config.maxImages ?? DEFAULT_MAX_IMAGES
		this.windowMs = (config.windowSeconds ?? DEFAULT_WINDOW_SECONDS) * 1000
		this.collectionName = config.collectionName ?? DEFAULT_COLLECTION

		logger.info('RateLimiterService initialized', {
			maxImages: this.maxImages,
			windowSeconds: this.windowMs / 1000,
		})
	}

	/**
	 * Get reference to rate limit document
	 */
	private getDocRef() {
		return this.db.collection(this.collectionName).doc(RATE_LIMIT_DOC_ID)
	}

	/**
	 * Try to consume quota for generating images
	 *
	 * Uses Firestore transaction to ensure atomic updates across instances.
	 *
	 * @param imageCount - Number of images to generate
	 * @returns Result indicating if request is allowed and remaining quota
	 */
	async tryConsume(imageCount = 1): Promise<RateLimitResult> {
		const docRef = this.getDocRef()
		const now = Date.now()

		try {
			const result = await this.db.runTransaction(async (transaction) => {
				const doc = await transaction.get(docRef)
				const data = doc.data() as RateLimitDoc | undefined

				let windowStart = now
				let currentCount = 0

				if (data) {
					// Check if we're still in the same window
					if (now - data.windowStart < this.windowMs) {
						windowStart = data.windowStart
						currentCount = data.count
					}
					// Otherwise, start a new window (windowStart = now, count = 0)
				}

				const remaining = this.maxImages - currentCount
				const resetInSeconds = Math.ceil((windowStart + this.windowMs - now) / 1000)

				// Check if we can consume the requested amount
				if (currentCount + imageCount > this.maxImages) {
					return {
						allowed: false,
						remaining: Math.max(0, remaining),
						resetInSeconds: Math.max(0, resetInSeconds),
						currentCount,
					}
				}

				// Update the counter
				const newCount = currentCount + imageCount
				const updateData: Partial<RateLimitDoc> = {
					count: newCount,
					windowStart,
					updatedAt: FieldValue.serverTimestamp(),
				}

				if (doc.exists) {
					transaction.update(docRef, updateData)
				} else {
					transaction.set(docRef, updateData)
				}

				return {
					allowed: true,
					remaining: this.maxImages - newCount,
					resetInSeconds: Math.max(0, resetInSeconds),
					currentCount: newCount,
				}
			})

			logger.debug('Rate limit check', {
				imageCount,
				allowed: result.allowed,
				remaining: result.remaining,
				resetInSeconds: result.resetInSeconds,
			})

			return result
		} catch (error) {
			logger.error('Rate limiter transaction failed', { error })

			// On error, deny the request to be safe
			return {
				allowed: false,
				remaining: 0,
				resetInSeconds: DEFAULT_WINDOW_SECONDS,
				currentCount: this.maxImages,
			}
		}
	}

	/**
	 * Get remaining quota without consuming
	 *
	 * @returns Number of images remaining in current window
	 */
	async getRemaining(): Promise<number> {
		const docRef = this.getDocRef()
		const now = Date.now()

		try {
			const doc = await docRef.get()
			const data = doc.data() as RateLimitDoc | undefined

			if (!data) {
				return this.maxImages
			}

			// Check if window has expired
			if (now - data.windowStart >= this.windowMs) {
				return this.maxImages
			}

			return Math.max(0, this.maxImages - data.count)
		} catch (error) {
			logger.error('Failed to get remaining quota', { error })
			return 0
		}
	}

	/**
	 * Get time until rate limit resets
	 *
	 * @returns Date when the rate limit window resets
	 */
	async getResetTime(): Promise<Date> {
		const docRef = this.getDocRef()
		const now = Date.now()

		try {
			const doc = await docRef.get()
			const data = doc.data() as RateLimitDoc | undefined

			if (!data) {
				// No window exists, reset is now
				return new Date(now)
			}

			// Check if window has expired
			if (now - data.windowStart >= this.windowMs) {
				return new Date(now)
			}

			return new Date(data.windowStart + this.windowMs)
		} catch (error) {
			logger.error('Failed to get reset time', { error })
			return new Date(now + this.windowMs)
		}
	}

	/**
	 * Check current rate limit status
	 *
	 * @returns Current status including available quota and reset time
	 */
	async checkStatus(): Promise<{ available: number; resetAt: Date; currentUsage: number }> {
		const remaining = await this.getRemaining()
		const resetAt = await this.getResetTime()

		return {
			available: remaining,
			resetAt,
			currentUsage: this.maxImages - remaining,
		}
	}

	/**
	 * Calculate recommended delay before retry
	 *
	 * @param imageCount - Number of images that will be requested
	 * @returns Recommended delay in seconds
	 */
	async getRecommendedDelay(imageCount = 1): Promise<number> {
		const remaining = await this.getRemaining()

		if (remaining >= imageCount) {
			return 0
		}

		const resetAt = await this.getResetTime()
		const delayMs = resetAt.getTime() - Date.now()

		// Add small buffer to ensure window has reset
		return Math.max(1, Math.ceil(delayMs / 1000) + 2)
	}

	/**
	 * Force reset the rate limit (for testing/admin purposes)
	 */
	async reset(): Promise<void> {
		const docRef = this.getDocRef()
		await docRef.delete()
		logger.info('Rate limit reset')
	}
}
