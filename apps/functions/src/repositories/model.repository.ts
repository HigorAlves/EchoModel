/**
 * @fileoverview Firestore Model Repository Implementation
 *
 * Implements IModelRepository interface using Firestore as the persistence layer.
 */

import {
	BackgroundType,
	Expression,
	type IModelRepository,
	Model,
	ModelCameraConfig,
	ModelDescription,
	ModelId,
	ModelLightingConfig,
	ModelName,
	ModelPrompt,
	type ModelQueryFilters,
	ModelStatus,
	ModelTexturePreferences,
	type PersistenceModel,
	PoseStyle,
	PostProcessingStyle,
} from '@foundry/domain'
import type { DocumentData, Firestore, Query } from 'firebase-admin/firestore'
import { Collections } from '../lib/firebase'

/**
 * Firestore implementation of IModelRepository
 */
export class FirestoreModelRepository implements IModelRepository {
	private readonly collection

	constructor(private readonly firestore: Firestore) {
		this.collection = this.firestore.collection(Collections.MODELS)
	}

	/**
	 * Convert domain Model to Firestore document data
	 */
	private toFirestore(model: Model): PersistenceModel {
		// Use toJSON() to properly serialize configs without undefined values
		const lightingConfig = model.lightingConfig.toJSON()
		const cameraConfig = model.cameraConfig.toJSON()

		return {
			id: model.id.value,
			storeId: model.storeId,
			name: model.name.value,
			description: model.description?.value ?? null,
			status: model.status,
			gender: model.gender,
			ageRange: model.ageRange,
			ethnicity: model.ethnicity,
			bodyType: model.bodyType,
			prompt: model.prompt?.value ?? null,
			referenceImages: [...model.referenceImages],
			calibrationImages: [...model.calibrationImages],
			lockedIdentityUrl: model.lockedIdentityUrl,
			failureReason: model.failureReason,
			// Fashion configuration - use toJSON() to exclude undefined values
			lightingConfig,
			cameraConfig,
			backgroundType: model.backgroundType,
			poseStyle: model.poseStyle,
			expression: model.expression,
			postProcessingStyle: model.postProcessingStyle,
			texturePreferences: [...model.texturePreferences.value],
			productCategories: [...model.productCategories],
			supportOutfitSwapping: model.supportOutfitSwapping,
			createdAt: model.createdAt,
			updatedAt: model.updatedAt,
			deletedAt: model.deletedAt,
		}
	}

	/**
	 * Convert Firestore document to domain Model
	 */
	private toDomain(data: PersistenceModel): Model {
		// Reconstruct fashion config value objects with defaults for backward compatibility
		const lightingConfig = data.lightingConfig
			? ModelLightingConfig.create({
					preset: data.lightingConfig.preset,
					customSettings: data.lightingConfig.customSettings,
				})
			: ModelLightingConfig.createDefault()

		const cameraConfig = data.cameraConfig
			? ModelCameraConfig.create({
					framing: data.cameraConfig.framing,
					customSettings: data.cameraConfig.customSettings,
				})
			: ModelCameraConfig.createDefault()

		const texturePreferences = data.texturePreferences
			? ModelTexturePreferences.create(data.texturePreferences)
			: ModelTexturePreferences.createEmpty()

		return Model.create({
			id: ModelId.create(data.id),
			storeId: data.storeId,
			name: ModelName.create(data.name),
			description: data.description ? ModelDescription.create(data.description) : null,
			status: data.status,
			gender: data.gender,
			ageRange: data.ageRange,
			ethnicity: data.ethnicity,
			bodyType: data.bodyType,
			prompt: data.prompt ? ModelPrompt.create(data.prompt) : null,
			referenceImages: data.referenceImages,
			calibrationImages: data.calibrationImages,
			lockedIdentityUrl: data.lockedIdentityUrl,
			failureReason: data.failureReason,
			// Fashion configuration
			lightingConfig,
			cameraConfig,
			backgroundType: data.backgroundType ?? BackgroundType.STUDIO_WHITE,
			poseStyle: data.poseStyle ?? PoseStyle.STATIC_FRONT,
			expression: data.expression ?? Expression.NEUTRAL,
			postProcessingStyle: data.postProcessingStyle ?? PostProcessingStyle.NATURAL,
			texturePreferences,
			productCategories: data.productCategories ?? [],
			supportOutfitSwapping: data.supportOutfitSwapping ?? true,
			createdAt: data.createdAt instanceof Date ? data.createdAt : (data.createdAt as any).toDate(),
			updatedAt: data.updatedAt instanceof Date ? data.updatedAt : (data.updatedAt as any).toDate(),
			deletedAt: data.deletedAt
				? data.deletedAt instanceof Date
					? data.deletedAt
					: (data.deletedAt as any).toDate()
				: null,
		})
	}

	/**
	 * Apply filters to a Firestore query
	 */
	private applyFilters(filters?: ModelQueryFilters): Query<DocumentData, DocumentData> {
		let query: Query<DocumentData, DocumentData> = this.collection

		if (filters) {
			if (filters.storeId) {
				query = query.where('storeId', '==', filters.storeId)
			}
			if (filters.status) {
				query = query.where('status', '==', filters.status)
			}
			if (filters.gender) {
				query = query.where('gender', '==', filters.gender)
			}
			if (filters.ageRange) {
				query = query.where('ageRange', '==', filters.ageRange)
			}
			if (filters.ethnicity) {
				query = query.where('ethnicity', '==', filters.ethnicity)
			}
			if (filters.bodyType) {
				query = query.where('bodyType', '==', filters.bodyType)
			}
			// Fashion config filters
			if (filters.lightingPreset) {
				query = query.where('lightingConfig.preset', '==', filters.lightingPreset)
			}
			if (filters.cameraFraming) {
				query = query.where('cameraConfig.framing', '==', filters.cameraFraming)
			}
			if (filters.productCategory) {
				query = query.where('productCategories', 'array-contains', filters.productCategory)
			}
			if (typeof filters.supportsOutfitSwapping === 'boolean') {
				query = query.where('supportOutfitSwapping', '==', filters.supportsOutfitSwapping)
			}
			if (!filters.includeDeleted) {
				query = query.where('deletedAt', '==', null)
			}
			if (!filters.includeArchived) {
				query = query.where('status', '!=', ModelStatus.ARCHIVED)
			}
			if (filters.sortBy) {
				query = query.orderBy(filters.sortBy, filters.sortOrder ?? 'desc')
			} else {
				query = query.orderBy('createdAt', 'desc')
			}
			if (filters.limit) {
				query = query.limit(filters.limit)
			}
			if (filters.offset) {
				query = query.offset(filters.offset)
			}
		} else {
			query = query.where('deletedAt', '==', null).orderBy('createdAt', 'desc')
		}

		return query
	}

	async create(model: Model): Promise<string> {
		const data = this.toFirestore(model)
		await this.collection.doc(data.id).set(data)
		return data.id
	}

	async save(id: string, model: Model): Promise<void> {
		const data = this.toFirestore(model)
		await this.collection.doc(id).set(data)
	}

	async update(model: Model): Promise<void> {
		const data = this.toFirestore(model)
		await this.collection.doc(data.id).update(data as unknown as Record<string, unknown>)
	}

	async remove(id: string): Promise<void> {
		await this.collection.doc(id).delete()
	}

	async findById(id: string): Promise<Model | null> {
		const doc = await this.collection.doc(id).get()
		if (!doc.exists) {
			return null
		}
		return this.toDomain(doc.data() as PersistenceModel)
	}

	async findMany(filters?: ModelQueryFilters): Promise<Model[]> {
		const query = this.applyFilters(filters)
		const snapshot = await query.get()
		return snapshot.docs.map((doc) => this.toDomain(doc.data() as PersistenceModel))
	}

	async findOne(filters: ModelQueryFilters): Promise<Model | null> {
		const results = await this.findMany({ ...filters, limit: 1 })
		return results[0] ?? null
	}

	async count(filters?: ModelQueryFilters): Promise<number> {
		const query = this.applyFilters(filters)
		const snapshot = await query.count().get()
		return snapshot.data().count
	}

	async exists(id: string): Promise<boolean> {
		const doc = await this.collection.doc(id).get()
		return doc.exists
	}

	async findByStoreId(storeId: string, filters?: Omit<ModelQueryFilters, 'storeId'>): Promise<Model[]> {
		return this.findMany({ ...filters, storeId })
	}

	async findByStatus(storeId: string, status: ModelStatus): Promise<Model[]> {
		return this.findMany({ storeId, status })
	}

	async findActiveByStoreId(storeId: string): Promise<Model[]> {
		return this.findByStatus(storeId, ModelStatus.ACTIVE)
	}
}
