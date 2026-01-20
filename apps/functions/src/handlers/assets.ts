/**
 * @fileoverview Asset Cloud Function Handlers
 *
 * Handles asset upload, management, and lifecycle operations.
 */

import { Asset, AssetStatus } from '@foundry/domain'
import * as logger from 'firebase-functions/logger'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { onObjectFinalized } from 'firebase-functions/v2/storage'
import { db, storage } from '../lib/firebase'
import { FirestoreAssetRepository } from '../repositories'
import { FirebaseStorageService } from '../services'
import {
	type ConfirmUploadInput,
	ConfirmUploadInputSchema,
	type RequestUploadUrlInput,
	RequestUploadUrlInputSchema,
} from './schemas'

// Initialize repositories and services
const assetRepository = new FirestoreAssetRepository(db)
const storageService = new FirebaseStorageService(storage)

/**
 * Request a signed upload URL for an asset
 */
export const requestUploadUrl = onCall<RequestUploadUrlInput>(
	{ maxInstances: 20, timeoutSeconds: 30 },
	async (request) => {
		logger.info('requestUploadUrl called', { data: request.data })

		const userId = request.auth?.uid
		if (!userId) {
			throw new HttpsError('unauthenticated', 'Authentication required')
		}

		const parseResult = RequestUploadUrlInputSchema.safeParse(request.data)
		if (!parseResult.success) {
			logger.warn('Invalid input', { errors: parseResult.error.errors })
			throw new HttpsError('invalid-argument', parseResult.error?.errors[0]?.message ?? 'Invalid input')
		}

		const input = parseResult.data

		try {
			// Create the asset record in PENDING_UPLOAD state
			const asset = Asset.requestUpload({
				storeId: input.storeId,
				category: input.category,
				filename: input.filename,
				mimeType: input.mimeType,
				sizeBytes: input.sizeBytes,
				uploadedBy: input.uploadedBy,
				metadata: input.metadata,
			})

			// Generate signed upload URL
			const uploadResult = await storageService.generateUploadUrl(
				asset.storagePath.value,
				input.mimeType,
				900, // 15 minutes
			)

			// Save the asset
			const assetId = await assetRepository.create(asset)

			logger.info('Upload URL generated', {
				assetId,
				storagePath: asset.storagePath.value,
				expiresAt: uploadResult.expiresAt,
			})

			return {
				success: true,
				assetId,
				uploadUrl: uploadResult.uploadUrl,
				headers: uploadResult.headers,
				expiresAt: uploadResult.expiresAt.toISOString(),
				storagePath: asset.storagePath.value,
			}
		} catch (error) {
			logger.error('Failed to generate upload URL', { error })
			throw new HttpsError('internal', 'Failed to generate upload URL')
		}
	},
)

/**
 * Confirm that an upload has been completed
 */
export const confirmUpload = onCall<ConfirmUploadInput>({ maxInstances: 20, timeoutSeconds: 30 }, async (request) => {
	logger.info('confirmUpload called', { data: request.data })

	const userId = request.auth?.uid
	if (!userId) {
		throw new HttpsError('unauthenticated', 'Authentication required')
	}

	const parseResult = ConfirmUploadInputSchema.safeParse(request.data)
	if (!parseResult.success) {
		throw new HttpsError('invalid-argument', parseResult.error?.errors[0]?.message ?? 'Invalid input')
	}

	const { assetId, storeId } = parseResult.data

	try {
		const asset = await assetRepository.findById(assetId)
		if (!asset) {
			throw new HttpsError('not-found', 'Asset not found')
		}

		if (asset.storeId !== storeId) {
			throw new HttpsError('permission-denied', 'Asset does not belong to this store')
		}

		if (asset.status !== AssetStatus.PENDING_UPLOAD) {
			throw new HttpsError('failed-precondition', 'Asset is not pending upload')
		}

		// Verify the file exists in storage
		const fileExists = await storageService.fileExists(asset.storagePath.value)
		if (!fileExists) {
			logger.warn('File not found in storage', {
				assetId,
				storagePath: asset.storagePath.value,
			})
			throw new HttpsError('failed-precondition', 'File not found in storage')
		}

		// Get file metadata and CDN URL
		const fileMetadata = await storageService.getFileMetadata(asset.storagePath.value)
		const cdnUrl = await storageService.getCdnUrl(asset.storagePath.value)

		// Mark as ready (skipping processing for now)
		const readyAsset = asset.confirmUpload().markReady(cdnUrl ?? undefined)
		await assetRepository.update(readyAsset)

		logger.info('Upload confirmed', {
			assetId,
			cdnUrl,
			sizeBytes: fileMetadata?.sizeBytes,
		})

		return {
			success: true,
			assetId,
			status: readyAsset.status,
			cdnUrl,
		}
	} catch (error) {
		logger.error('Failed to confirm upload', { error, assetId })

		if (error instanceof HttpsError) {
			throw error
		}

		throw new HttpsError('internal', 'Failed to confirm upload')
	}
})

/**
 * Get a download URL for an asset
 */
export const getDownloadUrl = onCall<{ assetId: string; storeId: string }>(
	{ maxInstances: 20, timeoutSeconds: 10 },
	async (request) => {
		logger.info('getDownloadUrl called', { data: request.data })

		if (!request.auth?.uid) {
			throw new HttpsError('unauthenticated', 'Authentication required')
		}

		const { assetId, storeId } = request.data

		if (!assetId || !storeId) {
			throw new HttpsError('invalid-argument', 'Asset ID and Store ID are required')
		}

		try {
			const asset = await assetRepository.findById(assetId)
			if (!asset) {
				throw new HttpsError('not-found', 'Asset not found')
			}

			if (asset.storeId !== storeId) {
				throw new HttpsError('permission-denied', 'Asset does not belong to this store')
			}

			if (asset.status !== AssetStatus.READY) {
				throw new HttpsError('failed-precondition', 'Asset is not ready')
			}

			// Generate signed download URL
			const downloadUrl = await storageService.generateDownloadUrl(
				asset.storagePath.value,
				3600, // 1 hour
			)

			return {
				success: true,
				assetId,
				downloadUrl,
				expiresInSeconds: 3600,
			}
		} catch (error) {
			logger.error('Failed to get download URL', { error, assetId })

			if (error instanceof HttpsError) {
				throw error
			}

			throw new HttpsError('internal', 'Failed to get download URL')
		}
	},
)

/**
 * Delete an asset (soft delete)
 */
export const deleteAsset = onCall<{ assetId: string; storeId: string }>(
	{ maxInstances: 10, timeoutSeconds: 30 },
	async (request) => {
		logger.info('deleteAsset called', { data: request.data })

		if (!request.auth?.uid) {
			throw new HttpsError('unauthenticated', 'Authentication required')
		}

		const { assetId, storeId } = request.data

		if (!assetId || !storeId) {
			throw new HttpsError('invalid-argument', 'Asset ID and Store ID are required')
		}

		try {
			const asset = await assetRepository.findById(assetId)
			if (!asset) {
				throw new HttpsError('not-found', 'Asset not found')
			}

			if (asset.storeId !== storeId) {
				throw new HttpsError('permission-denied', 'Asset does not belong to this store')
			}

			// Soft delete the asset
			const deletedAsset = asset.delete()
			await assetRepository.update(deletedAsset)

			logger.info('Asset deleted', { assetId })

			return {
				success: true,
				assetId,
			}
		} catch (error) {
			logger.error('Failed to delete asset', { error, assetId })

			if (error instanceof HttpsError) {
				throw error
			}

			throw new HttpsError('internal', 'Failed to delete asset')
		}
	},
)

/**
 * Storage trigger - automatically process uploaded files
 * This is triggered when a file is finalized in Cloud Storage
 */
export const onAssetUploaded = onObjectFinalized({ maxInstances: 10, timeoutSeconds: 60 }, async (event) => {
	const filePath = event.data.name
	const contentType = event.data.contentType

	logger.info('File uploaded to storage', { filePath, contentType })

	// Parse the file path to extract asset info
	// Expected format: {storeId}/{category}/{assetId}/{filename}
	const pathParts = filePath.split('/')
	if (pathParts.length < 4) {
		logger.warn('Invalid file path format', { filePath })
		return
	}

	const storeId = pathParts[0]
	const assetId = pathParts[2]

	if (!storeId || !assetId) {
		logger.warn('Missing storeId or assetId in path', { filePath })
		return
	}

	try {
		// Find the asset by ID and storage path
		const asset = await assetRepository.findById(assetId)
		if (!asset) {
			logger.warn('Asset not found for uploaded file', { assetId, filePath })
			return
		}

		if (asset.storagePath.value !== filePath) {
			logger.warn('Storage path mismatch', {
				assetId,
				expectedPath: asset.storagePath.value,
				actualPath: filePath,
			})
			return
		}

		// Only process if still pending
		if (asset.status !== AssetStatus.PENDING_UPLOAD) {
			logger.info('Asset already processed', { assetId, status: asset.status })
			return
		}

		// Get CDN URL
		const cdnUrl = await storageService.getCdnUrl(filePath)

		// Mark as ready
		const readyAsset = asset.confirmUpload().markReady(cdnUrl ?? undefined)
		await assetRepository.update(readyAsset)

		logger.info('Asset auto-processed on upload', { assetId, cdnUrl })
	} catch (error) {
		logger.error('Failed to auto-process uploaded asset', { error, assetId, filePath })
	}
})
