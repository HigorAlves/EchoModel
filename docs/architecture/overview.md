# Architecture Overview

Foundry is an enterprise-grade TypeScript monorepo implementing **Domain-Driven Design (DDD)**, **Hexagonal Architecture (Ports & Adapters)**, and **CQRS (Command Query Responsibility Segregation)** patterns.

## High-Level Architecture

```mermaid
graph TB
    subgraph Presentation["Presentation Layer (apps/)"]
        API[API Controllers]
        Web[Web UI]
    end

    subgraph Application["Application Layer (packages/application)"]
        subgraph UserCtx["User Context"]
            UC[Commands]
            UQ[Queries]
            UE[Events]
        end
        subgraph FlagCtx["FeatureFlag Context"]
            FC[Commands]
            FQ[Queries]
            FE[Events]
        end
        subgraph AuthCtx["Auth Context"]
            AC[Commands]
            AQ[Queries]
            AE[Events]
        end
    end

    subgraph Domain["Domain Layer (packages/domain)"]
        subgraph UserAgg["User Aggregate"]
            UEntity[User Entity]
            UVO[Value Objects]
            URepo[Repository IF]
            UEvents[Domain Events]
        end
        subgraph FlagAgg["FeatureFlag Aggregate"]
            FEntity[Entity]
            FVO[Value Objects]
            FRepo[Repository IF]
            FEvents[Domain Events]
        end
        subgraph AuthAgg["Auth Aggregate"]
            AEntity[RefreshToken]
            AVO[Value Objects]
            ARepo[Repository IF]
            AEvents[Domain Events]
        end
    end

    subgraph Infra["Infrastructure"]
        subgraph Kernel["Kernel"]
            Auth[Authorization]
            Enc[Encryption]
            Err[Error]
            FF[FeatureFlags]
        end
        subgraph Database["Database"]
            ORM[TypeORM]
            Repos[Repositories]
            Mig[Migrations]
        end
        subgraph Config["Configuration"]
            Env[Environment]
            TS[TypeScript]
            Test[Testing]
        end
    end

    Presentation --> Application
    Application --> Domain
    Domain --> Infra
```

## Core Design Principles

### 1. Hexagonal Architecture (Ports & Adapters)

The system is designed around the concept of ports (interfaces) and adapters (implementations):

- **Ports**: Repository interfaces, event bus interfaces, service contracts
- **Adapters**: Database implementations, message queue implementations, external service integrations

This allows the core business logic to remain independent of infrastructure concerns.

### 2. CQRS (Command Query Responsibility Segregation)

The application layer strictly separates:

- **Commands**: State-changing operations (CreateUser, UpdateUser, DeleteUser)
- **Queries**: Read-only operations (GetUserById, ListUsers)
- **Events**: Notifications of state changes (UserCreated, UserUpdated)

Benefits:
- Independent scaling of read and write workloads
- Optimized query models for different use cases
- Clear audit trails through event sourcing

### 3. Domain-Driven Design (DDD)

#### Bounded Contexts

The system is organized into bounded contexts, each with its own:
- Aggregate roots
- Entities and value objects
- Repository interfaces
- Domain events
- Domain services

Current bounded contexts:
- **User**: User management and lifecycle
- **FeatureFlag**: Feature toggle management with A/B testing
- **Auth**: Authentication, refresh token management, and SSO integration

#### Aggregate Pattern

Each aggregate root:
- Encapsulates domain logic and invariants
- Produces domain events for state changes
- Is the only entry point for modifications
- Maintains consistency within its boundary

### 4. Clean Architecture Layers

```mermaid
graph TB
    External["External World<br/>(HTTP, CLI, Message Queues, Databases)"]

    subgraph Layers["Clean Architecture Layers"]
        Infrastructure["Infrastructure Layer<br/>(Adapters: Controllers, Repositories, Gateways)"]
        Application["Application Layer<br/>(Use Cases: Commands, Queries, Event Handlers)"]
        Domain["Domain Layer<br/>(Entities, Value Objects, Domain Services, Events)"]
    end

    External --> Infrastructure
    Infrastructure --> Application
    Application --> Domain

    style Domain fill:#e1f5fe
    style Application fill:#fff3e0
    style Infrastructure fill:#f3e5f5
    style External fill:#fce4ec
```

**Dependency Rule**: Dependencies only point inward. The domain layer has no dependencies on outer layers.

## Package Dependencies

```mermaid
graph LR
    subgraph Core["Core Packages"]
        app["@foundry/application"]
        domain["@foundry/domain"]
        error["@foundry/error"]
    end

    subgraph Infrastructure["Infrastructure"]
        db["@foundry/database"]
        env["@foundry/enviroment"]
    end

    subgraph Kernel["Kernel Packages"]
        auth["@foundry/authorization"]
        enc["@foundry/encryption"]
        ff["@foundry/feature-flags"]
    end

    app --> domain
    app --> error
    domain --> error

    db --> domain
    db --> env
    db --> error

    auth --> error
    enc --> error

    ff --> domain
    ff --> error
```

## Data Flow Example

### Creating a User

```mermaid
sequenceDiagram
    participant Client
    participant Controller as API Controller
    participant Command as CreateUserCommand
    participant Domain as User.create()
    participant Repo as UserRepository
    participant EventBus

    Client->>Controller: HTTP Request
    Controller->>Controller: Create Context<br/>(userId, permissions, correlationId)
    Controller->>Command: Instantiate with dependencies

    activate Command
    Command->>Command: Input validation (Zod schema)
    Command->>Domain: Create entity
    Domain-->>Command: User instance
    Command->>Repo: create(user)
    Repo-->>Command: userId
    Command->>EventBus: Publish domain events
    Command-->>Controller: Response DTO
    deactivate Command

    Controller-->>Client: HTTP Response

    EventBus--)EventBus: UserCreatedEvent handlers
    EventBus--)EventBus: Notification services
    EventBus--)EventBus: External integrations
```

## Cross-Cutting Concerns

### Authorization
Implemented via the `@foundry/authorization` kernel package:
- RBAC (Role-Based Access Control)
- ABAC (Attribute-Based Access Control)
- Multi-tenant support
- Field-level permissions

### Encryption
Implemented via the `@foundry/encryption` kernel package:
- Multiple encryption algorithms (AES-256-GCM, ChaCha20)
- Key management and rotation
- Searchable encryption
- Compliance audit trails (GDPR, LGPD, CCPA)

### Feature Flags
Implemented via the `@foundry/feature-flags` kernel package:
- A/B testing with variants
- User segmentation
- Percentage rollouts
- Time-based scheduling

### Error Handling
Standardized via the `@foundry/error` kernel package:
- Structured error types
- Error codes and metadata
- Package-level error context

## Monorepo Structure

```
foundry/
├── apps/                    # Deployable applications
│   └── lambdas/             # AWS Lambda APIs
│       ├── auth/            # Authentication API
│       ├── user/            # User management API
│       └── feature-flag/    # Feature flag API
├── packages/                # Core business packages
│   ├── application/         # Use cases (CQRS)
│   └── domain/              # Domain model (DDD)
├── kernel/                  # Shared infrastructure
│   ├── authorization/       # Access control
│   ├── encryption/          # Data protection
│   ├── error/               # Error handling
│   ├── feature-flags/       # Feature management
│   ├── logger/              # Structured logging
│   └── testing/             # Test utilities and in-memory repositories
├── infra/                   # Infrastructure adapters
│   └── database/            # PostgreSQL + TypeORM
├── config/                  # Shared configurations
│   ├── enviroment/          # Environment management
│   ├── typescript-config/   # TypeScript settings
│   └── vitest-config/       # Testing configuration
├── tools/                   # Development tools
└── scripts/                 # Build and deployment scripts
```

## Build System

The monorepo uses:
- **Turbo**: Task orchestration and caching
- **Yarn 4 (Berry)**: Package management with workspaces
- **tsdown**: Fast TypeScript bundling
- **Biome**: Linting and formatting
- **Vitest**: Testing framework

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Monorepo | Shared code, atomic changes, consistent tooling |
| TypeScript | Type safety, better IDE support, refactoring confidence |
| CQRS | Separation of concerns, scalable read/write paths |
| DDD | Business logic encapsulation, ubiquitous language |
| Hexagonal | Infrastructure independence, testability |
| Event-Driven | Loose coupling, eventual consistency, audit trails |
| Zod | Runtime validation, TypeScript integration |
