import type { Auth, AuthQueryFilters, IAuthRepository, TokenStatus } from '@foundry/domain'

/**
 * In-memory implementation of IAuthRepository for testing and local development.
 *
 * This repository stores data in memory and provides all the operations
 * defined by the domain interface. Useful for:
 * - Unit tests (isolated, fast, no external dependencies)
 * - Local development without database
 * - Integration tests with mock data
 */
export class InMemoryAuthRepository implements IAuthRepository {
	private readonly tokens = new Map<string, Auth>()

	/**
	 * Creates a new instance with optional seed data
	 * @param initialData - Optional array of auth tokens to seed the repository
	 */
	constructor(initialData?: Auth[]) {
		if (initialData) {
			for (const auth of initialData) {
				this.tokens.set(auth.id.value, auth)
			}
		}
	}

	async create(auth: Auth): Promise<string> {
		const id = auth.id.value
		if (this.tokens.has(id)) {
			throw new Error(`Token with id ${id} already exists`)
		}
		this.tokens.set(id, auth)
		return id
	}

	async save(id: string, auth: Auth): Promise<void> {
		this.tokens.set(id, auth)
	}

	async update(auth: Auth): Promise<void> {
		const id = auth.id.value
		if (!this.tokens.has(id)) {
			throw new Error(`Token with id ${id} not found`)
		}
		this.tokens.set(id, auth)
	}

	async remove(id: string): Promise<void> {
		if (!this.tokens.has(id)) {
			throw new Error(`Token with id ${id} not found`)
		}
		this.tokens.delete(id)
	}

	async findById(id: string): Promise<Auth | null> {
		return this.tokens.get(id) ?? null
	}

	async findByToken(token: string): Promise<Auth | null> {
		for (const auth of this.tokens.values()) {
			if (auth.token.value === token) {
				return auth
			}
		}
		return null
	}

	async findByUserId(userId: string): Promise<Auth[]> {
		return Array.from(this.tokens.values()).filter((auth) => auth.userId === userId)
	}

	async findMany(filters?: AuthQueryFilters): Promise<Auth[]> {
		let result = Array.from(this.tokens.values())

		if (filters) {
			if (filters.userId) {
				result = result.filter((a) => a.userId === filters.userId)
			}
			if (filters.status) {
				result = result.filter((a) => a.status === filters.status)
			}
			if (!filters.includeExpired) {
				result = result.filter((a) => !a.isExpired())
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

	async revokeToken(id: string): Promise<void> {
		const auth = this.tokens.get(id)
		if (!auth) {
			throw new Error(`Token with id ${id} not found`)
		}
		const revoked = auth.revoke()
		this.tokens.set(id, revoked)
	}

	async revokeAllUserTokens(userId: string): Promise<void> {
		for (const [id, auth] of this.tokens.entries()) {
			if (auth.userId === userId && auth.status === ('ACTIVE' as TokenStatus)) {
				const revoked = auth.revoke()
				this.tokens.set(id, revoked)
			}
		}
	}

	async countActiveTokens(userId: string): Promise<number> {
		let count = 0
		for (const auth of this.tokens.values()) {
			if (auth.userId === userId && auth.status === ('ACTIVE' as TokenStatus) && !auth.isExpired()) {
				count++
			}
		}
		return count
	}

	async exists(id: string): Promise<boolean> {
		return this.tokens.has(id)
	}

	async deleteExpiredTokens(): Promise<number> {
		let deleted = 0
		for (const [id, auth] of this.tokens.entries()) {
			if (auth.isExpired() && auth.status !== ('REVOKED' as TokenStatus)) {
				this.tokens.delete(id)
				deleted++
			}
		}
		return deleted
	}

	/**
	 * Clears all data from the repository.
	 * Useful for test cleanup.
	 */
	clear(): void {
		this.tokens.clear()
	}

	/**
	 * Seeds the repository with test data.
	 * @param tokens - Array of auth tokens to add
	 */
	seed(tokens: Auth[]): void {
		for (const auth of tokens) {
			this.tokens.set(auth.id.value, auth)
		}
	}

	/**
	 * Returns all tokens in the repository.
	 * Useful for test assertions.
	 */
	getAll(): Auth[] {
		return Array.from(this.tokens.values())
	}

	/**
	 * Returns the current size of the repository.
	 */
	get size(): number {
		return this.tokens.size
	}
}
