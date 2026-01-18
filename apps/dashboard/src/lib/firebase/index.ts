export {
	type AuthResult,
	signInWithEmail,
	signInWithGoogle,
	signOut,
	signUpWithEmail,
	subscribeToAuthState,
} from './auth'
export { getFirebaseApp, getFirebaseAuth, app } from './config'

// Cloud Functions
export {
	functions,
	createModel,
	startCalibration,
	approveCalibration,
	rejectCalibration,
	createGeneration,
	processGeneration,
	requestUploadUrl,
	confirmUpload,
	getDownloadUrl,
	deleteAsset,
	createStore,
	getMyStores,
	getStore,
	updateStoreSettings,
	type CreateModelInput,
	type CreateModelResult,
	type StartCalibrationInput,
	type StartCalibrationResult,
	type CreateGenerationInput,
	type CreateGenerationResult,
	type RequestUploadUrlInput,
	type RequestUploadUrlResult,
	type CreateStoreInput,
	type CreateStoreResult,
} from './functions'

// Firestore
export {
	db,
	Collections,
	subscribeToModels,
	subscribeToGenerations,
	subscribeToAssets,
	subscribeToStores,
	getModel,
	getGeneration,
	getAsset,
	getStoreById,
	type ModelDocument,
	type GenerationDocument,
	type AssetDocument,
	type StoreDocument,
} from './firestore'
