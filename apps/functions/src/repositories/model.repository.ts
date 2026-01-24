/**
 * @fileoverview Firestore Model Repository Implementation
 *
 * Implements IModelRepository interface using Firestore as the persistence layer.
 */

import {
	type IModelRepository,
	type Model,
	ModelMapper,
	type ModelQueryFilters,
	ModelStatus,
	type PersistenceModel,
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
		return ModelMapper.toPersistence(model)
	}

	/**
	 * Convert Firestore document to domain Model
	 */
	private toDomain(data: PersistenceModel): Model {
		// Handle Firestore Timestamp conversion
		const toDate = (value: unknown): Date | null => {
			if (!value) return null
			if (value instanceof Date) return value
			if (typeof value === 'object' && value !== null && 'toDate' in value) {
				return (value as { toDate: () => Date }).toDate()
			}
			return null
		}

		return ModelMapper.toDomain({
			...data,
			createdAt: toDate(data.createdAt) ?? new Date(),
			updatedAt: toDate(data.updatedAt) ?? new Date(),
			deletedAt: toDate(data.deletedAt),
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
			if (filters.name) {
				query = query.where('name', '==', filters.name)
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
			if (filters.lightingPreset) {
				query = query.where('lightingConfig.preset', '==', filters.lightingPreset)
			}
			if (filters.cameraFraming) {
				query = query.where('cameraConfig.framing', '==', filters.cameraFraming)
			}
			if (filters.backgroundType) {
				query = query.where('backgroundType', '==', filters.backgroundType)
			}
			if (filters.poseStyle) {
				query = query.where('poseStyle', '==', filters.poseStyle)
			}
			if (filters.expression) {
				query = query.where('expression', '==', filters.expression)
			}
			if (filters.postProcessingStyle) {
				query = query.where('postProcessingStyle', '==', filters.postProcessingStyle)
			}
			if (filters.productCategory) {
				query = query.where('productCategories', 'array-contains', filters.productCategory)
			}
			if (filters.supportsOutfitSwapping !== undefined) {
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
		return this.findMany({ storeId, status: ModelStatus.ACTIVE })
	}
}
