import { FeatureFlag, FeatureFlagStatus, VariantType } from '@foundry/domain'

/**
 * Input for creating a feature flag via factory
 */
export interface CreateFeatureFlagInput {
	key?: string
	name?: string
	description?: string
	status?: FeatureFlagStatus
	variants?: Array<{
		key: string
		name: string
		type?: VariantType
		value: unknown
		weight: number
	}>
	defaultVariantKey?: string
}

/**
 * Factory for creating FeatureFlag domain entities in tests.
 *
 * Provides convenient methods for creating feature flags with default values
 * or custom overrides.
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Factory pattern is intentional for test utilities
export class FeatureFlagFactory {
	private static counter = 0

	/**
	 * Creates a single feature flag with optional overrides
	 */
	static create(input: CreateFeatureFlagInput = {}): FeatureFlag {
		FeatureFlagFactory.counter++
		const count = FeatureFlagFactory.counter

		const key = input.key ?? `test-flag-${count}`
		const name = input.name ?? `Test Flag ${count}`
		const description = input.description ?? `Test feature flag ${count}`
		const status = input.status ?? FeatureFlagStatus.ACTIVE

		// Default variants if not provided
		const variants = input.variants ?? [
			{ key: 'on', name: 'Enabled', type: VariantType.BOOLEAN, value: true, weight: 50 },
			{ key: 'off', name: 'Disabled', type: VariantType.BOOLEAN, value: false, weight: 50 },
		]

		const defaultVariantKey = input.defaultVariantKey ?? variants[0]?.key ?? 'on'

		return FeatureFlag.create({
			key,
			name,
			description,
			status,
			variants: variants.map((v) => ({
				key: v.key,
				name: v.name,
				type: v.type ?? VariantType.BOOLEAN,
				value: v.value,
				weight: v.weight,
			})),
			defaultVariantKey,
		})
	}

	/**
	 * Creates multiple feature flags
	 */
	static createMany(count: number, overrides: CreateFeatureFlagInput = {}): FeatureFlag[] {
		return Array.from({ length: count }, (_, i) =>
			FeatureFlagFactory.create({
				...overrides,
				key: overrides.key ? `${overrides.key}-${i}` : undefined,
			}),
		)
	}

	/**
	 * Creates an ACTIVE feature flag
	 */
	static createActive(overrides: Omit<CreateFeatureFlagInput, 'status'> = {}): FeatureFlag {
		return FeatureFlagFactory.create({ ...overrides, status: FeatureFlagStatus.ACTIVE })
	}

	/**
	 * Creates an INACTIVE feature flag
	 */
	static createInactive(overrides: Omit<CreateFeatureFlagInput, 'status'> = {}): FeatureFlag {
		return FeatureFlagFactory.create({ ...overrides, status: FeatureFlagStatus.INACTIVE })
	}

	/**
	 * Creates a DRAFT feature flag
	 */
	static createDraft(overrides: Omit<CreateFeatureFlagInput, 'status'> = {}): FeatureFlag {
		return FeatureFlagFactory.create({ ...overrides, status: FeatureFlagStatus.DRAFT })
	}

	/**
	 * Creates an ARCHIVED feature flag
	 */
	static createArchived(overrides: Omit<CreateFeatureFlagInput, 'status'> = {}): FeatureFlag {
		return FeatureFlagFactory.create({ ...overrides, status: FeatureFlagStatus.ARCHIVED })
	}

	/**
	 * Creates a boolean feature flag (simple on/off)
	 */
	static createBoolean(key: string, defaultEnabled: boolean = false): FeatureFlag {
		return FeatureFlagFactory.create({
			key,
			name: key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
			variants: [
				{ key: 'on', name: 'Enabled', type: VariantType.BOOLEAN, value: true, weight: defaultEnabled ? 100 : 0 },
				{ key: 'off', name: 'Disabled', type: VariantType.BOOLEAN, value: false, weight: defaultEnabled ? 0 : 100 },
			],
			defaultVariantKey: defaultEnabled ? 'on' : 'off',
		})
	}

	/**
	 * Creates a string variant feature flag
	 */
	static createWithStringVariants(
		key: string,
		variants: Array<{ key: string; value: string; weight: number }>,
	): FeatureFlag {
		return FeatureFlagFactory.create({
			key,
			name: key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
			variants: variants.map((v) => ({
				key: v.key,
				name: v.key,
				type: VariantType.STRING,
				value: v.value,
				weight: v.weight,
			})),
			defaultVariantKey: variants[0]?.key,
		})
	}

	/**
	 * Resets the counter (useful between test suites)
	 */
	static reset(): void {
		FeatureFlagFactory.counter = 0
	}
}
