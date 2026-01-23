/**
 * @fileoverview Firestore Module
 *
 * Re-exports all Firestore types and functions organized by bounded context.
 */

// Core client and utilities
export { Collections, db } from './client'

// Model bounded context
export type {
	BackgroundType,
	CameraFraming,
	CreateModelInput,
	CustomCameraSettings,
	CustomLightingSettings,
	Expression,
	LightingPreset,
	ModelCameraConfig,
	ModelDocument,
	ModelLightingConfig,
	PoseStyle,
	PostProcessingStyle,
	ProductCategory,
} from './models'
export { createModel, getModel, subscribeToModels } from './models'

// Asset bounded context
export type { AssetDocument } from './assets'
export { getAsset, subscribeToAssets } from './assets'

// Store bounded context
export type { CreateStoreInput, StoreDocument } from './stores'
export {
	createStore,
	getStoreById,
	subscribeToStore,
	subscribeToStores,
	updateStoreInfo,
	updateStoreSettings,
} from './stores'
