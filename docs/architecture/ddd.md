# Domain-Driven Design Patterns

This document explains the DDD patterns implemented in the Foundry architecture.

## Bounded Contexts

A bounded context is a logical boundary within which a particular domain model is defined and applicable.

### Current Bounded Contexts

#### User Context
Responsible for user identity and lifecycle management.

```
packages/domain/src/User/
├── User.entity.ts          # Aggregate root
├── value-objects/
│   ├── UserId.vo.ts        # User identifier
│   ├── FullName.vo.ts      # Name value object
│   └── Locale.vo.ts        # Localization settings
├── user.enum.ts            # Status definitions
├── user.error.ts           # Domain errors
├── user.event.ts           # Domain events
├── user.repository.ts      # Repository interface
└── user.service.ts         # Domain service
```

#### FeatureFlag Context
Manages feature toggles, A/B testing, and progressive rollouts.

```
packages/domain/src/FeatureFlag/
├── FeatureFlag.entity.ts   # Aggregate root
├── value-objects/
│   ├── FeatureFlagId.vo.ts
│   ├── FeatureFlagKey.vo.ts
│   ├── FeatureFlagName.vo.ts
│   ├── Variant.vo.ts       # A/B test variant
│   ├── TargetingRule.vo.ts # Condition rules
│   ├── Segment.vo.ts       # User segments
│   ├── Schedule.vo.ts      # Time-based activation
│   └── Dependency.vo.ts    # Flag dependencies
├── featureflag.enum.ts
├── featureflag.error.ts
├── featureflag.event.ts
├── featureflag.repository.ts
└── featureflag.service.ts
```

#### Auth Context
Manages authentication, refresh tokens, and SSO integration.

```
packages/domain/src/Auth/
├── Auth.entity.ts          # Aggregate root (RefreshToken)
├── value-objects/
│   ├── TokenId.vo.ts       # Token identifier
│   ├── RefreshToken.vo.ts  # Token value
│   └── TokenExpiry.vo.ts   # Expiration handling
├── auth.enum.ts            # Token status (ACTIVE, REVOKED, EXPIRED)
├── auth.error.ts           # Domain errors
├── auth.event.ts           # Domain events
└── auth.repository.ts      # Repository interface
```

## Aggregates

An aggregate is a cluster of domain objects that can be treated as a single unit.

### Aggregate Root Pattern

The aggregate root is the only entry point for modifications:

```typescript
// User Aggregate Root
class User {
  private constructor(
    private readonly id: UserId,
    private fullName: FullName,
    private locale: Locale,
    private status: UserStatus,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
    private readonly domainEvents: BaseUserEvent[]
  ) {}

  // Factory method - only way to create
  static create(props: { fullName: string; locale?: string }): User {
    const user = new User(
      UserId.generate(),
      FullName.create(props.fullName),
      Locale.create(props.locale ?? 'en-US'),
      UserStatus.ACTIVE,
      new Date(),
      new Date(),
      null,
      []
    )
    user.recordEvent(createUserCreatedEvent(user.id.value))
    return user
  }

  // Modification method with invariant checks
  update(props: { fullName?: string; locale?: string }): User {
    const changes: Record<string, { from: unknown; to: unknown }> = {}

    // Track changes for event
    if (props.fullName) {
      changes.fullName = { from: this.fullName.value, to: props.fullName }
    }

    // Return new instance (immutability)
    const updated = new User(
      this.id,
      props.fullName ? FullName.create(props.fullName) : this.fullName,
      props.locale ? Locale.create(props.locale) : this.locale,
      this.status,
      this.createdAt,
      new Date(),
      this.deletedAt,
      [...this.domainEvents]
    )
    updated.recordEvent(createUserUpdatedEvent(this.id.value, changes))
    return updated
  }

  // Domain events collection
  pullDomainEvents(): BaseUserEvent[] {
    const events = [...this.domainEvents]
    this.domainEvents.length = 0
    return events
  }
}
```

### Key Characteristics

1. **Identity**: Aggregates have unique identifiers
2. **Consistency Boundary**: Invariants are enforced within the aggregate
3. **Transactional Boundary**: Persistence is atomic at the aggregate level
4. **Event Production**: State changes produce domain events

## Value Objects

Value objects are immutable objects defined by their attributes, not identity.

### Implementation Pattern

```typescript
export class FullName {
  private constructor(private readonly _value: string) {}

  // Factory with validation
  static create(value: string): FullName {
    const schema = z.string().min(1).max(255)
    const parsed = schema.parse(value.trim())
    return new FullName(parsed)
  }

  // Reconstitution without validation
  static fromPersistence(value: string): FullName {
    return new FullName(value)
  }

  // Immutable access
  get value(): string {
    return this._value
  }

  // Value equality
  equals(other: FullName): boolean {
    return this._value === other._value
  }
}
```

### Complex Value Objects

```typescript
export class Variant {
  private constructor(
    private readonly _key: string,
    private readonly _name: string,
    private readonly _type: VariantType,
    private readonly _value: unknown,
    private readonly _weight: number,
    private readonly _description?: string
  ) {}

  static create(props: VariantProps): Variant {
    // Validate weight (0-100)
    const weightSchema = z.number().min(0).max(100)
    weightSchema.parse(props.weight)

    // Validate value matches type
    this.validateValueType(props.type, props.value)

    return new Variant(
      props.key,
      props.name,
      props.type,
      props.value,
      props.weight,
      props.description
    )
  }

  private static validateValueType(type: VariantType, value: unknown): void {
    switch (type) {
      case VariantType.BOOLEAN:
        z.boolean().parse(value)
        break
      case VariantType.NUMBER:
        z.number().parse(value)
        break
      case VariantType.STRING:
        z.string().parse(value)
        break
      case VariantType.JSON:
        z.record(z.unknown()).parse(value)
        break
    }
  }
}
```

## Domain Events

Domain events represent something that happened in the domain.

### Event Structure

```typescript
interface BaseUserEvent {
  eventId: string           // Unique event ID
  eventType: string         // 'UserCreated', 'UserUpdated', etc.
  aggregateId: string       // User ID
  aggregateType: 'User'     // Aggregate type
  eventVersion: number      // Schema version
  occurredOn: Date          // When it happened
  eventData: Record<string, unknown>  // Event payload
}

// Event factory
function createUserCreatedEvent(userId: string): UserCreatedEvent {
  return {
    eventId: generateUUID(),
    eventType: 'UserCreated',
    aggregateId: userId,
    aggregateType: 'User',
    eventVersion: 1,
    occurredOn: new Date(),
    eventData: { userId }
  }
}
```

### Event Types

**User Events:**
- `UserCreatedEvent`: New user created
- `UserUpdatedEvent`: User properties changed (with change tracking)
- `UserDeletedEvent`: User soft-deleted

**FeatureFlag Events:**
- `FeatureFlagCreatedEvent`: New flag created
- `FeatureFlagEnabledEvent`: Flag activated
- `FeatureFlagDisabledEvent`: Flag deactivated
- `VariantAssignedEvent`: User assigned to variant
- `TargetingRuleMatchedEvent`: Rule matched for user

**Auth Events:**
- `UserLoggedInEvent`: User authenticated successfully
- `UserLoggedOutEvent`: User logged out (token revoked)
- `RefreshTokenCreatedEvent`: New refresh token issued
- `RefreshTokenRevokedEvent`: Refresh token revoked
- `UserRegisteredEvent`: New user registered

## Repository Pattern

Repositories provide collection-like access to aggregates.

### Interface Definition

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

### Key Principles

1. **Aggregate-centric**: Repositories operate on aggregates, not entities
2. **Query encapsulation**: Complex queries are hidden behind the interface
3. **Persistence ignorance**: Domain doesn't know about storage details
4. **Collection semantics**: Act like in-memory collections

## Domain Services

Domain services contain logic that doesn't fit naturally in an entity or value object.

### Examples

```typescript
// Feature Flag evaluation service
interface IFeatureFlagDomainService {
  // Main evaluation logic
  evaluate(
    flag: FeatureFlag,
    context: EvaluationContext
  ): Promise<EvaluationResult>

  // Consistent bucketing for A/B tests
  calculateBucket(flagKey: string, salt: string, userId: string): number
  selectVariant(flag: FeatureFlag, userId: string): Variant | null

  // Validation
  validateFlag(flag: FeatureFlag): ValidationViolation[]
  validateDependencies(flag: FeatureFlag, allFlags: FeatureFlag[]): ValidationViolation[]

  // Dependency resolution
  areDependenciesMet(
    flag: FeatureFlag,
    allFlags: FeatureFlag[],
    context: EvaluationContext
  ): boolean
}
```

### When to Use Domain Services

- Logic spans multiple aggregates
- Complex calculations or algorithms
- External domain concepts (e.g., bucketing algorithms)
- Logic that doesn't belong to any single entity

## Ubiquitous Language

The code uses business terminology consistently:

| Term | Meaning |
|------|---------|
| User | A person using the system |
| FeatureFlag | A toggle controlling feature availability |
| Variant | An A/B test variation |
| Segment | A group of users with shared characteristics |
| TargetingRule | Conditions determining flag behavior |
| Schedule | Time-based flag activation rules |
| Evaluation | Process of determining flag state for a user |
| Rollout | Gradual feature release by percentage |
| RefreshToken | Long-lived token for obtaining new access tokens |
| AccessToken | Short-lived JWT for API authentication |
| TokenRevocation | Invalidating a refresh token (logout) |

## Anti-Corruption Layer

The mappers serve as anti-corruption layers between domain and persistence:

```typescript
// Domain to persistence
export function toUserPersistence(user: User): PersistenceUser {
  return {
    id: user.id.value,
    fullName: user.fullName.value,
    locale: user.locale.value,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt
  }
}

// Persistence to domain
export function toDomainUser(data: PersistenceUser): User {
  return User.fromPersistence({
    id: data.id,
    fullName: data.fullName,
    locale: data.locale,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt
  })
}
```
