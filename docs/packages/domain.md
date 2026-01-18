# Domain Package (@foundry/domain)

The domain package contains the core business logic following Domain-Driven Design principles.

## Overview

| Property | Value |
|----------|-------|
| Package | `@foundry/domain` |
| Location | `packages/domain` |
| Purpose | Domain entities, value objects, and business rules |
| Dependencies | `@foundry/error`, `zod` |

## Package Structure

```
packages/domain/src/
├── index.ts                    # Main exports
├── User/                       # User bounded context
│   ├── index.ts
│   ├── User.entity.ts          # Aggregate root
│   ├── user.enum.ts            # Status definitions
│   ├── user.error.ts           # Domain errors
│   ├── user.event.ts           # Domain events
│   ├── user.repository.ts      # Repository interface
│   ├── user.service.ts         # Domain service
│   ├── user.mapper.ts          # Entity mapper
│   └── value-objects/
│       ├── UserId.vo.ts
│       ├── FullName.vo.ts
│       └── Locale.vo.ts
├── FeatureFlag/                # FeatureFlag bounded context
│   ├── index.ts
│   ├── FeatureFlag.entity.ts   # Aggregate root
│   ├── featureflag.enum.ts     # Enums and operators
│   ├── featureflag.error.ts    # Domain errors
│   ├── featureflag.event.ts    # Domain events
│   ├── featureflag.repository.ts
│   ├── featureflag.service.ts  # Evaluation logic
│   ├── featureflag.mapper.ts
│   └── value-objects/
│       ├── FeatureFlagId.vo.ts
│       ├── FeatureFlagKey.vo.ts
│       ├── FeatureFlagName.vo.ts
│       ├── Variant.vo.ts
│       ├── TargetingRule.vo.ts
│       ├── Segment.vo.ts
│       ├── Schedule.vo.ts
│       └── Dependency.vo.ts
└── Auth/                       # Auth bounded context
    ├── index.ts
    ├── Auth.entity.ts          # Aggregate root (RefreshToken)
    ├── auth.enum.ts            # Token status definitions
    ├── auth.error.ts           # Domain errors
    ├── auth.event.ts           # Domain events
    ├── auth.repository.ts      # Repository interface
    └── value-objects/
        ├── TokenId.vo.ts
        ├── RefreshToken.vo.ts
        └── TokenExpiry.vo.ts
```

## User Bounded Context

### User Entity (Aggregate Root)

The User entity represents a system user with full lifecycle management.

```typescript
import { User } from '@foundry/domain'

// Create a new user
const user = User.create({
  fullName: 'John Doe',
  locale: 'en-US'
})

// Update user
const updated = user.update({
  fullName: 'Jane Doe',
  locale: 'pt-BR'
})

// Soft delete
const deleted = user.delete()

// Restore deleted user
const restored = deleted.restore()

// Access properties
console.log(user.id.value)        // UUID
console.log(user.fullName.value)  // 'John Doe'
console.log(user.locale.value)    // 'en-US'
console.log(user.status)          // UserStatus.ACTIVE

// Get domain events
const events = user.pullDomainEvents()
```

### Value Objects

#### UserId
```typescript
// Generate new ID
const id = UserId.generate()

// Create from existing value
const id = UserId.create('user-123')

// From persistence
const id = UserId.fromPersistence('user-123')

console.log(id.value)  // 'user-123'
```

#### FullName
```typescript
const name = FullName.create('John Doe')
console.log(name.value)  // 'John Doe'

// Validation: 1-255 characters, auto-trimmed
FullName.create('')  // throws error
FullName.create('  John Doe  ')  // 'John Doe'
```

#### Locale
```typescript
const locale = Locale.create('en-US')

console.log(locale.value)      // 'en-US'
console.log(locale.language)   // 'en'
console.log(locale.region)     // 'US'

// Supported locales
Locale.getSupportedLocales()
// ['en', 'en-US', 'en-GB', 'pt', 'pt-BR', 'es', 'es-ES', 'fr', 'de', 'it']
```

### User Status Enum

```typescript
import { UserStatus, isValidTransition } from '@foundry/domain'

// Available statuses
UserStatus.ACTIVE     // User is active
UserStatus.INACTIVE   // User is inactive but can be reactivated
UserStatus.SUSPENDED  // User account is suspended

// Check valid transitions
isValidTransition(UserStatus.ACTIVE, UserStatus.INACTIVE)    // true
isValidTransition(UserStatus.ACTIVE, UserStatus.SUSPENDED)   // true
isValidTransition(UserStatus.SUSPENDED, UserStatus.ACTIVE)   // true
```

### User Repository Interface

```typescript
interface IUserRepository {
  // Create/Update
  create(user: User): Promise<string>
  save(id: string, user: User): Promise<void>
  update(user: User): Promise<void>
  remove(id: string): Promise<void>

  // Query
  findById(id: string): Promise<User | null>
  findMany(filters?: UserQueryFilters): Promise<User[]>
  findOne(filters: UserQueryFilters): Promise<User | null>
  findByStatus(status: UserStatus): Promise<User[]>
  count(filters?: UserQueryFilters): Promise<number>
  exists(id: string): Promise<boolean>
}

// Query filters
interface UserQueryFilters {
  fullName?: string
  status?: UserStatus
  locale?: string
  includeDeleted?: boolean
  limit?: number
  offset?: number
  sortBy?: 'fullName' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}
```

### User Domain Events

```typescript
// UserCreatedEvent
{
  eventId: 'uuid',
  eventType: 'UserCreated',
  aggregateId: 'user-id',
  aggregateType: 'User',
  eventVersion: 1,
  occurredOn: Date,
  eventData: { userId: 'user-id' }
}

// UserUpdatedEvent
{
  eventType: 'UserUpdated',
  eventData: {
    userId: 'user-id',
    changes: {
      fullName: { from: 'Old Name', to: 'New Name' }
    }
  }
}

// UserDeletedEvent
{
  eventType: 'UserDeleted',
  eventData: {
    userId: 'user-id',
    deletedAt: Date
  }
}
```

## FeatureFlag Bounded Context

### FeatureFlag Entity (Aggregate Root)

```typescript
import { FeatureFlag } from '@foundry/domain'

// Create a new feature flag
const flag = FeatureFlag.create({
  key: 'new-checkout-flow',
  name: 'New Checkout Flow',
  description: 'Enables the redesigned checkout experience',
  variants: [
    { key: 'control', name: 'Control', type: 'BOOLEAN', value: false, weight: 50 },
    { key: 'treatment', name: 'Treatment', type: 'BOOLEAN', value: true, weight: 50 }
  ],
  percentageRollout: 100
})

// Enable/Disable
const enabled = flag.enable()
const disabled = flag.disable()

// Archive
const archived = flag.archive()

// Access properties
console.log(flag.key.value)           // 'new-checkout-flow'
console.log(flag.status)              // FeatureFlagStatus.DRAFT
console.log(flag.isEnabled)           // false
console.log(flag.variants)            // Variant[]
```

### Value Objects

#### Variant (A/B Testing)

```typescript
const variant = Variant.create({
  key: 'treatment-a',
  name: 'Treatment A',
  type: VariantType.STRING,
  value: 'blue-button',
  weight: 33,
  description: 'Blue button variant'
})

// Variant types
VariantType.BOOLEAN  // true/false
VariantType.STRING   // text value
VariantType.NUMBER   // numeric value
VariantType.JSON     // complex object
```

#### TargetingRule

```typescript
const rule = TargetingRule.create({
  id: 'rule-1',
  name: 'Beta Users',
  priority: 1,
  conditions: [
    {
      attribute: 'userType',
      attributeType: AttributeType.STRING,
      operator: TargetingOperator.EQUALS,
      value: 'beta'
    }
  ],
  conditionLogic: 'AND',
  variantKey: 'treatment',
  enabled: true
})
```

#### Targeting Operators

```typescript
// String operators
TargetingOperator.EQUALS
TargetingOperator.NOT_EQUALS
TargetingOperator.CONTAINS
TargetingOperator.NOT_CONTAINS
TargetingOperator.STARTS_WITH
TargetingOperator.ENDS_WITH
TargetingOperator.MATCHES  // regex

// Numeric operators
TargetingOperator.GREATER_THAN
TargetingOperator.GREATER_THAN_OR_EQUALS
TargetingOperator.LESS_THAN
TargetingOperator.LESS_THAN_OR_EQUALS

// Array operators
TargetingOperator.IN
TargetingOperator.NOT_IN

// Semver operators
TargetingOperator.SEMVER_EQUALS
TargetingOperator.SEMVER_GREATER_THAN
TargetingOperator.SEMVER_LESS_THAN

// Date operators
TargetingOperator.BEFORE
TargetingOperator.AFTER

// Existence operators
TargetingOperator.EXISTS
TargetingOperator.NOT_EXISTS
```

#### Segment

```typescript
const segment = Segment.create({
  id: 'segment-1',
  name: 'Power Users',
  matchType: SegmentMatchType.ALL,  // ALL conditions must match
  conditions: [
    { attribute: 'planType', operator: 'EQUALS', value: 'premium' },
    { attribute: 'loginCount', operator: 'GREATER_THAN', value: 50 }
  ],
  userIds: ['specific-user-1'],      // Explicit inclusions
  excludedUserIds: ['banned-user'],  // Explicit exclusions
  priority: 1,
  enabled: true
})
```

#### Schedule

```typescript
const schedule = Schedule.create({
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-02-15'),
  timezone: 'America/New_York',
  recurring: {
    daysOfWeek: [1, 2, 3, 4, 5],  // Monday-Friday
    startTime: '09:00',
    endTime: '17:00'
  }
})

// Check if schedule is active
schedule.isActiveAt(new Date())  // boolean
```

#### Dependency

```typescript
const dependency = Dependency.create({
  flagKey: 'prerequisite-flag',
  enabled: true,                    // Require flag to be enabled
  variantKey: 'treatment'           // Optional: require specific variant
})
```

### FeatureFlag Domain Service

```typescript
interface IFeatureFlagDomainService {
  // Main evaluation
  evaluate(flag: FeatureFlag, context: EvaluationContext): Promise<EvaluationResult>

  // Bucketing (consistent hashing)
  calculateBucket(flagKey: string, salt: string, userId: string): number
  selectVariant(flag: FeatureFlag, userId: string): Variant | null
  isInRolloutPercentage(flag: FeatureFlag, userId: string): boolean

  // Validation
  validateFlag(flag: FeatureFlag): ValidationViolation[]
  validateDependencies(flag: FeatureFlag, allFlags: FeatureFlag[]): ValidationViolation[]

  // Dependencies
  areDependenciesMet(flag: FeatureFlag, allFlags: FeatureFlag[], ctx: EvaluationContext): boolean
}

// Evaluation result
interface EvaluationResult {
  flagKey: string
  enabled: boolean
  variant: Variant | null
  reason: EvaluationReason
  ruleId?: string
  segmentId?: string
  evaluationTimeMs: number
}

// Reasons for evaluation decision
type EvaluationReason =
  | 'DEFAULT_VALUE'
  | 'TARGETING_MATCH'
  | 'SEGMENT_MATCH'
  | 'SCHEDULE_MATCH'
  | 'ROLLOUT_PERCENTAGE'
  | 'FLAG_DISABLED'
  | 'FLAG_NOT_FOUND'
  | 'DEPENDENCY_NOT_MET'
  | 'ERROR'
```

## Error Handling

### User Domain Errors

```typescript
import { UserDomainError, UserErrorCode } from '@foundry/domain'

// Error codes
UserErrorCode.NOT_FOUND
UserErrorCode.ALREADY_EXISTS
UserErrorCode.CREATION_FAILED
UserErrorCode.UPDATE_FAILED
UserErrorCode.DELETE_FAILED
UserErrorCode.INVALID_INPUT
UserErrorCode.INVALID_STATUS
UserErrorCode.INVALID_TRANSITION
UserErrorCode.BUSINESS_RULE_VIOLATION
UserErrorCode.INSUFFICIENT_PERMISSIONS
UserErrorCode.OPERATION_NOT_ALLOWED

// Check error type
if (isUserDomainError(error)) {
  console.log(error.code)
  console.log(error.message)
}
```

### FeatureFlag Domain Errors

```typescript
import { FeatureFlagDomainError, FeatureFlagErrorCode } from '@foundry/domain'

// Error codes
FeatureFlagErrorCode.NOT_FOUND
FeatureFlagErrorCode.ALREADY_EXISTS
FeatureFlagErrorCode.INVALID_KEY
FeatureFlagErrorCode.INVALID_VARIANT
FeatureFlagErrorCode.INVALID_TARGETING_RULE
FeatureFlagErrorCode.INVALID_SCHEDULE
FeatureFlagErrorCode.INVALID_SEGMENT
FeatureFlagErrorCode.CIRCULAR_DEPENDENCY
FeatureFlagErrorCode.DEPENDENCY_NOT_FOUND
FeatureFlagErrorCode.VARIANT_WEIGHTS_INVALID
FeatureFlagErrorCode.MINIMUM_VARIANTS_REQUIRED
FeatureFlagErrorCode.CANNOT_DELETE_ACTIVE
```

## Auth Bounded Context

### Auth Entity (Aggregate Root)

The Auth entity represents a refresh token for authentication.

```typescript
import { Auth, TokenStatus } from '@foundry/domain'

// Create a new refresh token
const auth = Auth.createRefreshToken({
  userId: 'user-123',
  expiresInDays: 30  // Optional, defaults to 30
})

// Access properties
console.log(auth.id.value)        // Token ID (UUID)
console.log(auth.token.value)     // The refresh token string
console.log(auth.userId)          // Associated user ID
console.log(auth.status)          // TokenStatus.ACTIVE
console.log(auth.expiresAt.value) // Expiration date

// Check token state
auth.isValid()    // true if active and not expired
auth.isExpired()  // true if past expiration date
auth.isRevoked()  // true if status is REVOKED

// Revoke the token
const revoked = auth.revoke()

// Mark as expired
const expired = auth.markExpired()

// Get domain events
const events = auth.domainEvents
auth.clearDomainEvents()
```

### Value Objects

#### TokenId
```typescript
import { TokenId } from '@foundry/domain'

// Create from existing value
const id = TokenId.create('token-uuid-123')

console.log(id.value)  // 'token-uuid-123'
```

#### RefreshToken
```typescript
import { RefreshToken } from '@foundry/domain'

// Generate a new secure token
const token = RefreshToken.generate()

// Create from existing value
const token = RefreshToken.create('existing-token-value')

console.log(token.value)  // The token string
```

#### TokenExpiry
```typescript
import { TokenExpiry } from '@foundry/domain'

// Create from days in future
const expiry = TokenExpiry.fromDays(30)

// Create from specific date
const expiry = TokenExpiry.create(new Date('2024-12-31'))

console.log(expiry.value)     // Date object
console.log(expiry.isExpired()) // boolean
```

### Token Status Enum

```typescript
import { TokenStatus, isValidTokenStatus, getTokenStatusLabel } from '@foundry/domain'

// Available statuses
TokenStatus.ACTIVE   // Token is active and can be used
TokenStatus.REVOKED  // Token has been revoked (logout)
TokenStatus.EXPIRED  // Token has expired

// Validate status
isValidTokenStatus('ACTIVE')  // true

// Get human-readable label
getTokenStatusLabel(TokenStatus.ACTIVE)  // 'Active'
```

### Auth Repository Interface

```typescript
interface IAuthRepository {
  // Create/Update
  create(auth: Auth): Promise<string>
  save(id: string, auth: Auth): Promise<void>
  update(auth: Auth): Promise<void>
  remove(id: string): Promise<void>

  // Query
  findById(id: string): Promise<Auth | null>
  findByToken(token: string): Promise<Auth | null>
  findByUserId(userId: string): Promise<Auth[]>
  findMany(filters?: AuthQueryFilters): Promise<Auth[]>
  countActiveTokens(userId: string): Promise<number>
  exists(id: string): Promise<boolean>

  // Operations
  revokeToken(id: string): Promise<void>
  revokeAllUserTokens(userId: string): Promise<void>
  deleteExpiredTokens(): Promise<number>
}

// Query filters
interface AuthQueryFilters {
  userId?: string
  status?: TokenStatus
  includeExpired?: boolean
  limit?: number
  offset?: number
}
```

### Auth Domain Events

```typescript
// RefreshTokenCreatedEvent
{
  eventId: 'uuid',
  eventType: 'RefreshTokenCreated',
  aggregateId: 'token-id',
  aggregateType: 'Auth',
  eventVersion: 1,
  occurredOn: Date,
  eventData: {
    tokenId: 'token-id',
    userId: 'user-id',
    expiresAt: Date
  }
}

// RefreshTokenRevokedEvent
{
  eventType: 'RefreshTokenRevoked',
  eventData: {
    tokenId: 'token-id',
    userId: 'user-id',
    revokedAt: Date
  }
}

// UserLoggedInEvent
{
  eventType: 'UserLoggedIn',
  eventData: {
    userId: 'user-id',
    email: 'user@example.com',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...'
  }
}

// UserLoggedOutEvent
{
  eventType: 'UserLoggedOut',
  eventData: {
    userId: 'user-id',
    tokenId: 'token-id'
  }
}

// UserRegisteredEvent
{
  eventType: 'UserRegistered',
  eventData: {
    userId: 'user-id',
    email: 'user@example.com'
  }
}
```

## Usage Example

```typescript
import { User, FeatureFlag, IUserRepository } from '@foundry/domain'

class UserService {
  constructor(private userRepo: IUserRepository) {}

  async createUser(fullName: string, locale: string): Promise<string> {
    // Create domain entity
    const user = User.create({ fullName, locale })

    // Persist via repository
    const userId = await this.userRepo.create(user)

    // Handle domain events
    const events = user.pullDomainEvents()
    for (const event of events) {
      await this.eventBus.publish(event)
    }

    return userId
  }

  async updateUser(id: string, fullName?: string, locale?: string): Promise<void> {
    const user = await this.userRepo.findById(id)
    if (!user) throw new Error('User not found')

    const updated = user.update({ fullName, locale })
    await this.userRepo.update(updated)

    const events = updated.pullDomainEvents()
    for (const event of events) {
      await this.eventBus.publish(event)
    }
  }
}
```
