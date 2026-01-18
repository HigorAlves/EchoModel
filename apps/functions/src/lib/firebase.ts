/**
 * @fileoverview Firebase Admin SDK initialization
 *
 * Initializes and exports Firebase Admin services for use in Cloud Functions.
 */

import { initializeApp, getApps, getApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

// Initialize Firebase Admin (only once)
const app = getApps().length === 0 ? initializeApp() : getApp()

// Export initialized services
export const db = getFirestore(app)
export const storage = getStorage(app)

// Collection names
export const Collections = {
	STORES: 'stores',
	MODELS: 'models',
	GENERATIONS: 'generations',
	ASSETS: 'assets',
	USERS: 'users',
} as const

// Storage bucket paths
export const StoragePaths = {
	getAssetPath: (storeId: string, category: string, assetId: string, filename: string) =>
		`${storeId}/${category}/${assetId}/${filename}`,
	getModelReferencePath: (storeId: string, assetId: string, filename: string) =>
		`${storeId}/model-references/${assetId}/${filename}`,
	getGarmentPath: (storeId: string, assetId: string, filename: string) =>
		`${storeId}/garments/${assetId}/${filename}`,
	getGeneratedPath: (storeId: string, assetId: string, filename: string) =>
		`${storeId}/generated/${assetId}/${filename}`,
	getCalibrationPath: (storeId: string, assetId: string, filename: string) =>
		`${storeId}/calibrations/${assetId}/${filename}`,
} as const
