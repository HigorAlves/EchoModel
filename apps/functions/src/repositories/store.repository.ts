/**
 * @fileoverview Firestore Store Repository Implementation
 *
 * Implements IStoreRepository interface using Firestore as the persistence layer.
 */

import {
	AspectRatio,
	DefaultStyle,
	type IStoreRepository,
	type PersistenceStore,
	Store,
	StoreDescription,
	StoreId,
	StoreName,
	type StoreQueryFilters,
	type StoreStatus,
} from '@foundry/domain'
import type { DocumentData, Firestore, Query } from 'firebase-admin/firestore'
import { Collections } from '../lib/firebase'

/**
 * Firestore implementation of IStoreRepository
 */
export class FirestoreStoreRepository implements IStoreRepository {
	private readonly collection

	constructor(private readonly firestore: Firestore) {
		this.collection = this.firestore.collection(Collections.STORES)
	}

	/**
	 * Convert domain Store to Firestore document data
	 */
	private toFirestore(store: Store): PersistenceStore {
		return {
			id: store.id.value,
			ownerId: store.ownerId,
			name: store.name.value,
			description: store.description?.value ?? null,
			defaultStyle: store.defaultStyle?.value ?? null,
			logoAssetId: store.logoAssetId,
			status: store.status,
			settings: { ...store.settings },
			createdAt: store.createdAt,
			updatedAt: store.updatedAt,
			deletedAt: store.deletedAt,
		}
	}

	/**
	 * Convert Firestore document to domain Store
	 */
	private toDomain(data: PersistenceStore): Store {
		// Handle Firestore Timestamp conversion
		const toDate = (value: any): Date | null => {
			if (!value) return null
			return value instanceof Date ? value : value.toDate()
		}

		return Store.create({
			id: StoreId.create(data.id),
			ownerId: data.ownerId,
			name: StoreName.create(data.name),
			description: data.description ? StoreDescription.create(data.description) : null,
			defaultStyle: data.defaultStyle ? DefaultStyle.create(data.defaultStyle) : null,
			logoAssetId: data.logoAssetId,
			status: data.status,
			settings: {
				defaultAspectRatio: data.settings?.defaultAspectRatio ?? AspectRatio.PORTRAIT_4_5,
				defaultImageCount: data.settings?.defaultImageCount ?? 4,
				watermarkEnabled: data.settings?.watermarkEnabled ?? false,
			},
			createdAt: toDate(data.createdAt) ?? new Date(),
			updatedAt: toDate(data.updatedAt) ?? new Date(),
			deletedAt: toDate(data.deletedAt),
		})
	}

	/**
	 * Apply filters to a Firestore query
	 */
	private applyFilters(filters?: StoreQueryFilters): Query<DocumentData, DocumentData> {
		let query: Query<DocumentData, DocumentData> = this.collection

		if (filters) {
			if (filters.ownerId) {
				query = query.where('ownerId', '==', filters.ownerId)
			}
			if (filters.status) {
				query = query.where('status', '==', filters.status)
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

	async create(store: Store): Promise<string> {
		const data = this.toFirestore(store)
		await this.collection.doc(data.id).set(data)
		return data.id
	}

	async save(id: string, store: Store): Promise<void> {
		const data = this.toFirestore(store)
		await this.collection.doc(id).set(data)
	}

	async update(store: Store): Promise<void> {
		const data = this.toFirestore(store)
		await this.collection.doc(data.id).update(data as unknown as Record<string, unknown>)
	}

	async remove(id: string): Promise<void> {
		await this.collection.doc(id).delete()
	}

	async findById(id: string): Promise<Store | null> {
		const doc = await this.collection.doc(id).get()
		if (!doc.exists) {
			return null
		}
		return this.toDomain(doc.data() as PersistenceStore)
	}

	async findMany(filters?: StoreQueryFilters): Promise<Store[]> {
		const query = this.applyFilters(filters)
		const snapshot = await query.get()
		return snapshot.docs.map((doc) => this.toDomain(doc.data() as PersistenceStore))
	}

	async findOne(filters: StoreQueryFilters): Promise<Store | null> {
		const results = await this.findMany({ ...filters, limit: 1 })
		return results[0] ?? null
	}

	async count(filters?: StoreQueryFilters): Promise<number> {
		const query = this.applyFilters(filters)
		const snapshot = await query.count().get()
		return snapshot.data().count
	}

	async exists(id: string): Promise<boolean> {
		const doc = await this.collection.doc(id).get()
		return doc.exists
	}

	async findByOwnerId(ownerId: string): Promise<Store[]> {
		return this.findMany({ ownerId })
	}

	async findByStatus(status: StoreStatus): Promise<Store[]> {
		return this.findMany({ status })
	}
}
