/**
 * @fileoverview Firebase Storage Service Implementation
 *
 * Implements IStorageService interface using Firebase Storage.
 */

import type { FileMetadata, IStorageService, SignedUploadUrlResult } from '@foundry/domain'
import type { Storage } from 'firebase-admin/storage'

/**
 * Firebase Storage implementation of IStorageService
 */
export class FirebaseStorageService implements IStorageService {
	private readonly bucket

	constructor(
		private readonly storage: Storage,
		bucketName?: string,
	) {
		this.bucket = bucketName ? this.storage.bucket(bucketName) : this.storage.bucket()
	}

	/**
	 * Generate a signed URL for uploading a file
	 */
	async generateUploadUrl(
		storagePath: string,
		mimeType: string,
		expiresInSeconds = 900, // 15 minutes default
	): Promise<SignedUploadUrlResult> {
		const file = this.bucket.file(storagePath)
		const expiresAt = new Date(Date.now() + expiresInSeconds * 1000)

		// Check if running in emulator mode
		const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true' || process.env.FIREBASE_STORAGE_EMULATOR_HOST

		if (isEmulator) {
			// In emulator mode, use the emulator upload endpoint
			const bucketName = this.bucket.name
			const encodedPath = encodeURIComponent(storagePath)
			const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199'
			const uploadUrl = `http://${emulatorHost}/v0/b/${bucketName}/o?name=${encodedPath}`

			return {
				uploadUrl,
				headers: {
					'Content-Type': mimeType,
				},
				expiresAt,
			}
		}

		// Production mode: use signed URLs
		const [uploadUrl] = await file.getSignedUrl({
			version: 'v4',
			action: 'write',
			expires: expiresAt,
			contentType: mimeType,
		})

		return {
			uploadUrl,
			headers: {
				'Content-Type': mimeType,
			},
			expiresAt,
		}
	}

	/**
	 * Generate a signed URL for downloading a file
	 */
	async generateDownloadUrl(storagePath: string, expiresInSeconds = 3600): Promise<string> {
		const file = this.bucket.file(storagePath)
		const expiresAt = new Date(Date.now() + expiresInSeconds * 1000)

		const [downloadUrl] = await file.getSignedUrl({
			version: 'v4',
			action: 'read',
			expires: expiresAt,
		})

		return downloadUrl
	}

	/**
	 * Delete a file from storage
	 */
	async deleteFile(storagePath: string): Promise<void> {
		const file = this.bucket.file(storagePath)
		await file.delete({ ignoreNotFound: true })
	}

	/**
	 * Check if a file exists
	 */
	async fileExists(storagePath: string): Promise<boolean> {
		const file = this.bucket.file(storagePath)
		const [exists] = await file.exists()
		return exists
	}

	/**
	 * Get file metadata
	 */
	async getFileMetadata(storagePath: string): Promise<FileMetadata | null> {
		const file = this.bucket.file(storagePath)

		try {
			const [metadata] = await file.getMetadata()

			// Convert custom metadata to Record<string, string>
			const customMetadata: Record<string, string> | undefined = metadata.metadata
				? Object.fromEntries(
						Object.entries(metadata.metadata)
							.filter(([, v]) => v != null)
							.map(([k, v]) => [k, String(v)]),
					)
				: undefined

			return {
				sizeBytes: Number(metadata.size) || 0,
				mimeType: metadata.contentType || 'application/octet-stream',
				contentMd5: metadata.md5Hash ?? undefined,
				customMetadata,
				createdAt: metadata.timeCreated ? new Date(metadata.timeCreated) : undefined,
				updatedAt: metadata.updated ? new Date(metadata.updated) : undefined,
			}
		} catch {
			return null
		}
	}

	/**
	 * Copy a file to a new location
	 */
	async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
		const sourceFile = this.bucket.file(sourcePath)
		const destinationFile = this.bucket.file(destinationPath)
		await sourceFile.copy(destinationFile)
	}

	/**
	 * Move a file to a new location
	 */
	async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
		await this.copyFile(sourcePath, destinationPath)
		await this.deleteFile(sourcePath)
	}

	/**
	 * Get the public CDN URL for a file
	 * Note: This requires the bucket to have public access or Firebase Hosting CDN
	 */
	async getCdnUrl(storagePath: string): Promise<string | null> {
		const file = this.bucket.file(storagePath)
		const [exists] = await file.exists()

		if (!exists) {
			return null
		}

		// For Firebase Storage, the public URL format is:
		// https://storage.googleapis.com/{bucket}/{path}
		// Or for Firebase Hosting integration:
		// https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media
		const bucketName = this.bucket.name
		const encodedPath = encodeURIComponent(storagePath)

		return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`
	}

	/**
	 * Make a file publicly accessible
	 */
	async makePublic(storagePath: string): Promise<string> {
		const file = this.bucket.file(storagePath)
		await file.makePublic()

		const bucketName = this.bucket.name
		return `https://storage.googleapis.com/${bucketName}/${storagePath}`
	}

	/**
	 * Download file content as a buffer
	 */
	async downloadFile(storagePath: string): Promise<Buffer> {
		const file = this.bucket.file(storagePath)
		const [content] = await file.download()
		return content
	}

	/**
	 * Upload file from buffer
	 */
	async uploadFile(storagePath: string, data: Buffer, mimeType: string): Promise<void> {
		const file = this.bucket.file(storagePath)
		await file.save(data, {
			contentType: mimeType,
			resumable: false,
		})
	}

	/**
	 * Upload file from URL (download and re-upload)
	 */
	async uploadFromUrl(storagePath: string, sourceUrl: string, mimeType: string): Promise<void> {
		const response = await fetch(sourceUrl)
		if (!response.ok) {
			throw new Error(`Failed to fetch from URL: ${response.statusText}`)
		}

		const arrayBuffer = await response.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		await this.uploadFile(storagePath, buffer, mimeType)
	}
}
