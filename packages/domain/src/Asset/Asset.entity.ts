import { randomUUID } from 'node:crypto'
import { type AssetCategory, AssetStatus, AssetType, getAssetCategoryFolder } from './asset.enum'
import type { AssetEvent } from './asset.event'
import {
	createAssetDeletedEvent,
	createAssetFailedEvent,
	createAssetReadyEvent,
	createAssetUploadConfirmedEvent,
	createAssetUploadRequestedEvent,
} from './asset.event'
import type { AssetMetadata } from './asset.repository'
import { AssetId, Filename, MimeType, StoragePath } from './value-objects'
import type { AllowedMimeType } from './value-objects/MimeType.vo'

/**
 * @fileoverview Asset Aggregate Root
 *
 * This entity serves as the Aggregate Root for the Asset bounded context.
 * An Asset represents a file (image) in the system, tracking its lifecycle
 * from upload request to ready state.
 */

export interface AssetProps {
	readonly id: AssetId
	readonly storeId: string
	readonly type: AssetType
	readonly category: AssetCategory
	readonly filename: Filename
	readonly mimeType: MimeType
	readonly sizeBytes: number
	readonly storagePath: StoragePath
	readonly cdnUrl: string | null
	readonly thumbnailUrl: string | null
	readonly metadata: AssetMetadata
	readonly uploadedBy: string
	readonly status: AssetStatus
	readonly failureReason: string | null
	readonly createdAt: Date
	readonly updatedAt: Date
	readonly deletedAt: Date | null
}

interface RequestUploadDTO {
	readonly storeId: string
	readonly category: AssetCategory
	readonly filename: string
	readonly mimeType: AllowedMimeType
	readonly sizeBytes: number
	readonly uploadedBy: string
	readonly metadata?: Partial<AssetMetadata>
}

/**
 * Asset Aggregate Root
 */
export class Asset {
	private readonly _domainEvents: AssetEvent[] = []

	private constructor(private readonly data: AssetProps) {}

	/**
	 * Factory method to create an Asset aggregate from props
	 */
	static create(data: AssetProps): Asset {
		return new Asset(data)
	}

	/**
	 * Factory method to request an upload (creates asset in PENDING_UPLOAD state)
	 */
	static requestUpload(dto: RequestUploadDTO): Asset {
		const now = new Date()
		const id = AssetId.create(randomUUID())
		const filename = Filename.create(dto.filename)
		const mimeType = MimeType.create(dto.mimeType)
		const categoryFolder = getAssetCategoryFolder(dto.category)
		const storagePath = StoragePath.build(dto.storeId, categoryFolder, id.value, filename.value)

		const asset = new Asset({
			id,
			storeId: dto.storeId,
			type: AssetType.IMAGE,
			category: dto.category,
			filename,
			mimeType,
			sizeBytes: dto.sizeBytes,
			storagePath,
			cdnUrl: null,
			thumbnailUrl: null,
			metadata: dto.metadata ?? {},
			uploadedBy: dto.uploadedBy,
			status: AssetStatus.PENDING_UPLOAD,
			failureReason: null,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		})

		asset.addDomainEvent(
			createAssetUploadRequestedEvent(id.value, {
				assetId: id.value,
				storeId: dto.storeId,
				category: dto.category,
				filename: filename.value,
			}),
		)

		return asset
	}

	// Getters
	get value(): AssetProps {
		return this.data
	}

	get id(): AssetId {
		return this.data.id
	}

	get storeId(): string {
		return this.data.storeId
	}

	get type(): AssetType {
		return this.data.type
	}

	get category(): AssetCategory {
		return this.data.category
	}

	get filename(): Filename {
		return this.data.filename
	}

	get mimeType(): MimeType {
		return this.data.mimeType
	}

	get sizeBytes(): number {
		return this.data.sizeBytes
	}

	get storagePath(): StoragePath {
		return this.data.storagePath
	}

	get cdnUrl(): string | null {
		return this.data.cdnUrl
	}

	get thumbnailUrl(): string | null {
		return this.data.thumbnailUrl
	}

	get metadata(): AssetMetadata {
		return this.data.metadata
	}

	get uploadedBy(): string {
		return this.data.uploadedBy
	}

	get status(): AssetStatus {
		return this.data.status
	}

	get failureReason(): string | null {
		return this.data.failureReason
	}

	get createdAt(): Date {
		return this.data.createdAt
	}

	get updatedAt(): Date {
		return this.data.updatedAt
	}

	get deletedAt(): Date | null {
		return this.data.deletedAt
	}

	get isDeleted(): boolean {
		return this.data.deletedAt !== null
	}

	get isReady(): boolean {
		return this.data.status === AssetStatus.READY
	}

	get isPending(): boolean {
		return this.data.status === AssetStatus.PENDING_UPLOAD
	}

	get domainEvents(): readonly AssetEvent[] {
		return [...this._domainEvents]
	}

	addDomainEvent(event: AssetEvent): void {
		this._domainEvents.push(event)
	}

	clearDomainEvents(): void {
		this._domainEvents.length = 0
	}

	equals(other: Asset): boolean {
		return this.data.id.equals(other.data.id)
	}

	/**
	 * Confirm that the upload has been completed
	 * Transitions from PENDING_UPLOAD to UPLOADED
	 */
	confirmUpload(): Asset {
		const now = new Date()

		const confirmedAsset = new Asset({
			...this.data,
			status: AssetStatus.UPLOADED,
			updatedAt: now,
		})

		confirmedAsset.addDomainEvent(
			createAssetUploadConfirmedEvent(this.data.id.value, {
				assetId: this.data.id.value,
				storeId: this.data.storeId,
			}),
		)

		return confirmedAsset
	}

	/**
	 * Mark the asset as processing
	 * Transitions from UPLOADED to PROCESSING
	 */
	startProcessing(): Asset {
		const now = new Date()

		return new Asset({
			...this.data,
			status: AssetStatus.PROCESSING,
			updatedAt: now,
		})
	}

	/**
	 * Mark the asset as ready for use
	 * Transitions from UPLOADED or PROCESSING to READY
	 */
	markReady(cdnUrl?: string, thumbnailUrl?: string): Asset {
		const now = new Date()

		const readyAsset = new Asset({
			...this.data,
			status: AssetStatus.READY,
			cdnUrl: cdnUrl ?? null,
			thumbnailUrl: thumbnailUrl ?? null,
			updatedAt: now,
		})

		readyAsset.addDomainEvent(
			createAssetReadyEvent(this.data.id.value, {
				assetId: this.data.id.value,
				storeId: this.data.storeId,
				cdnUrl: cdnUrl ?? null,
			}),
		)

		return readyAsset
	}

	/**
	 * Mark the asset as failed
	 */
	markFailed(reason: string): Asset {
		const now = new Date()

		const failedAsset = new Asset({
			...this.data,
			status: AssetStatus.FAILED,
			failureReason: reason,
			updatedAt: now,
		})

		failedAsset.addDomainEvent(
			createAssetFailedEvent(this.data.id.value, {
				assetId: this.data.id.value,
				storeId: this.data.storeId,
				reason,
			}),
		)

		return failedAsset
	}

	/**
	 * Update asset metadata
	 */
	updateMetadata(metadata: Partial<AssetMetadata>): Asset {
		const now = new Date()

		return new Asset({
			...this.data,
			metadata: { ...this.data.metadata, ...metadata },
			updatedAt: now,
		})
	}

	/**
	 * Set the CDN URL
	 */
	setCdnUrl(cdnUrl: string): Asset {
		const now = new Date()

		return new Asset({
			...this.data,
			cdnUrl,
			updatedAt: now,
		})
	}

	/**
	 * Set the thumbnail URL
	 */
	setThumbnailUrl(thumbnailUrl: string): Asset {
		const now = new Date()

		return new Asset({
			...this.data,
			thumbnailUrl,
			updatedAt: now,
		})
	}

	/**
	 * Soft delete the asset
	 */
	delete(): Asset {
		const now = new Date()

		const deletedAsset = new Asset({
			...this.data,
			deletedAt: now,
			updatedAt: now,
		})

		deletedAsset.addDomainEvent(
			createAssetDeletedEvent(this.data.id.value, {
				assetId: this.data.id.value,
				storeId: this.data.storeId,
				deletedAt: now,
			}),
		)

		return deletedAsset
	}

	/**
	 * Restore a soft-deleted asset
	 */
	restore(): Asset {
		const now = new Date()

		return new Asset({
			...this.data,
			deletedAt: null,
			updatedAt: now,
		})
	}
}
