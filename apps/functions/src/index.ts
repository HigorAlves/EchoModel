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

// ==================== Model Functions ====================
// Handle AI influencer creation and calibration workflow
export {
	createModel,
	startCalibration,
	approveCalibration,
	rejectCalibration,
} from './handlers/models'

// ==================== Generation Functions ====================
// Handle image generation requests and processing
export {
	createGeneration,
	processGeneration,
	handleGenerationCallback,
	processGenerationPubSub,
} from './handlers/generations'

// ==================== Asset Functions ====================
// Handle file uploads and asset management
export {
	requestUploadUrl,
	confirmUpload,
	getDownloadUrl,
	deleteAsset,
	onAssetUploaded,
} from './handlers/assets'

// ==================== Store Functions ====================
// Handle multi-tenant store management
export {
	createStore,
	getMyStores,
	getStore,
	updateStoreSettings,
} from './handlers/stores'
