import { describe, expect, it } from 'vitest'
import { FullName, Locale, UserId, UserValidationError } from '@/User'

/**
 * Test suite for User value objects
 *
 * Value objects are immutable, self-validating objects that represent domain concepts.
 */
describe('Value Objects', () => {
	describe('UserId', () => {
		describe('create', () => {
			it('should create a valid UserId', () => {
				const id = UserId.create('valid-id-123')
				expect(id.value).toBe('valid-id-123')
			})

			it('should create UserId with UUID format', () => {
				const id = UserId.create('550e8400-e29b-41d4-a716-446655440000')
				expect(id.value).toBe('550e8400-e29b-41d4-a716-446655440000')
			})

			it('should throw error for empty ID', () => {
				expect(() => UserId.create('')).toThrow(UserValidationError)
			})

			it('should throw error for ID exceeding max length', () => {
				const longId = 'a'.repeat(256)
				expect(() => UserId.create(longId)).toThrow(UserValidationError)
			})

			it('should throw error for invalid characters', () => {
				expect(() => UserId.create('invalid id with spaces')).toThrow(UserValidationError)
				expect(() => UserId.create('invalid@id')).toThrow(UserValidationError)
			})

			it('should allow underscores and hyphens', () => {
				const id = UserId.create('valid_id-123')
				expect(id.value).toBe('valid_id-123')
			})
		})

		describe('equals', () => {
			it('should return true for equal IDs', () => {
				const id1 = UserId.create('same-id')
				const id2 = UserId.create('same-id')
				expect(id1.equals(id2)).toBe(true)
			})

			it('should return false for different IDs', () => {
				const id1 = UserId.create('id-1')
				const id2 = UserId.create('id-2')
				expect(id1.equals(id2)).toBe(false)
			})
		})

		describe('serialization', () => {
			it('should convert to string', () => {
				const id = UserId.create('test-id')
				expect(id.toString()).toBe('test-id')
			})

			it('should convert to JSON', () => {
				const id = UserId.create('test-id')
				expect(id.toJSON()).toBe('test-id')
			})
		})
	})

	describe('FullName', () => {
		describe('create', () => {
			it('should create a valid FullName', () => {
				const name = FullName.create('John Doe')
				expect(name.value).toBe('John Doe')
			})

			it('should trim whitespace', () => {
				const name = FullName.create('  John Doe  ')
				expect(name.value).toBe('John Doe')
			})

			it('should throw error for empty name', () => {
				expect(() => FullName.create('')).toThrow(UserValidationError)
			})

			it('should throw error for whitespace-only name', () => {
				expect(() => FullName.create('   ')).toThrow(UserValidationError)
			})

			it('should throw error for name exceeding max length', () => {
				const longName = 'a'.repeat(256)
				expect(() => FullName.create(longName)).toThrow(UserValidationError)
			})

			it('should allow special characters in names', () => {
				const name = FullName.create("O'Connor-Smith Jr.")
				expect(name.value).toBe("O'Connor-Smith Jr.")
			})

			it('should allow unicode characters', () => {
				const name = FullName.create('José García')
				expect(name.value).toBe('José García')
			})
		})

		describe('equals', () => {
			it('should return true for equal names', () => {
				const name1 = FullName.create('John Doe')
				const name2 = FullName.create('John Doe')
				expect(name1.equals(name2)).toBe(true)
			})

			it('should return false for different names', () => {
				const name1 = FullName.create('John Doe')
				const name2 = FullName.create('Jane Doe')
				expect(name1.equals(name2)).toBe(false)
			})
		})

		describe('serialization', () => {
			it('should convert to string', () => {
				const name = FullName.create('John Doe')
				expect(name.toString()).toBe('John Doe')
			})

			it('should convert to JSON', () => {
				const name = FullName.create('John Doe')
				expect(name.toJSON()).toBe('John Doe')
			})
		})
	})

	describe('Locale', () => {
		describe('create', () => {
			it('should create a valid Locale', () => {
				const locale = Locale.create('en-US')
				expect(locale.value).toBe('en-US')
			})

			it('should trim whitespace', () => {
				const locale = Locale.create('  pt-BR  ')
				expect(locale.value).toBe('pt-BR')
			})

			it('should allow simple language codes', () => {
				const locale = Locale.create('en')
				expect(locale.value).toBe('en')
			})

			it('should throw error for empty locale', () => {
				expect(() => Locale.create('')).toThrow(UserValidationError)
			})

			it('should throw error for single character locale', () => {
				expect(() => Locale.create('e')).toThrow(UserValidationError)
			})

			it('should throw error for locale exceeding max length', () => {
				const longLocale = 'a'.repeat(11)
				expect(() => Locale.create(longLocale)).toThrow(UserValidationError)
			})
		})

		describe('language extraction', () => {
			it('should extract language from locale', () => {
				const locale = Locale.create('en-US')
				expect(locale.language).toBe('en')
			})

			it('should return full value if no region', () => {
				const locale = Locale.create('en')
				expect(locale.language).toBe('en')
			})
		})

		describe('region extraction', () => {
			it('should extract region from locale', () => {
				const locale = Locale.create('en-US')
				expect(locale.region).toBe('US')
			})

			it('should return null if no region', () => {
				const locale = Locale.create('en')
				expect(locale.region).toBeNull()
			})
		})

		describe('equals', () => {
			it('should return true for equal locales', () => {
				const locale1 = Locale.create('en-US')
				const locale2 = Locale.create('en-US')
				expect(locale1.equals(locale2)).toBe(true)
			})

			it('should return false for different locales', () => {
				const locale1 = Locale.create('en-US')
				const locale2 = Locale.create('pt-BR')
				expect(locale1.equals(locale2)).toBe(false)
			})
		})

		describe('serialization', () => {
			it('should convert to string', () => {
				const locale = Locale.create('en-US')
				expect(locale.toString()).toBe('en-US')
			})

			it('should convert to JSON', () => {
				const locale = Locale.create('en-US')
				expect(locale.toJSON()).toBe('en-US')
			})
		})
	})
})
