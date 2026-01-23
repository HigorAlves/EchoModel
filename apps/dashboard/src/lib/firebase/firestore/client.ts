/**
 * @fileoverview Firestore Client
 *
 * Core Firestore initialization and shared utilities.
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
	setDoc,
	type Unsubscribe,
	updateDoc,
	where,
} from 'firebase/firestore'
import { app } from '../config'

// Initialize Firestore
export const db = getFirestore(app)

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
	ASSETS: 'assets',
} as const

// ==================== Helper Functions ====================

/**
 * Convert Firestore timestamp to Date
 */
export function toDate(value: unknown): Date | null {
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
export function convertDocument<T>(id: string, data: DocumentData): T {
	const result = { id, ...data } as Record<string, unknown>

	// Convert timestamp fields
	const timestampFields = ['createdAt', 'updatedAt', 'deletedAt', 'startedAt', 'completedAt']
	for (const field of timestampFields) {
		if (result[field]) {
			result[field] = toDate(result[field])
		}
	}

	return result as T
}

// Re-export Firestore utilities for convenience
export {
	collection,
	doc,
	getDoc,
	limit,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
	type DocumentData,
	type QueryConstraint,
	type Unsubscribe,
}
