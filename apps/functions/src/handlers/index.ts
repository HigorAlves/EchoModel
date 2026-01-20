/**
 * @fileoverview Handler Exports
 *
 * Exports all Cloud Function handlers.
 */

// Asset handlers
export {
	confirmUpload,
	deleteAsset,
	getDownloadUrl,
	onAssetUploaded,
	requestUploadUrl,
} from './assets'

// Generation handlers
export {
	createGeneration,
	handleGenerationCallback,
	processGeneration,
	processGenerationPubSub,
} from './generations'
// Model handlers
export {
	approveCalibration,
	createModel,
	rejectCalibration,
	startCalibration,
} from './models'

// Store handlers
export {
	createStore,
	getMyStores,
	getStore,
	updateStoreSettings,
} from './stores'
