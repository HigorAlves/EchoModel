import { randomUUID } from 'node:crypto'
import type { AspectRatio } from '../Store/store.enum'
import { GenerationStatus, isValidGenerationTransition } from './generation.enum'
import { GenerationInvalidTransitionError } from './generation.error'
import type { GenerationEvent } from './generation.event'
import {
	createGenerationCompletedEvent,
	createGenerationCreatedEvent,
	createGenerationFailedEvent,
	createGenerationImageAddedEvent,
	createGenerationProcessingStartedEvent,
} from './generation.event'
import type { GeneratedImage, GenerationMetadata } from './generation.repository'
import { GenerationId, IdempotencyKey, ScenePrompt } from './value-objects'

/**
 * @fileoverview Generation Aggregate Root
 *
 * This entity serves as the Aggregate Root for the Generation bounded context.
 * A Generation represents a request to generate AI images using a model and garment.
 *
 * State Machine:
 * pending → processing → completed
 *              ↓
 *           failed
 */

export interface GenerationProps {
	readonly id: GenerationId
	readonly storeId: string
	readonly modelId: string
	readonly status: GenerationStatus
	readonly idempotencyKey: IdempotencyKey
	readonly garmentAssetId: string
	readonly scenePrompt: ScenePrompt
	readonly aspectRatios: readonly AspectRatio[]
	readonly imageCount: number
	readonly generatedImages: readonly GeneratedImage[]
	readonly startedAt: Date | null
	readonly completedAt: Date | null
	readonly failureReason: string | null
	readonly metadata: GenerationMetadata
	readonly createdAt: Date
	readonly updatedAt: Date
}

interface CreateGenerationDTO {
	readonly storeId: string
	readonly modelId: string
	readonly idempotencyKey: string
	readonly garmentAssetId: string
	readonly scenePrompt: string
	readonly aspectRatios: AspectRatio[]
	readonly imageCount: number
}

/**
 * Generation Aggregate Root
 */
export class Generation {
	private readonly _domainEvents: GenerationEvent[] = []

	private constructor(private readonly data: GenerationProps) {}

	/**
	 * Factory method to create a Generation aggregate from props
	 */
	static create(data: GenerationProps): Generation {
		return new Generation(data)
	}

	/**
	 * Factory method to create a new generation from DTO
	 */
	static createFromDTO(dto: CreateGenerationDTO): Generation {
		const now = new Date()
		const id = GenerationId.create(randomUUID())
		const idempotencyKey = IdempotencyKey.create(dto.idempotencyKey)
		const scenePrompt = ScenePrompt.create(dto.scenePrompt)

		const generation = new Generation({
			id,
			storeId: dto.storeId,
			modelId: dto.modelId,
			status: GenerationStatus.PENDING,
			idempotencyKey,
			garmentAssetId: dto.garmentAssetId,
			scenePrompt,
			aspectRatios: dto.aspectRatios,
			imageCount: dto.imageCount,
			generatedImages: [],
			startedAt: null,
			completedAt: null,
			failureReason: null,
			metadata: {
				requestedAt: now,
			},
			createdAt: now,
			updatedAt: now,
		})

		generation.addDomainEvent(
			createGenerationCreatedEvent(id.value, {
				generationId: id.value,
				storeId: dto.storeId,
				modelId: dto.modelId,
				idempotencyKey: idempotencyKey.value,
			}),
		)

		return generation
	}

	// Getters
	get value(): GenerationProps {
		return this.data
	}

	get id(): GenerationId {
		return this.data.id
	}

	get storeId(): string {
		return this.data.storeId
	}

	get modelId(): string {
		return this.data.modelId
	}

	get status(): GenerationStatus {
		return this.data.status
	}

	get idempotencyKey(): IdempotencyKey {
		return this.data.idempotencyKey
	}

	get garmentAssetId(): string {
		return this.data.garmentAssetId
	}

	get scenePrompt(): ScenePrompt {
		return this.data.scenePrompt
	}

	get aspectRatios(): readonly AspectRatio[] {
		return this.data.aspectRatios
	}

	get imageCount(): number {
		return this.data.imageCount
	}

	get generatedImages(): readonly GeneratedImage[] {
		return this.data.generatedImages
	}

	get startedAt(): Date | null {
		return this.data.startedAt
	}

	get completedAt(): Date | null {
		return this.data.completedAt
	}

	get failureReason(): string | null {
		return this.data.failureReason
	}

	get metadata(): GenerationMetadata {
		return this.data.metadata
	}

	get createdAt(): Date {
		return this.data.createdAt
	}

	get updatedAt(): Date {
		return this.data.updatedAt
	}

	get isPending(): boolean {
		return this.data.status === GenerationStatus.PENDING
	}

	get isProcessing(): boolean {
		return this.data.status === GenerationStatus.PROCESSING
	}

	get isCompleted(): boolean {
		return this.data.status === GenerationStatus.COMPLETED
	}

	get isFailed(): boolean {
		return this.data.status === GenerationStatus.FAILED
	}

	get domainEvents(): readonly GenerationEvent[] {
		return [...this._domainEvents]
	}

	addDomainEvent(event: GenerationEvent): void {
		this._domainEvents.push(event)
	}

	clearDomainEvents(): void {
		this._domainEvents.length = 0
	}

	equals(other: Generation): boolean {
		return this.data.id.equals(other.data.id)
	}

	/**
	 * Validate state transition
	 */
	private validateTransition(toStatus: GenerationStatus): void {
		if (!isValidGenerationTransition(this.data.status, toStatus)) {
			throw new GenerationInvalidTransitionError(this.data.status, toStatus)
		}
	}

	/**
	 * Start processing the generation
	 * Transitions from PENDING to PROCESSING
	 */
	startProcessing(): Generation {
		this.validateTransition(GenerationStatus.PROCESSING)

		const now = new Date()

		const processingGeneration = new Generation({
			...this.data,
			status: GenerationStatus.PROCESSING,
			startedAt: now,
			updatedAt: now,
		})

		processingGeneration.addDomainEvent(
			createGenerationProcessingStartedEvent(this.data.id.value, {
				generationId: this.data.id.value,
				storeId: this.data.storeId,
			}),
		)

		return processingGeneration
	}

	/**
	 * Add a generated image
	 */
	addGeneratedImage(image: GeneratedImage): Generation {
		const now = new Date()

		const updatedGeneration = new Generation({
			...this.data,
			generatedImages: [...this.data.generatedImages, image],
			updatedAt: now,
		})

		updatedGeneration.addDomainEvent(
			createGenerationImageAddedEvent(this.data.id.value, {
				generationId: this.data.id.value,
				imageId: image.id,
				aspectRatio: image.aspectRatio,
			}),
		)

		return updatedGeneration
	}

	/**
	 * Complete the generation
	 * Transitions from PROCESSING to COMPLETED
	 */
	complete(): Generation {
		this.validateTransition(GenerationStatus.COMPLETED)

		const now = new Date()
		const processingTimeMs = this.data.startedAt ? now.getTime() - this.data.startedAt.getTime() : undefined

		const completedGeneration = new Generation({
			...this.data,
			status: GenerationStatus.COMPLETED,
			completedAt: now,
			metadata: {
				...this.data.metadata,
				processingTimeMs,
			},
			updatedAt: now,
		})

		completedGeneration.addDomainEvent(
			createGenerationCompletedEvent(this.data.id.value, {
				generationId: this.data.id.value,
				storeId: this.data.storeId,
				imageCount: this.data.generatedImages.length,
			}),
		)

		return completedGeneration
	}

	/**
	 * Mark the generation as failed
	 * Transitions from PROCESSING to FAILED
	 */
	fail(reason: string): Generation {
		this.validateTransition(GenerationStatus.FAILED)

		const now = new Date()

		const failedGeneration = new Generation({
			...this.data,
			status: GenerationStatus.FAILED,
			failureReason: reason,
			completedAt: now,
			updatedAt: now,
		})

		failedGeneration.addDomainEvent(
			createGenerationFailedEvent(this.data.id.value, {
				generationId: this.data.id.value,
				storeId: this.data.storeId,
				reason,
			}),
		)

		return failedGeneration
	}

	/**
	 * Update metadata
	 */
	updateMetadata(metadata: Partial<GenerationMetadata>): Generation {
		const now = new Date()

		return new Generation({
			...this.data,
			metadata: { ...this.data.metadata, ...metadata },
			updatedAt: now,
		})
	}
}
