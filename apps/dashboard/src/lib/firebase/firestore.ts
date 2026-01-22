/**
 * @fileoverview Firestore Client
 *
 * Provides Firestore database access for real-time data fetching.
 */

import {
	collection,
	connectFirestoreEmulator,
	type DocumentData,
	doc,
	getDoc,
	getFirestore,
	limit,
	onSnapshot,
	orderBy,
	type QueryConstraint,
	query,
	serverTimestamp,
	type Unsubscribe,
	updateDoc,
	where,
} from 'firebase/firestore'
import { app } from './config'

// Initialize Firestore
const db = getFirestore(app)

// Connect to emulator in development
if (
	typeof window !== 'undefined' &&
	(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_EMULATOR === 'true')
) {
	try {
		connectFirestoreEmulator(db, 'localhost', 8080)
	} catch {
		// Emulator might already be connected
	}
}

// Collection names
export const Collections = {
	STORES: 'stores',
	MODELS: 'models',
	GENERATIONS: 'generations',
	ASSETS: 'assets',
} as const

// ==================== Type Definitions ====================

export interface ModelDocument {
	id: string
	storeId: string
	name: string
	description: string | null
	status: 'DRAFT' | 'CALIBRATING' | 'ACTIVE' | 'FAILED' | 'ARCHIVED'
	gender: 'FEMALE' | 'MALE' | 'NON_BINARY'
	ageRange: 'YOUNG_ADULT' | 'ADULT' | 'MIDDLE_AGED' | 'MATURE'
	ethnicity: string
	bodyType: string
	prompt: string | null
	referenceImages: string[]
	calibrationImages: string[]
	lockedIdentityUrl: string | null
	failureReason: string | null
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export interface GenerationDocument {
	id: string
	storeId: string
	modelId: string
	status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
	idempotencyKey: string
	garmentAssetId: string
	scenePrompt: string
	aspectRatios: string[]
	imageCount: number
	generatedImages: Array<{
		id: string
		assetId: string
		aspectRatio: string
		url: string | null
		thumbnailUrl: string | null
		createdAt: Date
	}>
	startedAt: Date | null
	completedAt: Date | null
	failureReason: string | null
	metadata: {
		processingTimeMs?: number
		aiModelVersion?: string
		requestedAt?: Date
	}
	createdAt: Date
	updatedAt: Date
}

export interface AssetDocument {
	id: string
	storeId: string
	type: 'IMAGE'
	category: 'MODEL_REFERENCE' | 'GARMENT' | 'GENERATED' | 'CALIBRATION' | 'STORE_LOGO'
	filename: string
	mimeType: string
	sizeBytes: number
	storagePath: string
	cdnUrl: string | null
	thumbnailUrl: string | null
	metadata: Record<string, unknown>
	uploadedBy: string
	status: 'PENDING_UPLOAD' | 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED'
	failureReason: string | null
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export interface StoreDocument {
	id: string
	ownerId: string
	name: string
	description: string | null
	defaultStyle: string | null
	logoAssetId: string | null
	status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
	settings: {
		defaultAspectRatio: string
		defaultImageCount: number
		watermarkEnabled: boolean
	}
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

// ==================== Helper Functions ====================

/**
 * Convert Firestore timestamp to Date
 */
function toDate(value: unknown): Date | null {
	if (!value) return null
	if (value instanceof Date) return value
	if (typeof value === 'object' && 'toDate' in value && typeof (value as any).toDate === 'function') {
		return (value as any).toDate()
	}
	return null
}

/**
 * Convert document data to typed document
 */
function convertDocument<T>(id: string, data: DocumentData): T {
	const result = { id, ...data } as Record<string, unknown>

	// Convert timestamp fields
	const timestampFields = ['createdAt', 'updatedAt', 'deletedAt', 'startedAt', 'completedAt']
	for (const field of timestampFields) {
		if (result[field]) {
			result[field] = toDate(result[field])
		}
	}

	// Handle nested arrays with timestamps
	if (result.generatedImages && Array.isArray(result.generatedImages)) {
		result.generatedImages = (result.generatedImages as any[]).map((img) => ({
			...img,
			createdAt: toDate(img.createdAt),
		}))
	}

	// Handle metadata with timestamps
	if (result.metadata && typeof result.metadata === 'object') {
		const metadata = result.metadata as Record<string, unknown>
		if (metadata.requestedAt) {
			metadata.requestedAt = toDate(metadata.requestedAt)
		}
	}

	return result as T
}

// ==================== Query Functions ====================

/**
 * Subscribe to models for a store
 */
export function subscribeToModels(
	storeId: string,
	callback: (models: ModelDocument[]) => void,
	options?: {
		includeArchived?: boolean
		includeDeleted?: boolean
		status?: ModelDocument['status']
		limitCount?: number
	},
): Unsubscribe {
	const constraints: QueryConstraint[] = [where('storeId', '==', storeId)]

	if (!options?.includeDeleted) {
		constraints.push(where('deletedAt', '==', null))
	}

	if (!options?.includeArchived) {
		constraints.push(where('status', '!=', 'ARCHIVED'))
	}

	if (options?.status) {
		constraints.push(where('status', '==', options.status))
	}

	constraints.push(orderBy('createdAt', 'desc'))

	if (options?.limitCount) {
		constraints.push(limit(options.limitCount))
	}

	const q = query(collection(db, Collections.MODELS), ...constraints)

	return onSnapshot(q, (snapshot) => {
		const models = snapshot.docs.map((doc) => convertDocument<ModelDocument>(doc.id, doc.data()))
		callback(models)
	})
}

/**
 * Get a single model by ID
 */
export async function getModel(modelId: string): Promise<ModelDocument | null> {
	const docRef = doc(db, Collections.MODELS, modelId)
	const snapshot = await getDoc(docRef)

	if (!snapshot.exists()) {
		return null
	}

	return convertDocument<ModelDocument>(snapshot.id, snapshot.data())
}

/**
 * Subscribe to generations for a store
 */
export function subscribeToGenerations(
	storeId: string,
	callback: (generations: GenerationDocument[]) => void,
	options?: {
		modelId?: string
		status?: GenerationDocument['status']
		limitCount?: number
	},
): Unsubscribe {
	const constraints: QueryConstraint[] = [where('storeId', '==', storeId)]

	if (options?.modelId) {
		constraints.push(where('modelId', '==', options.modelId))
	}

	if (options?.status) {
		constraints.push(where('status', '==', options.status))
	}

	constraints.push(orderBy('createdAt', 'desc'))

	if (options?.limitCount) {
		constraints.push(limit(options.limitCount))
	}

	const q = query(collection(db, Collections.GENERATIONS), ...constraints)

	return onSnapshot(q, (snapshot) => {
		const generations = snapshot.docs.map((doc) => convertDocument<GenerationDocument>(doc.id, doc.data()))
		callback(generations)
	})
}

/**
 * Get a single generation by ID
 */
export async function getGeneration(generationId: string): Promise<GenerationDocument | null> {
	const docRef = doc(db, Collections.GENERATIONS, generationId)
	const snapshot = await getDoc(docRef)

	if (!snapshot.exists()) {
		return null
	}

	return convertDocument<GenerationDocument>(snapshot.id, snapshot.data())
}

/**
 * Subscribe to assets for a store
 */
export function subscribeToAssets(
	storeId: string,
	callback: (assets: AssetDocument[]) => void,
	options?: {
		category?: AssetDocument['category']
		status?: AssetDocument['status']
		includeDeleted?: boolean
		limitCount?: number
	},
): Unsubscribe {
	const constraints: QueryConstraint[] = [where('storeId', '==', storeId)]

	if (!options?.includeDeleted) {
		constraints.push(where('deletedAt', '==', null))
	}

	if (options?.category) {
		constraints.push(where('category', '==', options.category))
	}

	if (options?.status) {
		constraints.push(where('status', '==', options.status))
	}

	constraints.push(orderBy('createdAt', 'desc'))

	if (options?.limitCount) {
		constraints.push(limit(options.limitCount))
	}

	const q = query(collection(db, Collections.ASSETS), ...constraints)

	return onSnapshot(q, (snapshot) => {
		const assets = snapshot.docs.map((doc) => convertDocument<AssetDocument>(doc.id, doc.data()))
		callback(assets)
	})
}

/**
 * Get a single asset by ID
 */
export async function getAsset(assetId: string): Promise<AssetDocument | null> {
	const docRef = doc(db, Collections.ASSETS, assetId)
	const snapshot = await getDoc(docRef)

	if (!snapshot.exists()) {
		return null
	}

	return convertDocument<AssetDocument>(snapshot.id, snapshot.data())
}

/**
 * Subscribe to stores for a user
 */
export function subscribeToStores(ownerId: string, callback: (stores: StoreDocument[]) => void): Unsubscribe {
	const q = query(
		collection(db, Collections.STORES),
		where('ownerId', '==', ownerId),
		where('deletedAt', '==', null),
		orderBy('createdAt', 'desc'),
	)

	return onSnapshot(q, (snapshot) => {
		const stores = snapshot.docs.map((doc) => convertDocument<StoreDocument>(doc.id, doc.data()))
		callback(stores)
	})
}

/**
 * Get a single store by ID
 */
export async function getStoreById(storeId: string): Promise<StoreDocument | null> {
	const docRef = doc(db, Collections.STORES, storeId)
	const snapshot = await getDoc(docRef)

	if (!snapshot.exists()) {
		return null
	}

	return convertDocument<StoreDocument>(snapshot.id, snapshot.data())
}

/**
 * Subscribe to a single store for real-time updates
 */
export function subscribeToStore(storeId: string, callback: (store: StoreDocument | null) => void): Unsubscribe {
	const docRef = doc(db, Collections.STORES, storeId)

	return onSnapshot(docRef, (snapshot) => {
		if (!snapshot.exists()) {
			callback(null)
			return
		}
		callback(convertDocument<StoreDocument>(snapshot.id, snapshot.data()))
	})
}

// ==================== Write Functions ====================

/**
 * Update store basic information
 */
export async function updateStoreInfo(
	storeId: string,
	data: {
		name?: string
		description?: string | null
		defaultStyle?: string | null
	},
): Promise<void> {
	const docRef = doc(db, Collections.STORES, storeId)
	await updateDoc(docRef, {
		...data,
		updatedAt: serverTimestamp(),
	})
}

/**
 * Update store settings
 */
export async function updateStoreSettingsFirestore(
	storeId: string,
	settings: {
		defaultAspectRatio?: string
		defaultImageCount?: number
		watermarkEnabled?: boolean
	},
): Promise<void> {
	const docRef = doc(db, Collections.STORES, storeId)

	// Build the update object with dot notation for nested fields
	const updates: Record<string, unknown> = {
		updatedAt: serverTimestamp(),
	}

	if (settings.defaultAspectRatio !== undefined) {
		updates['settings.defaultAspectRatio'] = settings.defaultAspectRatio
	}
	if (settings.defaultImageCount !== undefined) {
		updates['settings.defaultImageCount'] = settings.defaultImageCount
	}
	if (settings.watermarkEnabled !== undefined) {
		updates['settings.watermarkEnabled'] = settings.watermarkEnabled
	}

	await updateDoc(docRef, updates)
}

export { db }
