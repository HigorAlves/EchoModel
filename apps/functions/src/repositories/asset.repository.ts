/**
 * @fileoverview Firestore Asset Repository Implementation
 *
 * Implements IAssetRepository interface using Firestore as the persistence layer.
 */

import {
	type Asset,
	type AssetCategory,
	AssetMapper,
	type AssetQueryFilters,
	type IAssetRepository,
	type PersistenceAsset,
} from '@foundry/domain'
import type { DocumentData, Firestore, Query } from 'firebase-admin/firestore'
import { Collections } from '../lib/firebase'

/**
 * Firestore implementation of IAssetRepository
 */
export class FirestoreAssetRepository implements IAssetRepository {
	private readonly collection

	constructor(private readonly firestore: Firestore) {
		this.collection = this.firestore.collection(Collections.ASSETS)
	}

	/**
	 * Convert domain Asset to Firestore document data
	 */
	private toFirestore(asset: Asset): PersistenceAsset {
		return AssetMapper.toPersistence(asset)
	}

	/**
	 * Convert Firestore document to domain Asset
	 */
	private toDomain(data: PersistenceAsset): Asset {
		// Handle Firestore Timestamp conversion
		const toDate = (value: unknown): Date | null => {
			if (!value) return null
			if (value instanceof Date) return value
			if (typeof value === 'object' && value !== null && 'toDate' in value) {
				return (value as { toDate: () => Date }).toDate()
			}
			return null
		}

		return AssetMapper.toDomain({
			...data,
			createdAt: toDate(data.createdAt) ?? new Date(),
			updatedAt: toDate(data.updatedAt) ?? new Date(),
			deletedAt: toDate(data.deletedAt),
		})
	}

	/**
	 * Apply filters to a Firestore query
	 */
	private applyFilters(filters?: AssetQueryFilters): Query<DocumentData, DocumentData> {
		let query: Query<DocumentData, DocumentData> = this.collection

		if (filters) {
			if (filters.storeId) {
				query = query.where('storeId', '==', filters.storeId)
			}
			if (filters.category) {
				query = query.where('category', '==', filters.category)
			}
			if (filters.type) {
				query = query.where('type', '==', filters.type)
			}
			if (filters.status) {
				query = query.where('status', '==', filters.status)
			}
			if (filters.uploadedBy) {
				query = query.where('uploadedBy', '==', filters.uploadedBy)
			}
			if (filters.modelId) {
				query = query.where('metadata.modelId', '==', filters.modelId)
			}
			if (filters.generationId) {
				query = query.where('metadata.generationId', '==', filters.generationId)
			}
			if (!filters.includeDeleted) {
				query = query.where('deletedAt', '==', null)
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

	async create(asset: Asset): Promise<string> {
		const data = this.toFirestore(asset)
		await this.collection.doc(data.id).set(data)
		return data.id
	}

	async save(id: string, asset: Asset): Promise<void> {
		const data = this.toFirestore(asset)
		await this.collection.doc(id).set(data)
	}

	async update(asset: Asset): Promise<void> {
		const data = this.toFirestore(asset)
		await this.collection.doc(data.id).update(data as unknown as Record<string, unknown>)
	}

	async remove(id: string): Promise<void> {
		await this.collection.doc(id).delete()
	}

	async findById(id: string): Promise<Asset | null> {
		const doc = await this.collection.doc(id).get()
		if (!doc.exists) {
			return null
		}
		return this.toDomain(doc.data() as PersistenceAsset)
	}

	async findMany(filters?: AssetQueryFilters): Promise<Asset[]> {
		const query = this.applyFilters(filters)
		const snapshot = await query.get()
		return snapshot.docs.map((doc) => this.toDomain(doc.data() as PersistenceAsset))
	}

	async findOne(filters: AssetQueryFilters): Promise<Asset | null> {
		const results = await this.findMany({ ...filters, limit: 1 })
		return results[0] ?? null
	}

	async count(filters?: AssetQueryFilters): Promise<number> {
		const query = this.applyFilters(filters)
		const snapshot = await query.count().get()
		return snapshot.data().count
	}

	async exists(id: string): Promise<boolean> {
		const doc = await this.collection.doc(id).get()
		return doc.exists
	}

	async findByStoreId(storeId: string, filters?: Omit<AssetQueryFilters, 'storeId'>): Promise<Asset[]> {
		return this.findMany({ ...filters, storeId })
	}

	async findByCategory(storeId: string, category: AssetCategory): Promise<Asset[]> {
		return this.findMany({ storeId, category })
	}

	async findByModelId(modelId: string): Promise<Asset[]> {
		return this.findMany({ modelId })
	}

	async findByGenerationId(generationId: string): Promise<Asset[]> {
		return this.findMany({ generationId })
	}
}
