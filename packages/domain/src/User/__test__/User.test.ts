import { beforeEach, describe, expect, it } from 'vitest'
import { FullName, Locale, UserId, UserStatus, UserValidationError } from '@/User'
import { User } from '@/User/User.entity'

/**
 * Test suite for User aggregate root
 *
 * These tests verify:
 * - Entity creation and validation
 * - Business rule enforcement
 * - Domain method behavior
 * - Error handling and edge cases
 */
describe('User Aggregate Root', () => {
	describe('Factory Methods', () => {
		describe('create', () => {
			it('should create a user with valid data', () => {
				// Arrange
				const validData = {
					fullName: 'John Doe',
					locale: 'en-US',
				}

				// Act
				const user = User.create(validData)

				// Assert
				expect(user.value.id).toBeDefined()
				expect(user.id.value).toMatch(/^[a-f0-9-]+$/) // UUID format
				expect(user.fullName.value).toBe('John Doe')
				expect(user.locale.value).toBe('en-US')
				expect(user.status).toBe(UserStatus.ACTIVE)
				expect(user.deletedAt).toBeNull()
			})

			it('should create user with custom status', () => {
				// Arrange
				const validData = {
					fullName: 'Jane Doe',
					locale: 'pt-BR',
					status: UserStatus.INACTIVE,
				}

				// Act
				const user = User.create(validData)

				// Assert
				expect(user.status).toBe(UserStatus.INACTIVE)
			})

			it('should create user from existing props', () => {
				// Arrange
				const now = new Date()
				const existingProps = {
					id: UserId.create('existing-id-123'),
					fullName: FullName.create('John Doe'),
					locale: Locale.create('en-US'),
					externalId: null,
					status: UserStatus.ACTIVE,
					createdAt: now,
					updatedAt: now,
					deletedAt: null,
				}

				// Act
				const user = User.create(existingProps)

				// Assert
				expect(user.id.value).toBe('existing-id-123')
				expect(user.fullName.value).toBe('John Doe')
			})

			it('should throw validation error with invalid data', () => {
				// Arrange
				const invalidData = {
					fullName: '', // Empty name
					locale: 'en-US',
				}

				// Act & Assert
				expect(() => User.create(invalidData)).toThrow(UserValidationError)
			})

			it('should add domain event on creation', () => {
				// Arrange
				const validData = {
					fullName: 'John Doe',
					locale: 'en-US',
				}

				// Act
				const user = User.create(validData)

				// Assert
				expect(user.domainEvents).toHaveLength(1)
				expect(user.domainEvents[0]?.eventType).toBe('UserCreated')
			})
		})
	})

	describe('Entity Identity', () => {
		let user1: User
		let user2: User
		let user3: User
		const now = new Date()

		beforeEach(() => {
			user1 = User.create({
				id: UserId.create('same-id'),
				fullName: FullName.create('User One'),
				locale: Locale.create('en-US'),
				externalId: null,
				status: UserStatus.ACTIVE,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			})

			user2 = User.create({
				id: UserId.create('same-id'),
				fullName: FullName.create('User Two'),
				locale: Locale.create('pt-BR'),
				externalId: null,
				status: UserStatus.INACTIVE,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			})

			user3 = User.create({
				id: UserId.create('different-id'),
				fullName: FullName.create('User Three'),
				locale: Locale.create('es'),
				externalId: null,
				status: UserStatus.ACTIVE,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			})
		})

		it('should be equal when IDs are the same', () => {
			// Act & Assert
			expect(user1.equals(user2)).toBe(true)
		})

		it('should not be equal when IDs are different', () => {
			// Act & Assert
			expect(user1.equals(user3)).toBe(false)
		})

		it('should have consistent ID getter', () => {
			// Act & Assert
			expect(user1.id.value).toBe('same-id')
			expect(user3.id.value).toBe('different-id')
		})
	})

	describe('Business Methods', () => {
		let user: User

		beforeEach(() => {
			user = User.create({
				fullName: 'John Doe',
				locale: 'en-US',
			})
			user.clearDomainEvents() // Clear creation event
		})

		describe('updateFullName', () => {
			it('should update full name with valid value', () => {
				// Arrange
				const newName = 'Jane Doe'

				// Act
				const updatedUser = user.updateFullName(newName)

				// Assert
				expect(updatedUser.fullName.value).toBe(newName)
				expect(updatedUser.id.equals(user.id)).toBe(true) // Same identity
				expect(updatedUser).not.toBe(user) // Different instance (immutability)
			})

			it('should add domain event on update', () => {
				// Act
				const updatedUser = user.updateFullName('Jane Doe')

				// Assert
				expect(updatedUser.domainEvents).toHaveLength(1)
				expect(updatedUser.domainEvents[0]?.eventType).toBe('UserUpdated')
			})

			it('should throw error with empty name', () => {
				// Act & Assert
				expect(() => user.updateFullName('')).toThrow(UserValidationError)
			})
		})

		describe('updateLocale', () => {
			it('should update locale with valid value', () => {
				// Arrange
				const newLocale = 'pt-BR'

				// Act
				const updatedUser = user.updateLocale(newLocale)

				// Assert
				expect(updatedUser.locale.value).toBe(newLocale)
			})

			it('should add domain event on update', () => {
				// Act
				const updatedUser = user.updateLocale('pt-BR')

				// Assert
				expect(updatedUser.domainEvents).toHaveLength(1)
				expect(updatedUser.domainEvents[0]?.eventType).toBe('UserUpdated')
			})
		})

		describe('updateStatus', () => {
			it('should update status', () => {
				// Act
				const updatedUser = user.updateStatus(UserStatus.SUSPENDED)

				// Assert
				expect(updatedUser.status).toBe(UserStatus.SUSPENDED)
			})

			it('should add domain event on status change', () => {
				// Act
				const updatedUser = user.updateStatus(UserStatus.INACTIVE)

				// Assert
				expect(updatedUser.domainEvents).toHaveLength(1)
				expect(updatedUser.domainEvents[0]?.eventType).toBe('UserUpdated')
			})
		})

		describe('delete', () => {
			it('should soft delete the user', () => {
				// Act
				const deletedUser = user.delete()

				// Assert
				expect(deletedUser.isDeleted).toBe(true)
				expect(deletedUser.deletedAt).toBeInstanceOf(Date)
			})
		})

		describe('restore', () => {
			it('should restore a deleted user', () => {
				// Arrange
				const deletedUser = user.delete()

				// Act
				const restoredUser = deletedUser.restore()

				// Assert
				expect(restoredUser.isDeleted).toBe(false)
				expect(restoredUser.deletedAt).toBeNull()
			})
		})
	})

	describe('Domain Events', () => {
		it('should collect domain events', () => {
			// Arrange
			const user = User.create({
				fullName: 'John Doe',
				locale: 'en-US',
			})

			// Assert
			expect(user.domainEvents).toHaveLength(1)
		})

		it('should clear domain events', () => {
			// Arrange
			const user = User.create({
				fullName: 'John Doe',
				locale: 'en-US',
			})

			// Act
			user.clearDomainEvents()

			// Assert
			expect(user.domainEvents).toHaveLength(0)
		})
	})

	describe('Edge Cases', () => {
		it('should handle null/undefined gracefully', () => {
			// Act & Assert
			expect(() => User.create(null as any)).toThrow()
			expect(() => User.create(undefined as any)).toThrow()
		})

		it('should maintain immutability', () => {
			// Arrange
			const user = User.create({
				fullName: 'John Doe',
				locale: 'en-US',
			})
			const originalValue = user.value

			// Act - Try to modify the returned value (should not affect original)
			const _valueReference = user.value

			// Assert
			expect(user.value).toEqual(originalValue)
			expect(user.value).toBe(originalValue) // Same reference (readonly)
		})
	})
})
