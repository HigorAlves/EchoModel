import { User } from './User.entity'
import type { PersistenceUser } from './user.repository'
import { ExternalId, FullName, Locale, UserId } from './value-objects'

/**
 * @fileoverview User Mapper
 *
 * Mappers are responsible for converting between domain entities and
 * persistence representations. They serve as a bridge between the domain
 * and infrastructure layers.
 *
 * Mappers should:
 * - Handle bidirectional conversion (domain <-> persistence)
 * - Be stateless
 * - Encapsulate all mapping logic in one place
 * - Keep the repository interface clean and focused on data access
 *
 * Note: This mapper is synced with the database schema (infra/database)
 */

/**
 * Maps persistence data to a domain entity
 * @param data - Raw persistence data from the database
 * @returns User domain entity
 */
export function toDomain(data: PersistenceUser): User {
	return User.create({
		id: UserId.create(data.id),
		fullName: FullName.create(data.fullName),
		locale: Locale.create(data.locale),
		externalId: data.externalId ? ExternalId.create(data.externalId) : null,
		status: data.status,
		createdAt: data.createdAt,
		updatedAt: data.updatedAt,
		deletedAt: data.deletedAt,
	})
}

/**
 * Maps a domain entity to persistence format
 * @param entity - The user domain entity
 * @returns Persistence representation ready for database storage
 */
export function toPersistence(entity: User): PersistenceUser {
	return {
		id: entity.id.value,
		fullName: entity.fullName.value,
		locale: entity.locale.value,
		externalId: entity.externalId?.value ?? null,
		status: entity.status,
		createdAt: entity.createdAt,
		updatedAt: entity.updatedAt,
		deletedAt: entity.deletedAt,
	}
}

/**
 * User Mapper namespace for convenient access to mapping functions
 */
export const UserMapper = {
	toDomain,
	toPersistence,
}
