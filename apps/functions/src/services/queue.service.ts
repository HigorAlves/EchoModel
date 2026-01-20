/**
 * @fileoverview Queue Management Service
 *
 * Manages generation request queueing via Pub/Sub
 * for rate-limited processing of Seedream 4.5 API calls.
 *
 * Architecture:
 * 1. Generation requests are published to Pub/Sub topic
 * 2. Pub/Sub triggers processGenerationPubSub handler
 * 3. If rate limited, Firestore stores retry info for scheduled function
 * 4. Firestore listeners notify clients of status changes
 */

import { PubSub } from '@google-cloud/pubsub'
import type { Firestore } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'

/**
 * Queue configuration options
 */
export interface QueueConfig {
	/** GCP project ID */
	projectId?: string
	/** Pub/Sub topic name for generation requests */
	topicName?: string
	/** Firestore instance for retry scheduling */
	db?: Firestore
}

/**
 * Enqueue options for generation requests
 */
export interface EnqueueOptions {
	/** Priority (1-10, higher = more urgent) */
	priority?: number
	/** Delay before processing (seconds) */
	delaySeconds?: number
}

/**
 * Queue status information
 */
export interface QueueStatus {
	/** Approximate number of pending messages */
	pendingCount: number
	/** Estimated wait time in seconds */
	estimatedWaitSeconds: number
}

/**
 * Scheduled retry document structure
 */
interface ScheduledRetry {
	/** Generation ID to retry */
	generationId: string
	/** Timestamp when retry should be executed */
	scheduledAt: Date
	/** Number of retry attempts */
	attempt: number
	/** Creation timestamp */
	createdAt: Date
}

const DEFAULT_TOPIC_NAME = 'generation-requests'
const RETRY_COLLECTION = '_scheduledRetries'

/**
 * Queue Management Service
 *
 * Handles publishing generation requests to Pub/Sub and scheduling
 * delayed retries via Firestore when rate limited.
 */
export class QueueService {
	private readonly pubsub: PubSub
	private readonly projectId: string
	private readonly topicName: string
	private readonly db?: Firestore

	constructor(config: QueueConfig = {}) {
		this.projectId = config.projectId ?? process.env.GCLOUD_PROJECT ?? process.env.GCP_PROJECT ?? ''
		this.topicName = config.topicName ?? DEFAULT_TOPIC_NAME
		this.db = config.db

		this.pubsub = new PubSub({ projectId: this.projectId })

		logger.info('QueueService initialized', {
			projectId: this.projectId,
			topicName: this.topicName,
		})
	}

	/**
	 * Publish generation request to Pub/Sub queue
	 *
	 * @param generationId - ID of the generation to process
	 * @param options - Optional enqueue parameters
	 * @returns Message ID
	 */
	async enqueueGeneration(generationId: string, options: EnqueueOptions = {}): Promise<string> {
		const { priority = 5 } = options

		const message = {
			generationId,
			priority,
			enqueuedAt: new Date().toISOString(),
		}

		const topic = this.pubsub.topic(this.topicName)

		// Publish with ordering key for priority-based processing
		const orderingKey = `priority-${priority}`

		const messageId = await topic.publishMessage({
			data: Buffer.from(JSON.stringify(message)),
			orderingKey,
			attributes: {
				generationId,
				priority: String(priority),
			},
		})

		logger.info('Generation enqueued', {
			generationId,
			messageId,
			priority,
		})

		return messageId
	}

	/**
	 * Schedule delayed retry via Firestore
	 *
	 * Used when rate limited to retry after the limit resets.
	 * A scheduled function will pick up pending retries.
	 *
	 * @param generationId - ID of the generation to retry
	 * @param delaySeconds - Seconds to wait before retry
	 * @param attempt - Current retry attempt number
	 */
	async scheduleRetry(generationId: string, delaySeconds: number, attempt = 1): Promise<string> {
		if (!this.db) {
			// Fallback: re-enqueue immediately with higher priority
			logger.warn('No Firestore instance, re-enqueueing immediately', { generationId })
			return this.requeue(generationId, 8)
		}

		const scheduledAt = new Date(Date.now() + delaySeconds * 1000)

		const retryDoc: ScheduledRetry = {
			generationId,
			scheduledAt,
			attempt,
			createdAt: new Date(),
		}

		const docRef = await this.db.collection(RETRY_COLLECTION).add(retryDoc)

		logger.info('Retry scheduled', {
			generationId,
			delaySeconds,
			attempt,
			scheduledAt: scheduledAt.toISOString(),
			docId: docRef.id,
		})

		return docRef.id
	}

	/**
	 * Process scheduled retries that are due
	 *
	 * Called by a scheduled Cloud Function to process pending retries.
	 *
	 * @returns Number of retries processed
	 */
	async processScheduledRetries(): Promise<number> {
		if (!this.db) {
			logger.warn('No Firestore instance, cannot process scheduled retries')
			return 0
		}

		const now = new Date()
		let processedCount = 0

		try {
			// Find retries that are due
			const dueRetries = await this.db.collection(RETRY_COLLECTION).where('scheduledAt', '<=', now).limit(100).get()

			for (const doc of dueRetries.docs) {
				const retry = doc.data() as ScheduledRetry

				try {
					// Re-enqueue with higher priority
					await this.requeue(retry.generationId, 8)

					// Delete the retry document
					await doc.ref.delete()
					processedCount++

					logger.info('Processed scheduled retry', {
						generationId: retry.generationId,
						attempt: retry.attempt,
					})
				} catch (error) {
					logger.error('Failed to process scheduled retry', {
						error,
						generationId: retry.generationId,
					})
				}
			}

			return processedCount
		} catch (error) {
			logger.error('Failed to query scheduled retries', { error })
			return 0
		}
	}

	/**
	 * Get estimated wait time for new generation requests
	 *
	 * Based on current queue depth and average processing time.
	 *
	 * @returns Estimated wait time in seconds
	 */
	async getEstimatedWaitSeconds(): Promise<number> {
		// Average processing time per generation (in seconds)
		const AVG_PROCESSING_TIME = 15

		// Rate limit: 500 images/minute = ~8.3 images/second
		// Assuming average 4 images per generation = ~2 generations/second
		const GENERATIONS_PER_SECOND = 2

		try {
			// Get subscription metrics to estimate queue depth
			// This is a simplified estimation
			const subscription = this.pubsub.subscription(`${this.topicName}-sub`)
			const [metadata] = await subscription.getMetadata()

			// Estimate based on unacked messages if available
			const pendingMessages = (metadata as { numUnackedMessages?: number }).numUnackedMessages ?? 0
			const queueWait = pendingMessages / GENERATIONS_PER_SECOND

			return Math.ceil(queueWait + AVG_PROCESSING_TIME)
		} catch {
			// If we can't get metrics, return a default estimate
			return AVG_PROCESSING_TIME
		}
	}

	/**
	 * Get current queue status
	 *
	 * @returns Queue status with pending count and estimated wait
	 */
	async getQueueStatus(): Promise<QueueStatus> {
		const estimatedWaitSeconds = await this.getEstimatedWaitSeconds()

		return {
			pendingCount: 0, // Would need subscription metrics
			estimatedWaitSeconds,
		}
	}

	/**
	 * Re-enqueue a generation request (for retries)
	 *
	 * @param generationId - ID of the generation to re-queue
	 * @param priority - Priority boost for retry (higher = more urgent)
	 */
	async requeue(generationId: string, priority = 7): Promise<string> {
		return this.enqueueGeneration(generationId, { priority })
	}
}
