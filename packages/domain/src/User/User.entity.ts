import { randomUUID } from 'node:crypto'
import { UserStatus } from './user.enum'
import type { UserEvent } from './user.event'
import { createUserCreatedEvent, createUserUpdatedEvent } from './user.event'
import { ExternalId, FullName, Locale, UserId } from './value-objects'

/**
 * @fileoverview User Aggregate Root
 *
 * This entity serves as the Aggregate Root for the User bounded context.
 * As an Aggregate Root, it:
 * - Has a unique identity that persists over time
 * - Maintains consistency boundaries and enforces business invariants
 * - Collects domain events for eventual consistency patterns
 * - Is the only entry point for modifications within the aggregate
 *
 * Note: This entity is synced with the database schema (infra/database)
 */

export interface UserProps {
	readonly id: UserId
	readonly fullName: FullName
	readonly locale: Locale
	readonly status: UserStatus
	readonly externalId: ExternalId | null
	readonly createdAt: Date
	readonly updatedAt: Date
	readonly deletedAt: Date | null
}

interface CreateUserDTO {
	readonly fullName: string
	readonly locale: string
	readonly status?: UserStatus
	readonly externalId?: string
}

/**
 * User Aggregate Root
 *
 * Represents a user in the domain with unique identity and business behavior.
 * This aggregate root encapsulates all business rules, consistency boundaries,
 * and domain events related to user operations.
 */
export class User {
	private readonly _domainEvents: UserEvent[] = []

	private constructor(private readonly data: UserProps) {}

	/**
	 * Factory method to create a User aggregate
	 * @param data - Either entity props or DTO for creation
	 * @returns New User instance
	 */
	static create(data: UserProps | CreateUserDTO): User {
		// Handle both entity props and plain DTO
		if ((data as UserProps).id instanceof UserId) {
			return new User(data as UserProps)
		}

		// Create from DTO
		const dto = data as CreateUserDTO
		const now = new Date()

		// Validate business rules and constraints
		// Create value objects which will validate themselves
		const id = UserId.create(randomUUID())
		const fullName = FullName.create(dto.fullName)
		const locale = Locale.create(dto.locale)
		const status = dto.status ?? UserStatus.ACTIVE
		const externalId = dto.externalId ? ExternalId.create(dto.externalId) : null

		const user = new User({
			id,
			fullName,
			locale,
			status,
			externalId,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		})

		// Add domain event for new user creation
		user.addDomainEvent(createUserCreatedEvent(id.value, { userId: id.value }))

		return user
	}

	/**
	 * Get the entity data
	 * @returns Readonly copy of entity properties
	 */
	get value(): UserProps {
		return this.data
	}

	/**
	 * Get the entity's unique identifier
	 * @returns Entity ID
	 */
	get id(): UserId {
		return this.data.id
	}

	/**
	 * Get the user's full name
	 * @returns FullName value object
	 */
	get fullName(): FullName {
		return this.data.fullName
	}

	/**
	 * Get the user's locale
	 * @returns Locale value object
	 */
	get locale(): Locale {
		return this.data.locale
	}

	/**
	 * Get the user's status
	 * @returns UserStatus enum value
	 */
	get status(): UserStatus {
		return this.data.status
	}

	/**
	 * Get the user's external ID (e.g., Firebase Auth UID)
	 * @returns ExternalId value object or null if not linked to external provider
	 */
	get externalId(): ExternalId | null {
		return this.data.externalId
	}

	/**
	 * Get the creation timestamp
	 * @returns Date when the user was created
	 */
	get createdAt(): Date {
		return this.data.createdAt
	}

	/**
	 * Get the last update timestamp
	 * @returns Date when the user was last updated
	 */
	get updatedAt(): Date {
		return this.data.updatedAt
	}

	/**
	 * Get the deletion timestamp (for soft delete)
	 * @returns Date when the user was deleted, or null if not deleted
	 */
	get deletedAt(): Date | null {
		return this.data.deletedAt
	}

	/**
	 * Check if the user has been soft deleted
	 * @returns True if the user is deleted
	 */
	get isDeleted(): boolean {
		return this.data.deletedAt !== null
	}

	/**
	 * Get all domain events that occurred on this aggregate
	 * @returns Readonly array of domain events
	 */
	get domainEvents(): readonly UserEvent[] {
		return [...this._domainEvents]
	}

	/**
	 * Add a domain event to the aggregate
	 * @param event - The domain event to add
	 */
	addDomainEvent(event: UserEvent): void {
		this._domainEvents.push(event)
	}

	/**
	 * Clear all domain events (typically called after events are published)
	 */
	clearDomainEvents(): void {
		this._domainEvents.length = 0
	}

	/**
	 * Check if this entity equals another entity
	 * Entities are equal if they have the same ID
	 * @param other - Another User entity
	 * @returns True if entities have same ID
	 */
	equals(other: User): boolean {
		return this.data.id.equals(other.data.id)
	}

	/**
	 * Update the user's full name
	 * @param newFullName - The new full name
	 * @returns New User instance with updated full name
	 */
	updateFullName(newFullName: string): User {
		const fullName = FullName.create(newFullName)
		const now = new Date()

		const updatedUser = new User({
			...this.data,
			fullName,
			updatedAt: now,
		})

		updatedUser.addDomainEvent(
			createUserUpdatedEvent(this.data.id.value, {
				userId: this.data.id.value,
				changes: {
					fullName: { from: this.data.fullName.value, to: fullName.value },
				},
			}),
		)

		return updatedUser
	}

	/**
	 * Update the user's locale
	 * @param newLocale - The new locale
	 * @returns New User instance with updated locale
	 */
	updateLocale(newLocale: string): User {
		const locale = Locale.create(newLocale)
		const now = new Date()

		const updatedUser = new User({
			...this.data,
			locale,
			updatedAt: now,
		})

		updatedUser.addDomainEvent(
			createUserUpdatedEvent(this.data.id.value, {
				userId: this.data.id.value,
				changes: {
					locale: { from: this.data.locale.value, to: locale.value },
				},
			}),
		)

		return updatedUser
	}

	/**
	 * Update the user's status
	 * @param newStatus - The new status
	 * @returns New User instance with updated status
	 */
	updateStatus(newStatus: UserStatus): User {
		const now = new Date()

		const updatedUser = new User({
			...this.data,
			status: newStatus,
			updatedAt: now,
		})

		updatedUser.addDomainEvent(
			createUserUpdatedEvent(this.data.id.value, {
				userId: this.data.id.value,
				changes: {
					status: { from: this.data.status, to: newStatus },
				},
			}),
		)

		return updatedUser
	}

	/**
	 * Soft delete the user
	 * @returns New User instance marked as deleted
	 */
	delete(): User {
		const now = new Date()

		const deletedUser = new User({
			...this.data,
			deletedAt: now,
			updatedAt: now,
		})

		return deletedUser
	}

	/**
	 * Restore a soft-deleted user
	 * @returns New User instance with deletedAt cleared
	 */
	restore(): User {
		const now = new Date()

		const restoredUser = new User({
			...this.data,
			deletedAt: null,
			updatedAt: now,
		})

		return restoredUser
	}
}
