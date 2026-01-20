/**
 * @fileoverview Queue Processing Cloud Function Handlers
 *
 * Handles generation request queue processing with rate limiting.
 * Includes retry scheduling via Firestore and cleanup of stale requests.
 */

import { GenerationStatus } from '@foundry/domain'
import * as logger from 'firebase-functions/logger'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { db } from '../lib/firebase'
import { FirestoreGenerationRepository } from '../repositories'
import { QueueService, RateLimiterService } from '../services'

// Initialize services
const queueService = new QueueService({ db })
const rateLimiter = new RateLimiterService({ db })
const generationRepository = new FirestoreGenerationRepository(db)

/**
 * Scheduled function to process pending retries
 *
 * Runs every minute to check for scheduled retries that are due.
 */
export const processScheduledRetries = onSchedule(
	{
		schedule: 'every 1 minutes',
		timeoutSeconds: 60,
		maxInstances: 1,
	},
	async () => {
		logger.info('Processing scheduled retries')

		try {
			const processedCount = await queueService.processScheduledRetries()

			logger.info('Scheduled retries processed', { processedCount })
		} catch (error) {
			logger.error('Failed to process scheduled retries', { error })
		}
	},
)

/**
 * Scheduled function to clean up expired/stale generation requests
 *
 * Runs every hour to:
 * 1. Fail generations stuck in PROCESSING for too long
 * 2. Clean up abandoned QUEUED generations
 */
export const cleanupExpiredGenerations = onSchedule(
	{
		schedule: 'every 60 minutes',
		timeoutSeconds: 300,
		maxInstances: 1,
	},
	async () => {
		logger.info('Starting expired generation cleanup')

		const now = Date.now()

		// Timeout for PROCESSING state (15 minutes)
		const processingTimeoutMs = 15 * 60 * 1000

		// Timeout for QUEUED state (2 hours)
		const queuedTimeoutMs = 2 * 60 * 60 * 1000

		let failedCount = 0

		try {
			// Find stuck PROCESSING generations
			const processingCutoff = new Date(now - processingTimeoutMs)
			const stuckProcessing = await db
				.collection('generations')
				.where('status', '==', GenerationStatus.PROCESSING)
				.where('updatedAt', '<', processingCutoff)
				.limit(100)
				.get()

			for (const doc of stuckProcessing.docs) {
				const generationId = doc.id
				try {
					const generation = await generationRepository.findById(generationId)
					if (generation && generation.status === GenerationStatus.PROCESSING) {
						const failedGeneration = generation.fail('Generation timed out during processing')
						await generationRepository.update(failedGeneration)
						failedCount++
						logger.warn('Timed out stuck processing generation', { generationId })
					}
				} catch (error) {
					logger.error('Failed to timeout generation', { error, generationId })
				}
			}

			// Find abandoned QUEUED generations
			const queuedCutoff = new Date(now - queuedTimeoutMs)
			const abandonedQueued = await db
				.collection('generations')
				.where('status', '==', GenerationStatus.QUEUED)
				.where('createdAt', '<', queuedCutoff)
				.limit(100)
				.get()

			for (const doc of abandonedQueued.docs) {
				const generationId = doc.id
				try {
					const generation = await generationRepository.findById(generationId)
					if (generation && generation.status === GenerationStatus.QUEUED) {
						const failedGeneration = generation.fail('Generation expired while waiting in queue')
						await generationRepository.update(failedGeneration)
						failedCount++
						logger.warn('Expired abandoned queued generation', { generationId })
					}
				} catch (error) {
					logger.error('Failed to expire generation', { error, generationId })
				}
			}

			const processedCount = stuckProcessing.size + abandonedQueued.size

			logger.info('Expired generation cleanup completed', {
				processedCount,
				failedCount,
			})
		} catch (error) {
			logger.error('Cleanup job failed', { error })
		}
	},
)

/**
 * Get rate limiter status (for monitoring)
 */
export async function getRateLimiterStatus(): Promise<{
	available: number
	resetAt: Date
	currentUsage: number
}> {
	return rateLimiter.checkStatus()
}
