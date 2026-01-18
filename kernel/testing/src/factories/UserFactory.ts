import { User, UserStatus } from '@foundry/domain'

/**
 * Input for creating a user via factory
 */
export interface CreateUserInput {
	fullName?: string
	locale?: string
	status?: UserStatus
}

/**
 * Factory for creating User domain entities in tests.
 *
 * Provides convenient methods for creating users with default values
 * or custom overrides.
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Factory pattern is intentional for test utilities
export class UserFactory {
	private static counter = 0

	/**
	 * Creates a single user with optional overrides
	 */
	static create(input: CreateUserInput = {}): User {
		UserFactory.counter++
		const count = UserFactory.counter

		const fullName = input.fullName ?? `Test User ${count}`
		const locale = input.locale ?? 'en-US'
		const status = input.status ?? UserStatus.ACTIVE

		return User.create({
			fullName,
			locale,
			status,
		})
	}

	/**
	 * Creates multiple users
	 */
	static createMany(count: number, overrides: CreateUserInput = {}): User[] {
		return Array.from({ length: count }, () => UserFactory.create(overrides))
	}

	/**
	 * Creates a user with ACTIVE status
	 */
	static createActive(overrides: Omit<CreateUserInput, 'status'> = {}): User {
		return UserFactory.create({ ...overrides, status: UserStatus.ACTIVE })
	}

	/**
	 * Creates a user with INACTIVE status
	 */
	static createInactive(overrides: Omit<CreateUserInput, 'status'> = {}): User {
		return UserFactory.create({ ...overrides, status: UserStatus.INACTIVE })
	}

	/**
	 * Creates a user with SUSPENDED status
	 */
	static createSuspended(overrides: Omit<CreateUserInput, 'status'> = {}): User {
		return UserFactory.create({ ...overrides, status: UserStatus.SUSPENDED })
	}

	/**
	 * Resets the counter (useful between test suites)
	 */
	static reset(): void {
		UserFactory.counter = 0
	}
}
