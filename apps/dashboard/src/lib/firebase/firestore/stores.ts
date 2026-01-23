/**
 * @fileoverview Store Firestore Operations
 *
 * Types and functions for the Store bounded context.
 */

import {
	Collections,
	collection,
	convertDocument,
	db,
	doc,
	getDoc,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	type Unsubscribe,
	updateDoc,
	where,
} from './client'

// ==================== Store Document Type ====================

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

// ==================== Create Store Types ====================

export interface CreateStoreInput {
	name: string
	description?: string
	defaultStyle?: string
	ownerId: string
}

// ==================== Query Functions ====================

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
 * Create a new store
 */
export async function createStore(input: CreateStoreInput): Promise<{ storeId: string }> {
	const storeId = crypto.randomUUID()
	const now = new Date()

	const storeData: Record<string, unknown> = {
		id: storeId,
		ownerId: input.ownerId,
		name: input.name,
		description: input.description ?? null,
		defaultStyle: input.defaultStyle ?? null,
		logoAssetId: null,
		status: 'ACTIVE',
		settings: {
			defaultAspectRatio: '1:1',
			defaultImageCount: 4,
			watermarkEnabled: false,
		},
		createdAt: now,
		updatedAt: now,
		deletedAt: null,
	}

	const docRef = doc(db, Collections.STORES, storeId)
	await setDoc(docRef, storeData)

	return { storeId }
}

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
export async function updateStoreSettings(
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
