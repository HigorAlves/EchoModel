/**
 * @fileoverview Storage Service Interface
 *
 * Defines the contract for cloud storage services (Firebase Storage, S3, etc.)
 * Handles file uploads, downloads, and signed URL generation.
 */

/**
 * Result of generating a signed upload URL
 */
export interface SignedUploadUrlResult {
	/** The signed URL for uploading */
	readonly uploadUrl: string
	/** Headers that must be included in the upload request */
	readonly headers?: Record<string, string>
	/** When the URL expires */
	readonly expiresAt: Date
}

/**
 * Result of generating a signed download URL
 */
export interface SignedDownloadUrlResult {
	/** The signed URL for downloading */
	readonly downloadUrl: string
	/** When the URL expires */
	readonly expiresAt: Date
}

/**
 * File metadata
 */
export interface FileMetadata {
	/** File size in bytes */
	readonly sizeBytes: number
	/** MIME type */
	readonly mimeType: string
	/** Content MD5 hash (optional) */
	readonly contentMd5?: string
	/** Custom metadata (optional) */
	readonly customMetadata?: Record<string, string>
	/** When the file was created */
	readonly createdAt?: Date
	/** When the file was last updated */
	readonly updatedAt?: Date
}

/**
 * Storage Service Interface
 *
 * Service for managing file storage operations.
 */
export interface IStorageService {
	/**
	 * Generate a signed URL for uploading a file
	 * @param storagePath - The path where the file will be stored
	 * @param mimeType - The MIME type of the file
	 * @param expiresInSeconds - How long the URL should be valid (default: 15 minutes)
	 * @returns Signed upload URL result
	 */
	generateUploadUrl(storagePath: string, mimeType: string, expiresInSeconds?: number): Promise<SignedUploadUrlResult>

	/**
	 * Generate a signed URL for downloading a file
	 * @param storagePath - The path to the file
	 * @param expiresInSeconds - How long the URL should be valid (default: 1 hour)
	 * @returns Signed download URL
	 */
	generateDownloadUrl(storagePath: string, expiresInSeconds?: number): Promise<string>

	/**
	 * Delete a file from storage
	 * @param storagePath - The path to the file
	 */
	deleteFile(storagePath: string): Promise<void>

	/**
	 * Check if a file exists
	 * @param storagePath - The path to check
	 * @returns True if file exists
	 */
	fileExists(storagePath: string): Promise<boolean>

	/**
	 * Get file metadata
	 * @param storagePath - The path to the file
	 * @returns File metadata or null if not found
	 */
	getFileMetadata(storagePath: string): Promise<FileMetadata | null>

	/**
	 * Copy a file to a new location
	 * @param sourcePath - The source path
	 * @param destinationPath - The destination path
	 */
	copyFile(sourcePath: string, destinationPath: string): Promise<void>

	/**
	 * Move a file to a new location
	 * @param sourcePath - The source path
	 * @param destinationPath - The destination path
	 */
	moveFile(sourcePath: string, destinationPath: string): Promise<void>

	/**
	 * Get the public CDN URL for a file (if CDN is configured)
	 * @param storagePath - The path to the file
	 * @returns Public CDN URL or null if not available
	 */
	getCdnUrl(storagePath: string): Promise<string | null>
}
