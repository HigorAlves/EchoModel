/**
 * @fileoverview Firestore User Repository Implementation
 *
 * Implements IUserRepository interface using Firestore as the persistence layer.
 */

import {
	ExternalId,
	FullName,
	type IUserRepository,
	Locale,
	type PersistenceUser,
	User,
	UserId,
	type UserQueryFilters,
	type UserStatus,
} from '@foundry/domain'
import type { DocumentData, Firestore, Query } from 'firebase-admin/firestore'
import { Collections } from '../lib/firebase'

/**
 * Firestore implementation of IUserRepository
 */
export class FirestoreUserRepository implements IUserRepository {
	private readonly collection

	constructor(private readonly firestore: Firestore) {
		this.collection = this.firestore.collection(Collections.USERS)
	}

	/**
	 * Convert domain User to Firestore document data
	 */
	private toFirestore(user: User): PersistenceUser {
		return {
			id: user.id.value,
			fullName: user.fullName.value,
			locale: user.locale.value,
			status: user.status,
			externalId: user.externalId?.value ?? null,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			deletedAt: user.deletedAt,
		}
	}

	/**
	 * Convert Firestore document to domain User
	 */
	private toDomain(data: PersistenceUser): User {
		// Handle Firestore Timestamp conversion
		const toDate = (value: unknown): Date | null => {
			if (!value) return null
			if (value instanceof Date) return value
			if (typeof value === 'object' && value !== null && 'toDate' in value) {
				return (value as { toDate: () => Date }).toDate()
			}
			return null
		}

		return User.create({
			id: UserId.create(data.id),
			fullName: FullName.create(data.fullName),
			locale: Locale.create(data.locale),
			status: data.status,
			externalId: data.externalId ? ExternalId.create(data.externalId) : null,
			createdAt: toDate(data.createdAt) ?? new Date(),
			updatedAt: toDate(data.updatedAt) ?? new Date(),
			deletedAt: toDate(data.deletedAt),
		})
	}

	/**
	 * Apply filters to a Firestore query
	 */
	private applyFilters(filters?: UserQueryFilters): Query<DocumentData, DocumentData> {
		let query: Query<DocumentData, DocumentData> = this.collection

		if (filters) {
			if (filters.fullName) {
				query = query.where('fullName', '==', filters.fullName)
			}
			if (filters.status) {
				query = query.where('status', '==', filters.status)
			}
			if (filters.locale) {
				query = query.where('locale', '==', filters.locale)
			}
			if (filters.externalId) {
				query = query.where('externalId', '==', filters.externalId)
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

	async create(user: User): Promise<string> {
		const data = this.toFirestore(user)
		await this.collection.doc(data.id).set(data)
		return data.id
	}

	async save(id: string, user: User): Promise<void> {
		const data = this.toFirestore(user)
		await this.collection.doc(id).set(data)
	}

	async update(user: User): Promise<void> {
		const data = this.toFirestore(user)
		await this.collection.doc(data.id).update(data as unknown as Record<string, unknown>)
	}

	async remove(id: string): Promise<void> {
		await this.collection.doc(id).delete()
	}

	async findById(id: string): Promise<User | null> {
		const doc = await this.collection.doc(id).get()
		if (!doc.exists) {
			return null
		}
		return this.toDomain(doc.data() as PersistenceUser)
	}

	async findMany(filters?: UserQueryFilters): Promise<User[]> {
		const query = this.applyFilters(filters)
		const snapshot = await query.get()
		return snapshot.docs.map((doc) => this.toDomain(doc.data() as PersistenceUser))
	}

	async findOne(filters: UserQueryFilters): Promise<User | null> {
		const results = await this.findMany({ ...filters, limit: 1 })
		return results[0] ?? null
	}

	async count(filters?: UserQueryFilters): Promise<number> {
		const query = this.applyFilters(filters)
		const snapshot = await query.count().get()
		return snapshot.data().count
	}

	async exists(id: string): Promise<boolean> {
		const doc = await this.collection.doc(id).get()
		return doc.exists
	}

	async findByStatus(status: UserStatus): Promise<User[]> {
		return this.findMany({ status })
	}

	async findByExternalId(externalId: string): Promise<User | null> {
		return this.findOne({ externalId })
	}
}
