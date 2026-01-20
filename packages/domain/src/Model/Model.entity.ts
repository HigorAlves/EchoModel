import { randomUUID } from 'node:crypto'
import {
	type AgeRange,
	type BodyType,
	CameraFraming,
	type Ethnicity,
	type Gender,
	LightingPreset,
	ModelStatus,
	type ProductCategory,
	isValidModelTransition,
} from './model.enum'
import { ModelInvalidTransitionError, ModelRequiresInputError } from './model.error'
import type { ModelEvent } from './model.event'
import {
	createModelApprovedEvent,
	createModelArchivedEvent,
	createModelCalibrationImageAddedEvent,
	createModelCalibrationStartedEvent,
	createModelCreatedEvent,
	createModelRejectedEvent,
	createModelUpdatedEvent,
} from './model.event'
import {
	ModelCameraConfig,
	ModelDescription,
	ModelId,
	ModelLightingConfig,
	ModelName,
	ModelPrompt,
	ModelTexturePreferences,
} from './value-objects'

/**
 * @fileoverview Model Aggregate Root
 *
 * This entity serves as the Aggregate Root for the Model (AI Influencer) bounded context.
 * A Model represents an AI-generated influencer with a consistent identity that can be
 * used to generate marketing images for clothing.
 *
 * State Machine:
 * draft → calibrating → active
 *              ↓
 *           failed → draft (retry)
 * active → archived
 */

export interface ModelProps {
	readonly id: ModelId
	readonly storeId: string
	readonly name: ModelName
	readonly description: ModelDescription | null
	readonly status: ModelStatus
	readonly gender: Gender
	readonly ageRange: AgeRange
	readonly ethnicity: Ethnicity
	readonly bodyType: BodyType
	readonly prompt: ModelPrompt | null
	readonly referenceImages: readonly string[]
	readonly calibrationImages: readonly string[]
	readonly lockedIdentityUrl: string | null
	readonly failureReason: string | null
	// Seedream 4.5 Fashion configuration
	readonly lightingConfig: ModelLightingConfig
	readonly cameraConfig: ModelCameraConfig
	readonly texturePreferences: ModelTexturePreferences
	readonly productCategories: readonly ProductCategory[]
	readonly supportOutfitSwapping: boolean
	readonly createdAt: Date
	readonly updatedAt: Date
	readonly deletedAt: Date | null
}

interface CreateModelDTO {
	readonly storeId: string
	readonly name: string
	readonly description?: string
	readonly gender: Gender
	readonly ageRange: AgeRange
	readonly ethnicity: Ethnicity
	readonly bodyType: BodyType
	readonly prompt?: string
	readonly referenceImageIds?: string[]
	// Seedream 4.5 Fashion configuration (optional with sensible defaults)
	readonly lightingPreset?: LightingPreset
	readonly customLightingSettings?: {
		readonly intensity: number
		readonly warmth: number
		readonly contrast: number
	}
	readonly cameraFraming?: CameraFraming
	readonly customCameraSettings?: {
		readonly focalLength: number
		readonly cropRatio: string
		readonly angle: string
	}
	readonly texturePreferences?: string[]
	readonly productCategories?: ProductCategory[]
	readonly supportOutfitSwapping?: boolean
}

interface UpdateModelDTO {
	readonly name?: string
	readonly description?: string | null
}

/**
 * Model Aggregate Root
 */
export class Model {
	private readonly _domainEvents: ModelEvent[] = []

	private constructor(private readonly data: ModelProps) {}

	/**
	 * Factory method to create a Model aggregate from props
	 */
	static create(data: ModelProps): Model {
		return new Model(data)
	}

	/**
	 * Factory method to create a new model from DTO
	 * Requires either a prompt or reference images
	 */
	static createFromDTO(dto: CreateModelDTO): Model {
		// Validate that either prompt or reference images are provided
		if (!dto.prompt && (!dto.referenceImageIds || dto.referenceImageIds.length === 0)) {
			throw new ModelRequiresInputError()
		}

		const now = new Date()
		const id = ModelId.create(randomUUID())
		const name = ModelName.create(dto.name)
		const description = dto.description ? ModelDescription.create(dto.description) : null
		const prompt = dto.prompt ? ModelPrompt.create(dto.prompt) : null

		// Create fashion configuration with sensible defaults
		const lightingConfig = dto.lightingPreset
			? dto.lightingPreset === LightingPreset.CUSTOM && dto.customLightingSettings
				? ModelLightingConfig.create({
						preset: LightingPreset.CUSTOM,
						customSettings: dto.customLightingSettings,
					})
				: ModelLightingConfig.fromPreset(dto.lightingPreset)
			: ModelLightingConfig.createDefault()

		const cameraConfig = dto.cameraFraming
			? dto.cameraFraming === CameraFraming.CUSTOM && dto.customCameraSettings
				? ModelCameraConfig.create({
						framing: CameraFraming.CUSTOM,
						customSettings: dto.customCameraSettings,
					})
				: ModelCameraConfig.fromFraming(dto.cameraFraming)
			: ModelCameraConfig.createDefault()

		const texturePreferences = dto.texturePreferences
			? ModelTexturePreferences.create(dto.texturePreferences)
			: ModelTexturePreferences.createEmpty()

		const model = new Model({
			id,
			storeId: dto.storeId,
			name,
			description,
			status: ModelStatus.DRAFT,
			gender: dto.gender,
			ageRange: dto.ageRange,
			ethnicity: dto.ethnicity,
			bodyType: dto.bodyType,
			prompt,
			referenceImages: dto.referenceImageIds ?? [],
			calibrationImages: [],
			lockedIdentityUrl: null,
			failureReason: null,
			lightingConfig,
			cameraConfig,
			texturePreferences,
			productCategories: dto.productCategories ?? [],
			supportOutfitSwapping: dto.supportOutfitSwapping ?? true,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		})

		model.addDomainEvent(
			createModelCreatedEvent(id.value, {
				modelId: id.value,
				storeId: dto.storeId,
				name: name.value,
			}),
		)

		return model
	}

	// Getters
	get value(): ModelProps {
		return this.data
	}

	get id(): ModelId {
		return this.data.id
	}

	get storeId(): string {
		return this.data.storeId
	}

	get name(): ModelName {
		return this.data.name
	}

	get description(): ModelDescription | null {
		return this.data.description
	}

	get status(): ModelStatus {
		return this.data.status
	}

	get gender(): Gender {
		return this.data.gender
	}

	get ageRange(): AgeRange {
		return this.data.ageRange
	}

	get ethnicity(): Ethnicity {
		return this.data.ethnicity
	}

	get bodyType(): BodyType {
		return this.data.bodyType
	}

	get prompt(): ModelPrompt | null {
		return this.data.prompt
	}

	get referenceImages(): readonly string[] {
		return this.data.referenceImages
	}

	get calibrationImages(): readonly string[] {
		return this.data.calibrationImages
	}

	get lockedIdentityUrl(): string | null {
		return this.data.lockedIdentityUrl
	}

	get failureReason(): string | null {
		return this.data.failureReason
	}

	// Fashion configuration getters
	get lightingConfig(): ModelLightingConfig {
		return this.data.lightingConfig
	}

	get cameraConfig(): ModelCameraConfig {
		return this.data.cameraConfig
	}

	get texturePreferences(): ModelTexturePreferences {
		return this.data.texturePreferences
	}

	get productCategories(): readonly ProductCategory[] {
		return this.data.productCategories
	}

	get supportOutfitSwapping(): boolean {
		return this.data.supportOutfitSwapping
	}

	get createdAt(): Date {
		return this.data.createdAt
	}

	get updatedAt(): Date {
		return this.data.updatedAt
	}

	get deletedAt(): Date | null {
		return this.data.deletedAt
	}

	get isDeleted(): boolean {
		return this.data.deletedAt !== null
	}

	get isActive(): boolean {
		return this.data.status === ModelStatus.ACTIVE && !this.isDeleted
	}

	get isDraft(): boolean {
		return this.data.status === ModelStatus.DRAFT
	}

	get isCalibrating(): boolean {
		return this.data.status === ModelStatus.CALIBRATING
	}

	get isFailed(): boolean {
		return this.data.status === ModelStatus.FAILED
	}

	get isArchived(): boolean {
		return this.data.status === ModelStatus.ARCHIVED
	}

	get domainEvents(): readonly ModelEvent[] {
		return [...this._domainEvents]
	}

	addDomainEvent(event: ModelEvent): void {
		this._domainEvents.push(event)
	}

	clearDomainEvents(): void {
		this._domainEvents.length = 0
	}

	equals(other: Model): boolean {
		return this.data.id.equals(other.data.id)
	}

	/**
	 * Validate state transition
	 */
	private validateTransition(toStatus: ModelStatus): void {
		if (!isValidModelTransition(this.data.status, toStatus)) {
			throw new ModelInvalidTransitionError(this.data.status, toStatus)
		}
	}

	/**
	 * Update basic model information
	 * Can only be done in DRAFT or FAILED status
	 */
	update(dto: UpdateModelDTO): Model {
		const now = new Date()
		const changes: Record<string, { from: unknown; to: unknown }> = {}

		let name = this.data.name
		let description = this.data.description

		if (dto.name !== undefined) {
			const newName = ModelName.create(dto.name)
			changes.name = { from: this.data.name.value, to: newName.value }
			name = newName
		}

		if (dto.description !== undefined) {
			const newDescription = dto.description ? ModelDescription.create(dto.description) : null
			changes.description = { from: this.data.description?.value ?? null, to: newDescription?.value ?? null }
			description = newDescription
		}

		const updatedModel = new Model({
			...this.data,
			name,
			description,
			updatedAt: now,
		})

		if (Object.keys(changes).length > 0) {
			updatedModel.addDomainEvent(
				createModelUpdatedEvent(this.data.id.value, {
					modelId: this.data.id.value,
					changes,
				}),
			)
		}

		return updatedModel
	}

	/**
	 * Start calibration process
	 * Transitions from DRAFT to CALIBRATING
	 */
	startCalibration(): Model {
		this.validateTransition(ModelStatus.CALIBRATING)

		const now = new Date()

		const calibratingModel = new Model({
			...this.data,
			status: ModelStatus.CALIBRATING,
			failureReason: null,
			updatedAt: now,
		})

		calibratingModel.addDomainEvent(
			createModelCalibrationStartedEvent(this.data.id.value, {
				modelId: this.data.id.value,
				storeId: this.data.storeId,
			}),
		)

		return calibratingModel
	}

	/**
	 * Add a calibration image
	 * Can only be done during CALIBRATING status
	 */
	addCalibrationImage(imageId: string): Model {
		const now = new Date()

		const updatedModel = new Model({
			...this.data,
			calibrationImages: [...this.data.calibrationImages, imageId],
			updatedAt: now,
		})

		updatedModel.addDomainEvent(
			createModelCalibrationImageAddedEvent(this.data.id.value, {
				modelId: this.data.id.value,
				imageId,
			}),
		)

		return updatedModel
	}

	/**
	 * Approve calibration and activate the model
	 * Transitions from CALIBRATING to ACTIVE
	 */
	approveCalibration(lockedIdentityUrl: string): Model {
		this.validateTransition(ModelStatus.ACTIVE)

		const now = new Date()

		const activeModel = new Model({
			...this.data,
			status: ModelStatus.ACTIVE,
			lockedIdentityUrl,
			updatedAt: now,
		})

		activeModel.addDomainEvent(
			createModelApprovedEvent(this.data.id.value, {
				modelId: this.data.id.value,
				storeId: this.data.storeId,
				lockedIdentityUrl,
			}),
		)

		return activeModel
	}

	/**
	 * Reject calibration
	 * Transitions from CALIBRATING to FAILED
	 */
	rejectCalibration(reason: string): Model {
		this.validateTransition(ModelStatus.FAILED)

		const now = new Date()

		const failedModel = new Model({
			...this.data,
			status: ModelStatus.FAILED,
			failureReason: reason,
			updatedAt: now,
		})

		failedModel.addDomainEvent(
			createModelRejectedEvent(this.data.id.value, {
				modelId: this.data.id.value,
				storeId: this.data.storeId,
				reason,
			}),
		)

		return failedModel
	}

	/**
	 * Reset to draft for retry
	 * Transitions from FAILED to DRAFT
	 */
	resetToDraft(): Model {
		this.validateTransition(ModelStatus.DRAFT)

		const now = new Date()

		return new Model({
			...this.data,
			status: ModelStatus.DRAFT,
			calibrationImages: [],
			failureReason: null,
			updatedAt: now,
		})
	}

	/**
	 * Archive the model
	 * Transitions from ACTIVE to ARCHIVED
	 */
	archive(): Model {
		this.validateTransition(ModelStatus.ARCHIVED)

		const now = new Date()

		const archivedModel = new Model({
			...this.data,
			status: ModelStatus.ARCHIVED,
			updatedAt: now,
		})

		archivedModel.addDomainEvent(
			createModelArchivedEvent(this.data.id.value, {
				modelId: this.data.id.value,
				storeId: this.data.storeId,
			}),
		)

		return archivedModel
	}

	/**
	 * Soft delete the model
	 */
	delete(): Model {
		const now = new Date()

		return new Model({
			...this.data,
			deletedAt: now,
			updatedAt: now,
		})
	}

	/**
	 * Restore a soft-deleted model
	 */
	restore(): Model {
		const now = new Date()

		return new Model({
			...this.data,
			deletedAt: null,
			updatedAt: now,
		})
	}
}
