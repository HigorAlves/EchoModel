/**
 * @fileoverview Firestore Model Repository Implementation
 *
 * Implements IModelRepository interface using Firestore as the persistence layer.
 */

import type { Firestore, Query, DocumentData } from 'firebase-admin/firestore'
import {
	Model,
	type IModelRepository,
	type ModelQueryFilters,
	type PersistenceModel,
	ModelId,
	ModelName,
	ModelDescription,
	ModelPrompt,
	ModelStatus,
} from '@foundry/domain'
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
			createdAt: model.createdAt,
			updatedAt: model.updatedAt,
			deletedAt: model.deletedAt,
		}
	}

	/**
	 * Convert Firestore document to domain Model
	 */
	private toDomain(data: PersistenceModel): Model {
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
