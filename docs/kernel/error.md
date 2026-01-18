# Error Package (@foundry/error)

The error package provides the foundational error handling infrastructure for the entire monorepo.

## Overview

| Property | Value |
|----------|-------|
| Package | `@foundry/error` |
| Location | `kernel/error` |
| Purpose | Structured error handling foundation |
| Dependencies | `zod` |

## Core Classes

### EnterpriseError

The base error class that all domain-specific errors extend.

```typescript
import { EnterpriseError } from '@foundry/error'

class MyCustomError extends EnterpriseError {
  constructor(message: string) {
    super(message, 'my-package', { customField: 'value' })
  }
}
```

**Properties:**
- `message`: Error description
- `package`: Origin package name for tracing
- `meta`: Additional contextual metadata

**Usage in domain packages:**
```typescript
// In @foundry/domain
export class UserDomainError extends EnterpriseError {
  constructor(
    message: string,
    public readonly code: UserErrorCode,
    meta?: Record<string, unknown>
  ) {
    super(message, '@foundry/domain', { code, ...meta })
  }
}
```

### DatabaseError

Specialized error for database operations with PostgreSQL-specific handling.

```typescript
import { DatabaseError } from '@foundry/error'

try {
  await database.query(...)
} catch (error) {
  if (error instanceof DatabaseError) {
    console.log(error.pgCode)      // PostgreSQL error code
    console.log(error.constraint)  // Constraint name
    console.log(error.detail)      // Error details
  }
}
```

**Properties:**
- `pgCode`: PostgreSQL error code (e.g., '23505' for unique violation)
- `constraint`: Name of violated constraint
- `detail`: Detailed error message from PostgreSQL
- `table`: Table name where error occurred

### ValidationError

Integration with Zod validation library.

```typescript
import { ValidationError } from '@foundry/error'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
})

try {
  schema.parse({ email: 'invalid', age: 15 })
} catch (zodError) {
  const validationError = new ValidationError(zodError)
  console.log(validationError.errors)
  // { email: ['Invalid email'], age: ['Number must be >= 18'] }
}
```

**Properties:**
- `errors`: Flattened Zod error structure
- `zodError`: Original Zod error for debugging

## Usage Patterns

### Creating Domain Errors

```typescript
// Define error codes
export const UserErrorCode = {
  NOT_FOUND: 'USER_NOT_FOUND',
  ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_STATUS: 'USER_INVALID_STATUS',
} as const

// Create error class
export class UserDomainError extends EnterpriseError {
  static notFound(id: string): UserDomainError {
    return new UserDomainError(
      `User with id ${id} not found`,
      UserErrorCode.NOT_FOUND,
      { userId: id }
    )
  }

  static alreadyExists(email: string): UserDomainError {
    return new UserDomainError(
      `User with email ${email} already exists`,
      UserErrorCode.ALREADY_EXISTS,
      { email }
    )
  }
}
```

### Error Handling

```typescript
import { EnterpriseError, DatabaseError, ValidationError } from '@foundry/error'

try {
  await createUser(input)
} catch (error) {
  if (error instanceof ValidationError) {
    // Input validation failed
    return { status: 400, errors: error.errors }
  }

  if (error instanceof DatabaseError) {
    // Database operation failed
    if (error.pgCode === '23505') {
      return { status: 409, message: 'Duplicate entry' }
    }
    return { status: 500, message: 'Database error' }
  }

  if (error instanceof EnterpriseError) {
    // Domain-level error
    return { status: 422, message: error.message, meta: error.meta }
  }

  // Unknown error
  throw error
}
```

### Type Guards

```typescript
import { isEnterpriseError, isDatabaseError, isValidationError } from '@foundry/error'

function handleError(error: unknown) {
  if (isValidationError(error)) {
    // TypeScript knows error is ValidationError
    console.log(error.errors)
  } else if (isDatabaseError(error)) {
    console.log(error.pgCode)
  } else if (isEnterpriseError(error)) {
    console.log(error.package, error.meta)
  }
}
```

## PostgreSQL Error Codes

Common PostgreSQL error codes handled by `DatabaseError`:

| Code | Meaning |
|------|---------|
| `23505` | Unique constraint violation |
| `23503` | Foreign key constraint violation |
| `23502` | NOT NULL constraint violation |
| `42P01` | Table does not exist |
| `42703` | Column does not exist |
| `22001` | String data right truncation |

## Best Practices

1. **Always extend EnterpriseError** for domain-specific errors
2. **Include meaningful metadata** for debugging and logging
3. **Use static factory methods** for common error scenarios
4. **Provide error codes** for programmatic error handling
5. **Map database errors** to domain errors at the repository level
