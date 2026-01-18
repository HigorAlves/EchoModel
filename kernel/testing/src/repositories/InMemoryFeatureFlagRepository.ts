import type { FeatureFlag, FeatureFlagQueryFilters, FeatureFlagStatus, IFeatureFlagRepository } from '@foundry/domain'

/**
 * In-memory implementation of IFeatureFlagRepository for testing and local development.
 *
 * This repository stores data in memory and provides all the operations
 * defined by the domain interface. Useful for:
 * - Unit tests (isolated, fast, no external dependencies)
 * - Local development without database
 * - Integration tests with mock data
 */
export class InMemoryFeatureFlagRepository implements IFeatureFlagRepository {
	private readonly flags = new Map<string, FeatureFlag>()
	private readonly keyToId = new Map<string, string>()

	/**
	 * Creates a new instance with optional seed data
	 * @param initialData - Optional array of feature flags to seed the repository
	 */
	constructor(initialData?: FeatureFlag[]) {
		if (initialData) {
			for (const flag of initialData) {
				this.flags.set(flag.id.value, flag)
				this.keyToId.set(flag.key.value, flag.id.value)
			}
		}
	}

	async create(flag: FeatureFlag): Promise<string> {
		const id = flag.id.value
		const key = flag.key.value

		if (this.flags.has(id)) {
			throw new Error(`FeatureFlag with id ${id} already exists`)
		}
		if (this.keyToId.has(key)) {
			throw new Error(`FeatureFlag with key ${key} already exists`)
		}

		this.flags.set(id, flag)
		this.keyToId.set(key, id)
		return id
	}

	async save(id: string, flag: FeatureFlag): Promise<void> {
		const key = flag.key.value
		// Remove old key mapping if updating
		const existing = this.flags.get(id)
		if (existing && existing.key.value !== key) {
			this.keyToId.delete(existing.key.value)
		}
		this.flags.set(id, flag)
		this.keyToId.set(key, id)
	}

	async update(flag: FeatureFlag): Promise<void> {
		const id = flag.id.value
		if (!this.flags.has(id)) {
			throw new Error(`FeatureFlag with id ${id} not found`)
		}
		await this.save(id, flag)
	}

	async remove(id: string): Promise<void> {
		const flag = this.flags.get(id)
		if (!flag) {
			throw new Error(`FeatureFlag with id ${id} not found`)
		}
		this.keyToId.delete(flag.key.value)
		this.flags.delete(id)
	}

	async hardRemove(id: string): Promise<void> {
		await this.remove(id)
	}

	async findById(id: string): Promise<FeatureFlag | null> {
		return this.flags.get(id) ?? null
	}

	async findByKey(key: string): Promise<FeatureFlag | null> {
		const id = this.keyToId.get(key)
		if (!id) return null
		return this.flags.get(id) ?? null
	}

	async findMany(filters?: FeatureFlagQueryFilters): Promise<FeatureFlag[]> {
		let result = Array.from(this.flags.values())

		if (filters) {
			if (filters.key) {
				const keyFilter = filters.key
				result = result.filter((f) => f.key.value.includes(keyFilter))
			}
			if (filters.name) {
				const search = filters.name.toLowerCase()
				result = result.filter((f) => f.name.value.toLowerCase().includes(search))
			}
			if (filters.status) {
				result = result.filter((f) => f.status === filters.status)
			}
			if (filters.statuses && filters.statuses.length > 0) {
				const statusesFilter = filters.statuses
				result = result.filter((f) => statusesFilter.includes(f.status))
			}
			if (filters.hasVariantKey) {
				result = result.filter((f) => f.variants.some((v) => v.key === filters.hasVariantKey))
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

	async findOne(filters: FeatureFlagQueryFilters): Promise<FeatureFlag | null> {
		const results = await this.findMany({ ...filters, limit: 1 })
		return results[0] ?? null
	}

	async findByStatus(status: FeatureFlagStatus): Promise<FeatureFlag[]> {
		return this.findMany({ status })
	}

	async findActive(): Promise<FeatureFlag[]> {
		return Array.from(this.flags.values()).filter((f) => f.isActive)
	}

	async findByKeys(keys: readonly string[]): Promise<FeatureFlag[]> {
		return keys
			.map((key) => {
				const id = this.keyToId.get(key)
				return id ? this.flags.get(id) : undefined
			})
			.filter((f): f is FeatureFlag => f !== undefined)
	}

	async findDependentFlags(flagKey: string): Promise<FeatureFlag[]> {
		return Array.from(this.flags.values()).filter((f) => f.dependencies.some((dep) => dep.flagKey === flagKey))
	}

	async count(filters?: FeatureFlagQueryFilters): Promise<number> {
		if (!filters) {
			return this.flags.size
		}
		const results = await this.findMany({ ...filters, limit: undefined, offset: undefined })
		return results.length
	}

	async exists(id: string): Promise<boolean> {
		return this.flags.has(id)
	}

	async existsByKey(key: string): Promise<boolean> {
		return this.keyToId.has(key)
	}

	/**
	 * Clears all data from the repository.
	 * Useful for test cleanup.
	 */
	clear(): void {
		this.flags.clear()
		this.keyToId.clear()
	}

	/**
	 * Seeds the repository with test data.
	 * @param flags - Array of feature flags to add
	 */
	seed(flags: FeatureFlag[]): void {
		for (const flag of flags) {
			this.flags.set(flag.id.value, flag)
			this.keyToId.set(flag.key.value, flag.id.value)
		}
	}

	/**
	 * Returns all feature flags in the repository.
	 * Useful for test assertions.
	 */
	getAll(): FeatureFlag[] {
		return Array.from(this.flags.values())
	}

	/**
	 * Returns the current size of the repository.
	 */
	get size(): number {
		return this.flags.size
	}

	private getSortValue(flag: FeatureFlag, field: string): string | Date {
		switch (field) {
			case 'key':
				return flag.key.value
			case 'name':
				return flag.name.value
			case 'status':
				return flag.status
			case 'createdAt':
				return flag.createdAt
			case 'updatedAt':
				return flag.updatedAt
			default:
				return flag.id.value
		}
	}
}
