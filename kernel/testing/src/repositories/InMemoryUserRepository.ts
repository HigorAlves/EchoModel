import type { IUserRepository, User, UserQueryFilters, UserStatus } from '@foundry/domain'

/**
 * In-memory implementation of IUserRepository for testing and local development.
 *
 * This repository stores data in memory and provides all the operations
 * defined by the domain interface. Useful for:
 * - Unit tests (isolated, fast, no external dependencies)
 * - Local development without database
 * - Integration tests with mock data
 */
export class InMemoryUserRepository implements IUserRepository {
	private readonly users = new Map<string, User>()

	/**
	 * Creates a new instance with optional seed data
	 * @param initialData - Optional array of users to seed the repository
	 */
	constructor(initialData?: User[]) {
		if (initialData) {
			for (const user of initialData) {
				this.users.set(user.id.value, user)
			}
		}
	}

	async create(user: User): Promise<string> {
		const id = user.id.value
		if (this.users.has(id)) {
			throw new Error(`User with id ${id} already exists`)
		}
		this.users.set(id, user)
		return id
	}

	async save(id: string, user: User): Promise<void> {
		this.users.set(id, user)
	}

	async update(user: User): Promise<void> {
		const id = user.id.value
		if (!this.users.has(id)) {
			throw new Error(`User with id ${id} not found`)
		}
		this.users.set(id, user)
	}

	async remove(id: string): Promise<void> {
		if (!this.users.has(id)) {
			throw new Error(`User with id ${id} not found`)
		}
		this.users.delete(id)
	}

	async findById(id: string): Promise<User | null> {
		return this.users.get(id) ?? null
	}

	async findMany(filters?: UserQueryFilters): Promise<User[]> {
		let result = Array.from(this.users.values())

		if (filters) {
			if (filters.status) {
				result = result.filter((u) => u.status === filters.status)
			}
			if (filters.fullName) {
				const search = filters.fullName.toLowerCase()
				result = result.filter((u) => u.fullName.value.toLowerCase().includes(search))
			}
			if (filters.locale) {
				result = result.filter((u) => u.locale.value === filters.locale)
			}
			if (filters.externalId) {
				result = result.filter((u) => u.externalId?.value === filters.externalId)
			}

			// Sorting
			if (filters.sortBy) {
				const sortBy = filters.sortBy
				const sortOrder = filters.sortOrder === 'desc' ? -1 : 1
				result.sort((a, b) => {
					const aVal = this.getSortValue(a, sortBy)
					const bVal = this.getSortValue(b, sortBy)
					if (aVal < bVal) return -1 * sortOrder
					if (aVal > bVal) return 1 * sortOrder
					return 0
				})
			}

			// Pagination
			if (filters.offset !== undefined) {
				result = result.slice(filters.offset)
			}
			if (filters.limit !== undefined) {
				result = result.slice(0, filters.limit)
			}
		}

		return result
	}

	async findOne(filters: UserQueryFilters): Promise<User | null> {
		const results = await this.findMany({ ...filters, limit: 1 })
		return results[0] ?? null
	}

	async findByStatus(status: UserStatus): Promise<User[]> {
		return this.findMany({ status })
	}

	async findByExternalId(externalId: string): Promise<User | null> {
		const users = Array.from(this.users.values())
		return users.find((u) => u.externalId?.value === externalId) ?? null
	}

	async count(filters?: UserQueryFilters): Promise<number> {
		if (!filters) {
			return this.users.size
		}
		const results = await this.findMany({ ...filters, limit: undefined, offset: undefined })
		return results.length
	}

	async exists(id: string): Promise<boolean> {
		return this.users.has(id)
	}

	/**
	 * Clears all data from the repository.
	 * Useful for test cleanup.
	 */
	clear(): void {
		this.users.clear()
	}

	/**
	 * Seeds the repository with test data.
	 * @param users - Array of users to add
	 */
	seed(users: User[]): void {
		for (const user of users) {
			this.users.set(user.id.value, user)
		}
	}

	/**
	 * Returns all users in the repository.
	 * Useful for test assertions.
	 */
	getAll(): User[] {
		return Array.from(this.users.values())
	}

	/**
	 * Returns the current size of the repository.
	 */
	get size(): number {
		return this.users.size
	}

	private getSortValue(user: User, field: string): string | Date {
		switch (field) {
			case 'fullName':
				return user.fullName.value
			case 'status':
				return user.status
			case 'locale':
				return user.locale.value
			case 'createdAt':
				return user.createdAt
			case 'updatedAt':
				return user.updatedAt
			default:
				return user.id.value
		}
	}
}
