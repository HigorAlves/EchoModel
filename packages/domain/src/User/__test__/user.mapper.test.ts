import { describe, expect, it } from 'vitest'
import { FullName, Locale, UserId, UserMapper, UserStatus } from '@/User'
import { User } from '@/User/User.entity'
import type { PersistenceUser } from '@/User/user.repository'

/**
 * Test suite for UserMapper
 *
 * The mapper is responsible for converting between domain entities
 * and persistence representations.
 */
describe('UserMapper', () => {
	const now = new Date()

	describe('toDomain', () => {
		it('should convert persistence data to domain entity', () => {
			// Arrange
			const persistenceData: PersistenceUser = {
				id: 'user-123',
				fullName: 'John Doe',
				locale: 'en-US',
				status: UserStatus.ACTIVE,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
				externalId: null,
			}

			// Act
			const user = UserMapper.toDomain(persistenceData)

			// Assert
			expect(user.id.value).toBe('user-123')
			expect(user.fullName.value).toBe('John Doe')
			expect(user.locale.value).toBe('en-US')
			expect(user.status).toBe(UserStatus.ACTIVE)
			expect(user.createdAt).toEqual(now)
			expect(user.updatedAt).toEqual(now)
			expect(user.deletedAt).toBeNull()
		})

		it('should handle soft-deleted user', () => {
			// Arrange
			const deletedAt = new Date()
			const persistenceData: PersistenceUser = {
				id: 'user-456',
				fullName: 'Deleted User',
				locale: 'pt-BR',
				status: UserStatus.INACTIVE,
				createdAt: now,
				updatedAt: now,
				deletedAt,
				externalId: null,
			}

			// Act
			const user = UserMapper.toDomain(persistenceData)

			// Assert
			expect(user.isDeleted).toBe(true)
			expect(user.deletedAt).toEqual(deletedAt)
		})

		it('should handle all status types', () => {
			const statuses = [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED]

			for (const status of statuses) {
				const persistenceData: PersistenceUser = {
					id: `user-${status}`,
					fullName: 'Test User',
					locale: 'en',
					status,
					createdAt: now,
					updatedAt: now,
					deletedAt: null,
					externalId: null,
				}

				const user = UserMapper.toDomain(persistenceData)
				expect(user.status).toBe(status)
			}
		})
	})

	describe('toPersistence', () => {
		it('should convert domain entity to persistence format', () => {
			// Arrange
			const user = User.create({
				id: UserId.create('user-789'),
				fullName: FullName.create('Jane Doe'),
				locale: Locale.create('es-ES'),
				status: UserStatus.ACTIVE,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
				externalId: null,
			})

			// Act
			const persistence = UserMapper.toPersistence(user)

			// Assert
			expect(persistence.id).toBe('user-789')
			expect(persistence.fullName).toBe('Jane Doe')
			expect(persistence.locale).toBe('es-ES')
			expect(persistence.status).toBe(UserStatus.ACTIVE)
			expect(persistence.createdAt).toEqual(now)
			expect(persistence.updatedAt).toEqual(now)
			expect(persistence.deletedAt).toBeNull()
		})

		it('should handle soft-deleted entity', () => {
			// Arrange
			const user = User.create({
				fullName: 'To Delete',
				locale: 'en',
			})
			const deletedUser = user.delete()

			// Act
			const persistence = UserMapper.toPersistence(deletedUser)

			// Assert
			expect(persistence.deletedAt).toBeInstanceOf(Date)
		})

		it('should preserve all entity data', () => {
			// Arrange
			const user = User.create({
				id: UserId.create('preserve-test'),
				fullName: FullName.create('Preserve Test'),
				locale: Locale.create('fr-FR'),
				status: UserStatus.SUSPENDED,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
				externalId: null,
			})

			// Act
			const persistence = UserMapper.toPersistence(user)

			// Assert
			expect(persistence).toEqual({
				id: 'preserve-test',
				fullName: 'Preserve Test',
				locale: 'fr-FR',
				status: UserStatus.SUSPENDED,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
				externalId: null,
			})
		})
	})

	describe('round-trip conversion', () => {
		it('should maintain data integrity through round-trip', () => {
			// Arrange
			const originalPersistence: PersistenceUser = {
				id: 'round-trip-123',
				fullName: 'Round Trip User',
				locale: 'de-DE',
				status: UserStatus.ACTIVE,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
				externalId: null,
			}

			// Act
			const domain = UserMapper.toDomain(originalPersistence)
			const backToPersistence = UserMapper.toPersistence(domain)

			// Assert
			expect(backToPersistence.id).toBe(originalPersistence.id)
			expect(backToPersistence.fullName).toBe(originalPersistence.fullName)
			expect(backToPersistence.locale).toBe(originalPersistence.locale)
			expect(backToPersistence.status).toBe(originalPersistence.status)
			expect(backToPersistence.deletedAt).toBe(originalPersistence.deletedAt)
		})
	})
})
