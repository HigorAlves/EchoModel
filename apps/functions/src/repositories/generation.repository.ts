/**
 * @fileoverview Firestore Generation Repository Implementation
 *
 * Implements IGenerationRepository interface using Firestore as the persistence layer.
 */

import {
	Generation,
	GenerationId,
	type GenerationQueryFilters,
	GenerationStatus,
	IdempotencyKey,
	type IGenerationRepository,
	type PersistenceGeneration,
	ScenePrompt,
} from '@foundry/domain'
import type { DocumentData, Firestore, Query } from 'firebase-admin/firestore'
import { Collections } from '../lib/firebase'

/**
 * Firestore implementation of IGenerationRepository
 */
export class FirestoreGenerationRepository implements IGenerationRepository {
	private readonly collection

	constructor(private readonly firestore: Firestore) {
		this.collection = this.firestore.collection(Collections.GENERATIONS)
	}

	/**
	 * Convert domain Generation to Firestore document data
	 */
	private toFirestore(generation: Generation): PersistenceGeneration {
		// Map fashion config override to persistence format
		const fashionConfigOverride = generation.fashionConfigOverride
			? {
					lightingPreset: generation.fashionConfigOverride.lightingPreset,
					cameraFraming: generation.fashionConfigOverride.cameraFraming,
					texturePreferences: generation.fashionConfigOverride.texturePreferences
						? [...generation.fashionConfigOverride.texturePreferences]
						: undefined,
				}
			: null

		return {
			id: generation.id.value,
			storeId: generation.storeId,
			modelId: generation.modelId,
			status: generation.status,
			idempotencyKey: generation.idempotencyKey.value,
			garmentAssetId: generation.garmentAssetId,
			scenePrompt: generation.scenePrompt.value,
			aspectRatios: [...generation.aspectRatios],
			imageCount: generation.imageCount,
			generatedImages: [...generation.generatedImages],
			startedAt: generation.startedAt,
			completedAt: generation.completedAt,
			failureReason: generation.failureReason,
			metadata: { ...generation.metadata },
			fashionConfigOverride,
			createdAt: generation.createdAt,
			updatedAt: generation.updatedAt,
		}
	}

	/**
	 * Convert Firestore document to domain Generation
	 */
	private toDomain(data: PersistenceGeneration): Generation {
		// Handle Firestore Timestamp conversion
		const toDate = (value: any): Date | null => {
			if (!value) return null
			return value instanceof Date ? value : value.toDate()
		}

		// Map persistence fashion config override to domain type
		const fashionConfigOverride = data.fashionConfigOverride
			? {
					lightingPreset: data.fashionConfigOverride.lightingPreset,
					cameraFraming: data.fashionConfigOverride.cameraFraming,
					texturePreferences: data.fashionConfigOverride.texturePreferences,
				}
			: null

		return Generation.create({
			id: GenerationId.create(data.id),
			storeId: data.storeId,
			modelId: data.modelId,
			status: data.status,
			idempotencyKey: IdempotencyKey.create(data.idempotencyKey),
			garmentAssetId: data.garmentAssetId,
			scenePrompt: ScenePrompt.create(data.scenePrompt),
			aspectRatios: data.aspectRatios,
			imageCount: data.imageCount,
			generatedImages: data.generatedImages.map((img) => ({
				...img,
				createdAt: toDate(img.createdAt) ?? new Date(),
			})),
			startedAt: toDate(data.startedAt),
			completedAt: toDate(data.completedAt),
			failureReason: data.failureReason,
			metadata: {
				...data.metadata,
				requestedAt: toDate(data.metadata.requestedAt) ?? undefined,
			},
			fashionConfigOverride,
			createdAt: toDate(data.createdAt) ?? new Date(),
			updatedAt: toDate(data.updatedAt) ?? new Date(),
		})
	}

	/**
	 * Apply filters to a Firestore query
	 */
	private applyFilters(filters?: GenerationQueryFilters): Query<DocumentData, DocumentData> {
		let query: Query<DocumentData, DocumentData> = this.collection

		if (filters) {
			if (filters.storeId) {
				query = query.where('storeId', '==', filters.storeId)
			}
			if (filters.modelId) {
				query = query.where('modelId', '==', filters.modelId)
			}
			if (filters.status) {
				query = query.where('status', '==', filters.status)
			}
			if (filters.idempotencyKey) {
				query = query.where('idempotencyKey', '==', filters.idempotencyKey)
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
			query = query.orderBy('createdAt', 'desc')
		}

		return query
	}

	async create(generation: Generation): Promise<string> {
		const data = this.toFirestore(generation)
		await this.collection.doc(data.id).set(data)
		return data.id
	}

	async save(id: string, generation: Generation): Promise<void> {
		const data = this.toFirestore(generation)
		await this.collection.doc(id).set(data)
	}

	async update(generation: Generation): Promise<void> {
		const data = this.toFirestore(generation)
		await this.collection.doc(data.id).update(data as unknown as Record<string, unknown>)
	}

	async findById(id: string): Promise<Generation | null> {
		const doc = await this.collection.doc(id).get()
		if (!doc.exists) {
			return null
		}
		return this.toDomain(doc.data() as PersistenceGeneration)
	}

	async findMany(filters?: GenerationQueryFilters): Promise<Generation[]> {
		const query = this.applyFilters(filters)
		const snapshot = await query.get()
		return snapshot.docs.map((doc) => this.toDomain(doc.data() as PersistenceGeneration))
	}

	async findOne(filters: GenerationQueryFilters): Promise<Generation | null> {
		const results = await this.findMany({ ...filters, limit: 1 })
		return results[0] ?? null
	}

	async count(filters?: GenerationQueryFilters): Promise<number> {
		const query = this.applyFilters(filters)
		const snapshot = await query.count().get()
		return snapshot.data().count
	}

	async exists(id: string): Promise<boolean> {
		const doc = await this.collection.doc(id).get()
		return doc.exists
	}

	async findByStoreId(storeId: string, filters?: Omit<GenerationQueryFilters, 'storeId'>): Promise<Generation[]> {
		return this.findMany({ ...filters, storeId })
	}

	async findByModelId(modelId: string, filters?: Omit<GenerationQueryFilters, 'modelId'>): Promise<Generation[]> {
		return this.findMany({ ...filters, modelId })
	}

	async findByIdempotencyKey(idempotencyKey: string): Promise<Generation | null> {
		return this.findOne({ idempotencyKey })
	}

	async findPending(limit = 10): Promise<Generation[]> {
		return this.findMany({ status: GenerationStatus.PENDING, limit })
	}
}
