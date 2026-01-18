# Feature Flags Package (@foundry/feature-flags)

Dynamic feature management system supporting A/B testing, targeting rules, user segmentation, and analytics.

## Overview

| Property | Value |
|----------|-------|
| Package | `@foundry/feature-flags` |
| Location | `kernel/feature-flags` |
| Purpose | Feature toggles and A/B testing |
| Dependencies | `@foundry/domain`, `@foundry/error`, `zod` |

## Core Features

- Boolean and multivariate feature flags
- A/B testing with weighted variants
- User targeting with conditions
- User segmentation
- Percentage-based rollouts
- Time-based scheduling
- Flag dependencies
- Consistent bucketing (MurmurHash3)
- Caching with TTL
- Analytics tracking

## Getting Started

### Basic Usage

```typescript
import { createFeatureFlagService } from '@foundry/feature-flags'

// Create service
const flagService = createFeatureFlagService({
  cacheEnabled: true,
  cacheTTL: 60000,  // 1 minute
  analyticsEnabled: true
})

// Register a flag
await flagService.registerFlag({
  key: 'new-checkout',
  name: 'New Checkout Flow',
  enabled: true,
  status: 'ACTIVE',
  variants: [
    { key: 'control', name: 'Control', type: 'BOOLEAN', value: false, weight: 50 },
    { key: 'treatment', name: 'Treatment', type: 'BOOLEAN', value: true, weight: 50 }
  ],
  percentageRollout: 100,
  salt: 'random-salt-123'
})

// Evaluate for a user
const result = await flagService.evaluate('new-checkout', {
  userId: 'user-123',
  attributes: {
    country: 'US',
    planType: 'premium'
  }
})

if (result.enabled && result.variant?.value === true) {
  showNewCheckout()
} else {
  showOldCheckout()
}
```

## Flag Configuration

### Basic Flag

```typescript
const flag = {
  key: 'dark-mode',
  name: 'Dark Mode',
  description: 'Enable dark mode for users',
  enabled: true,
  status: 'ACTIVE',  // DRAFT, ACTIVE, INACTIVE, ARCHIVED
  percentageRollout: 100,
  salt: 'unique-salt'
}
```

### Multivariate Flag (A/B/C Testing)

```typescript
const flag = {
  key: 'button-color',
  name: 'Button Color Test',
  enabled: true,
  status: 'ACTIVE',
  variants: [
    { key: 'control', name: 'Blue', type: 'STRING', value: '#0066cc', weight: 34 },
    { key: 'variant-a', name: 'Green', type: 'STRING', value: '#00cc66', weight: 33 },
    { key: 'variant-b', name: 'Red', type: 'STRING', value: '#cc0066', weight: 33 }
  ],
  defaultVariantKey: 'control',
  percentageRollout: 100,
  salt: 'button-test-salt'
}
```

### Variant Types

```typescript
// Boolean variant
{ key: 'enabled', type: 'BOOLEAN', value: true, weight: 50 }

// String variant
{ key: 'message', type: 'STRING', value: 'Hello!', weight: 50 }

// Number variant
{ key: 'limit', type: 'NUMBER', value: 100, weight: 50 }

// JSON variant (complex config)
{ key: 'config', type: 'JSON', value: { theme: 'dark', fontSize: 14 }, weight: 50 }
```

## Targeting Rules

### Condition-Based Targeting

```typescript
const flag = {
  key: 'beta-feature',
  enabled: true,
  targetingRules: [
    {
      id: 'rule-1',
      name: 'Beta Users',
      priority: 1,
      enabled: true,
      conditions: [
        {
          attribute: 'userType',
          attributeType: 'STRING',
          operator: 'EQUALS',
          value: 'beta'
        }
      ],
      conditionLogic: 'AND',
      variantKey: 'treatment'  // Serve this variant
    },
    {
      id: 'rule-2',
      name: 'US Premium Users',
      priority: 2,
      enabled: true,
      conditions: [
        { attribute: 'country', operator: 'EQUALS', value: 'US' },
        { attribute: 'planType', operator: 'EQUALS', value: 'premium' }
      ],
      conditionLogic: 'AND',
      variantKey: 'treatment'
    }
  ]
}
```

### Targeting Operators

```typescript
// String operators
'EQUALS'           // Exact match
'NOT_EQUALS'       // Not equal
'CONTAINS'         // Contains substring
'NOT_CONTAINS'     // Does not contain
'STARTS_WITH'      // Starts with
'ENDS_WITH'        // Ends with
'MATCHES'          // Regex match

// Numeric operators
'GREATER_THAN'
'GREATER_THAN_OR_EQUALS'
'LESS_THAN'
'LESS_THAN_OR_EQUALS'

// Array operators
'IN'               // Value in array
'NOT_IN'           // Value not in array

// Version operators (semver)
'SEMVER_EQUALS'
'SEMVER_GREATER_THAN'
'SEMVER_LESS_THAN'
'SEMVER_GREATER_THAN_OR_EQUALS'
'SEMVER_LESS_THAN_OR_EQUALS'

// Date operators
'BEFORE'           // Before date
'AFTER'            // After date

// Existence operators
'EXISTS'           // Attribute exists
'NOT_EXISTS'       // Attribute doesn't exist
```

### Attribute Types

```typescript
'STRING'    // Text values
'NUMBER'    // Numeric values
'BOOLEAN'   // True/false
'DATE'      // Date values
'VERSION'   // Semver strings
'ARRAY'     // Array of values
```

## User Segmentation

### Segment Definition

```typescript
const flag = {
  key: 'premium-feature',
  enabled: true,
  segments: [
    {
      id: 'segment-1',
      key: 'power-users',
      name: 'Power Users',
      matchType: 'ALL',  // ALL conditions must match
      conditions: [
        { attribute: 'loginCount', operator: 'GREATER_THAN', value: 50 },
        { attribute: 'accountAge', operator: 'GREATER_THAN', value: 30 }
      ],
      targetVariantKey: 'treatment',
      priority: 1,
      enabled: true
    },
    {
      id: 'segment-2',
      key: 'vip-users',
      name: 'VIP Users',
      matchType: 'ANY',  // ANY condition matches
      userIds: ['vip-user-1', 'vip-user-2'],  // Explicit whitelist
      excludedUserIds: ['banned-user'],       // Explicit blacklist
      targetVariantKey: 'treatment',
      priority: 2,
      enabled: true
    }
  ]
}
```

### Match Types

- `ALL`: All conditions must match (AND logic)
- `ANY`: At least one condition must match (OR logic)

## Percentage Rollouts

### Gradual Rollout

```typescript
const flag = {
  key: 'new-feature',
  enabled: true,
  percentageRollout: 10,  // 10% of users
  salt: 'rollout-salt'
}

// Increase over time
await flagService.updateFlag('new-feature', {
  percentageRollout: 25  // Now 25%
})

// Full rollout
await flagService.updateFlag('new-feature', {
  percentageRollout: 100
})
```

### Consistent Bucketing

Users always get the same experience:

```typescript
import { BucketingService } from '@foundry/feature-flags'

const bucketing = new BucketingService()

// Same user always gets same bucket (0-100)
const bucket = bucketing.calculateBucket('new-feature', 'salt', 'user-123')
// bucket: 42 (deterministic based on inputs)

// If percentageRollout >= bucket, user is included
const isIncluded = bucket <= flag.percentageRollout
```

## Time-Based Scheduling

```typescript
const flag = {
  key: 'holiday-sale',
  enabled: true,
  schedules: [
    {
      startDate: new Date('2024-12-20T00:00:00Z'),
      endDate: new Date('2024-12-26T23:59:59Z'),
      timezone: 'America/New_York'
    }
  ]
}

// Recurring schedule (weekdays only)
const flag = {
  key: 'business-hours-feature',
  enabled: true,
  schedules: [
    {
      startDate: new Date('2024-01-01'),
      timezone: 'America/New_York',
      recurring: {
        daysOfWeek: [1, 2, 3, 4, 5],  // Mon-Fri
        startTime: '09:00',
        endTime: '17:00'
      }
    }
  ]
}
```

## Flag Dependencies

```typescript
const flag = {
  key: 'advanced-feature',
  enabled: true,
  dependencies: [
    {
      flagKey: 'basic-feature',
      enabled: true  // basic-feature must be enabled
    },
    {
      flagKey: 'ab-test',
      variantKey: 'treatment'  // User must be in treatment variant
    }
  ]
}
```

## Evaluation Engine

### Evaluation Result

```typescript
interface EvaluationResult {
  flagKey: string
  enabled: boolean
  variant: {
    key: string
    name: string
    value: unknown
    type: VariantType
  } | null
  reason: EvaluationReason
  ruleId?: string       // Which rule matched
  segmentId?: string    // Which segment matched
  cached: boolean
  evaluationTimeMs: number
}

// Evaluation reasons
type EvaluationReason =
  | 'DEFAULT_VALUE'       // No rules matched, using default
  | 'TARGETING_MATCH'     // Targeting rule matched
  | 'SEGMENT_MATCH'       // User segment matched
  | 'SCHEDULE_MATCH'      // Schedule is active
  | 'ROLLOUT_PERCENTAGE'  // User in rollout percentage
  | 'FLAG_DISABLED'       // Flag is disabled
  | 'FLAG_NOT_FOUND'      // Flag doesn't exist
  | 'DEPENDENCY_NOT_MET'  // Dependency flag not satisfied
  | 'ERROR'               // Evaluation error
```

### Evaluation Context

```typescript
const context = {
  userId: 'user-123',            // Required for bucketing
  sessionId: 'session-456',      // Optional session tracking
  attributes: {
    // User attributes for targeting
    country: 'US',
    planType: 'premium',
    accountAge: 365,
    appVersion: '2.1.0',
    deviceType: 'mobile',
    tags: ['beta', 'power-user']
  }
}

const result = await flagService.evaluate('feature-key', context)
```

## Caching

```typescript
import { CacheManager } from '@foundry/feature-flags'

const cacheManager = new CacheManager({
  ttl: 60000,           // Cache for 1 minute
  maxSize: 1000,        // Max cached flags
  warmOnStartup: true,  // Pre-warm cache
  staleWhileRevalidate: true  // Serve stale while refreshing
})

const flagService = createFeatureFlagService({
  cacheManager,
  flagProvider: databaseFlagProvider  // Your data source
})

// Cache stats
const stats = cacheManager.getStats()
// { hits: 1000, misses: 50, size: 100, hitRate: 0.95 }

// Manual invalidation
cacheManager.invalidate('feature-key')
cacheManager.clear()
```

## Analytics

```typescript
import { AnalyticsCollector } from '@foundry/feature-flags'

const analytics = new AnalyticsCollector({
  handlers: [
    async (events) => {
      await analyticsDB.bulkInsert(events)
    }
  ]
})

const flagService = createFeatureFlagService({
  analyticsCollector: analytics
})

// Track custom conversion
analytics.trackConversion({
  flagKey: 'checkout-redesign',
  userId: 'user-123',
  conversionType: 'purchase',
  value: 99.99,
  metadata: { productId: 'prod-456' }
})
```

### Analytics Events

```typescript
// Automatically tracked
{
  type: 'evaluation',
  flagKey: 'feature-key',
  userId: 'user-123',
  variantKey: 'treatment',
  enabled: true,
  reason: 'TARGETING_MATCH',
  evaluationTimeMs: 2,
  timestamp: Date
}

// Conversion tracking
{
  type: 'conversion',
  flagKey: 'feature-key',
  userId: 'user-123',
  conversionType: 'signup',
  value: 1,
  timestamp: Date
}
```

## Flag Provider Interface

Implement to load flags from your data source:

```typescript
interface FlagProvider {
  getFlag(key: string): Promise<FlagData | null>
  getAllFlags(): Promise<FlagData[]>
  getFlagsByKeys(keys: string[]): Promise<FlagData[]>
}

// Example: Database provider
class DatabaseFlagProvider implements FlagProvider {
  constructor(private db: Database) {}

  async getFlag(key: string): Promise<FlagData | null> {
    return this.db.featureFlags.findByKey(key)
  }

  async getAllFlags(): Promise<FlagData[]> {
    return this.db.featureFlags.findAll()
  }

  async getFlagsByKeys(keys: string[]): Promise<FlagData[]> {
    return this.db.featureFlags.findByKeys(keys)
  }
}
```

## Integration Example

```typescript
import { createFeatureFlagService, AnalyticsCollector, CacheManager } from '@foundry/feature-flags'

// Setup
const cacheManager = new CacheManager({ ttl: 60000 })
const analytics = new AnalyticsCollector({
  handlers: [async (events) => analyticsService.track(events)]
})

const flagService = createFeatureFlagService({
  flagProvider: new DatabaseFlagProvider(db),
  cacheManager,
  analyticsCollector: analytics,
  defaultValues: {
    'unknown-flag': { enabled: false, variant: null }
  }
})

// React integration
function useFeatureFlag(key: string) {
  const [result, setResult] = useState(null)
  const user = useCurrentUser()

  useEffect(() => {
    flagService.evaluate(key, {
      userId: user.id,
      attributes: {
        country: user.country,
        plan: user.plan
      }
    }).then(setResult)
  }, [key, user.id])

  return result
}

// Usage in component
function Checkout() {
  const flag = useFeatureFlag('new-checkout')

  if (flag?.enabled) {
    return <NewCheckoutFlow />
  }

  return <OldCheckoutFlow />
}
```

## Best Practices

1. **Use meaningful keys**: `checkout-redesign-v2` not `flag123`
2. **Set default variants**: Handle case when flag doesn't exist
3. **Use salt consistently**: Same salt = same bucketing
4. **Clean up old flags**: Archive inactive flags regularly
5. **Monitor evaluation time**: Keep evaluations fast (<10ms)
6. **Test targeting rules**: Verify rules before enabling
7. **Use segments for reuse**: Define segments once, use across flags
8. **Track conversions**: Measure impact of variants
