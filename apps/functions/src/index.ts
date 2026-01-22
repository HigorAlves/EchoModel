/**
 * @fileoverview Firebase Cloud Functions for EchoModel
 *
 * This module exports all Cloud Functions for the EchoModel platform.
 * Functions are organized by bounded context:
 * - Models: AI influencer creation and calibration
 * - Generations: Image generation requests
 * - Assets: File upload and management
 * - Stores: Multi-tenant store management
 *
 * @see https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from 'firebase-functions'

// Set global options for all functions
// maxInstances helps control costs by limiting concurrent function executions
setGlobalOptions({ maxInstances: 10 })

// ==================== Asset Functions ====================
// Handle file uploads and asset management
export {
	confirmUpload,
	deleteAsset,
	getDownloadUrl,
	onAssetUploaded,
	requestUploadUrl,
} from './handlers/assets'

// ==================== Generation Functions ====================
// Handle image generation requests and processing
export {
	createGeneration,
	handleGenerationCallback,
	processGeneration,
	processGenerationPubSub,
} from './handlers/generations'
// ==================== Model Functions ====================
// Handle AI influencer creation and calibration workflow
export {
	approveCalibration,
	createModel,
	rejectCalibration,
	startCalibration,
} from './handlers/models'
// ==================== Queue Functions ====================
// Handle rate-limited queue processing and retries
export {
	cleanupExpiredGenerations,
	processScheduledRetries,
} from './handlers/queue'

// ==================== Store Functions ====================
// Handle multi-tenant store management
export {
	createStore,
	getMyStores,
	getStore,
	updateStoreSettings,
} from './handlers/stores'

// ==================== Auth Functions ====================
// Handle Firebase Authentication events
export { onUserCreated } from './handlers/auth'
