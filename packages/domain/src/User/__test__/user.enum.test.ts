import { describe, expect, it } from 'vitest'
import {
	getAllStatuses,
	getStatusLabel,
	getValidTransitionsTo,
	isValidStatus,
	isValidTransition,
	UserStatus,
} from '@/User'

/**
 * Test suite for UserStatus enum and utilities
 */
describe('UserStatus', () => {
	describe('enum values', () => {
		it('should have ACTIVE status', () => {
			expect(UserStatus.ACTIVE).toBe('ACTIVE')
		})

		it('should have INACTIVE status', () => {
			expect(UserStatus.INACTIVE).toBe('INACTIVE')
		})

		it('should have SUSPENDED status', () => {
			expect(UserStatus.SUSPENDED).toBe('SUSPENDED')
		})
	})

	describe('getAllStatuses', () => {
		it('should return all status values', () => {
			const statuses = getAllStatuses()
			expect(statuses).toContain(UserStatus.ACTIVE)
			expect(statuses).toContain(UserStatus.INACTIVE)
			expect(statuses).toContain(UserStatus.SUSPENDED)
			expect(statuses).toHaveLength(3)
		})
	})

	describe('isValidStatus', () => {
		it('should return true for valid statuses', () => {
			expect(isValidStatus('ACTIVE')).toBe(true)
			expect(isValidStatus('INACTIVE')).toBe(true)
			expect(isValidStatus('SUSPENDED')).toBe(true)
		})

		it('should return false for invalid statuses', () => {
			expect(isValidStatus('INVALID')).toBe(false)
			expect(isValidStatus('active')).toBe(false) // case sensitive
			expect(isValidStatus('')).toBe(false)
		})
	})

	describe('getValidTransitionsTo', () => {
		it('should return valid transitions to ACTIVE', () => {
			const transitions = getValidTransitionsTo(UserStatus.ACTIVE)
			expect(transitions).toContain(UserStatus.INACTIVE)
			expect(transitions).toContain(UserStatus.SUSPENDED)
		})

		it('should return valid transitions to INACTIVE', () => {
			const transitions = getValidTransitionsTo(UserStatus.INACTIVE)
			expect(transitions).toContain(UserStatus.ACTIVE)
		})

		it('should return valid transitions to SUSPENDED', () => {
			const transitions = getValidTransitionsTo(UserStatus.SUSPENDED)
			expect(transitions).toContain(UserStatus.ACTIVE)
		})
	})

	describe('isValidTransition', () => {
		it('should allow INACTIVE to ACTIVE transition', () => {
			expect(isValidTransition(UserStatus.INACTIVE, UserStatus.ACTIVE)).toBe(true)
		})

		it('should allow SUSPENDED to ACTIVE transition', () => {
			expect(isValidTransition(UserStatus.SUSPENDED, UserStatus.ACTIVE)).toBe(true)
		})

		it('should allow ACTIVE to INACTIVE transition', () => {
			expect(isValidTransition(UserStatus.ACTIVE, UserStatus.INACTIVE)).toBe(true)
		})

		it('should allow ACTIVE to SUSPENDED transition', () => {
			expect(isValidTransition(UserStatus.ACTIVE, UserStatus.SUSPENDED)).toBe(true)
		})

		it('should not allow INACTIVE to SUSPENDED directly', () => {
			expect(isValidTransition(UserStatus.INACTIVE, UserStatus.SUSPENDED)).toBe(false)
		})
	})

	describe('getStatusLabel', () => {
		it('should return correct label for ACTIVE', () => {
			expect(getStatusLabel(UserStatus.ACTIVE)).toBe('Active')
		})

		it('should return correct label for INACTIVE', () => {
			expect(getStatusLabel(UserStatus.INACTIVE)).toBe('Inactive')
		})

		it('should return correct label for SUSPENDED', () => {
			expect(getStatusLabel(UserStatus.SUSPENDED)).toBe('Suspended')
		})

		it('should return Unknown for invalid status', () => {
			expect(getStatusLabel('INVALID' as UserStatus)).toBe('Unknown')
		})
	})
})
