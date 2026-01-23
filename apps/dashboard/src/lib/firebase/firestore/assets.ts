/**
 * @fileoverview Asset Firestore Operations
 *
 * Types and functions for the Asset bounded context.
 */

import {
	Collections,
	collection,
	convertDocument,
	db,
	doc,
	getDoc,
	limit,
	onSnapshot,
	orderBy,
	type QueryConstraint,
	query,
	type Unsubscribe,
	where,
} from './client'

// ==================== Asset Document Type ====================

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

// ==================== Query Functions ====================

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
