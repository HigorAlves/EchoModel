# Authorization Package (@foundry/authorization)

Enterprise-grade authorization system implementing RBAC (Role-Based Access Control) and ABAC (Attribute-Based Access Control) with multi-tenancy support.

## Overview

| Property | Value |
|----------|-------|
| Package | `@foundry/authorization` |
| Location | `kernel/authorization` |
| Purpose | Access control (RBAC + ABAC) |
| Dependencies | `@foundry/error`, `zod` |

## Core Concepts

### Authorization Model

The system combines:
- **RBAC**: Users have roles, roles have permissions
- **ABAC**: Permissions can have conditions based on attributes
- **Multi-tenancy**: Tenant-specific roles and permission overrides
- **Field-level**: Control access to specific object fields

### System Roles

```typescript
// Built-in role hierarchy (highest to lowest)
Role.SUPER_ADMIN  // Level 100 - Full system access
Role.ADMIN        // Level 80 - Administrative access
Role.MANAGER      // Level 60 - Management access
Role.USER         // Level 40 - Standard user access
Role.GUEST        // Level 0 - Minimal access
```

### Actions

```typescript
// CRUD actions
Action.CREATE
Action.READ
Action.UPDATE
Action.DELETE

// Extended actions
Action.MANAGE     // Implies all CRUD actions
Action.LIST       // View collections
Action.EXPORT     // Export data
Action.IMPORT     // Import data
Action.ARCHIVE    // Archive records
Action.RESTORE    // Restore archived records
Action.PUBLISH    // Publish content
Action.APPROVE    // Approve requests
Action.REJECT     // Reject requests
```

## Getting Started

### Basic Usage

```typescript
import { createAuthorizationService } from '@foundry/authorization'

// Create service
const authService = createAuthorizationService({
  cacheEnabled: true,
  cacheTTL: 300000  // 5 minutes
})

// Get ability for user
const ability = await authService.getAbility({
  userId: 'user-123',
  roles: ['manager'],
  tenantId: 'tenant-456'
})

// Check permissions
const canCreate = ability.can('create', 'User')
const canReadEmail = ability.can('read', 'User', 'email')

// Authorize (throws if denied)
await authService.authorize(ability, 'delete', 'User')
```

### Tenant-Specific Abilities

```typescript
// Get tenant-scoped ability
const tenantAbility = await authService.getTenantAbility({
  userId: 'user-123',
  roles: ['admin'],
  tenantId: 'tenant-456'
})

// Tenant overrides apply automatically
```

## Ability Builder

### Defining Permissions

```typescript
import { AbilityBuilder } from '@foundry/authorization'

const builder = new AbilityBuilder()

// Simple permission
builder.can('read', 'Post')

// Permission with conditions (ABAC)
builder.can('update', 'Post', {
  authorId: { $ref: 'user.id' }  // Only own posts
})

// Permission with field restrictions
builder.can('read', 'User', undefined, {
  allowedFields: ['id', 'fullName', 'createdAt']
})

// Deny permission
builder.cannot('delete', 'AdminUser')

// Build ability
const ability = builder.build()
```

### Condition Operators

```typescript
// MongoDB-style operators for ABAC

// Equality
{ status: { $eq: 'active' } }
{ status: { $ne: 'deleted' } }

// Comparison
{ age: { $gt: 18 } }
{ age: { $gte: 21 } }
{ age: { $lt: 65 } }
{ age: { $lte: 100 } }

// Array membership
{ role: { $in: ['admin', 'manager'] } }
{ role: { $nin: ['guest'] } }

// String matching
{ email: { $regex: '@company\\.com$' } }

// Existence
{ deletedAt: { $exists: false } }

// Context references
{ ownerId: { $ref: 'user.id' } }
{ tenantId: { $ref: 'user.tenantId' } }

// Array element matching
{ tags: { $elemMatch: { type: 'featured' } } }
```

## Decorators

### Method Authorization

```typescript
import { Authorize, RequireRole, RequirePermission } from '@foundry/authorization'

class UserController {
  @Authorize('read', 'User')
  async getUser(id: string) {
    return this.userService.findById(id)
  }

  @Authorize('update', 'User')
  async updateUser(id: string, data: UpdateUserDTO) {
    return this.userService.update(id, data)
  }

  @RequireRole('admin')
  async deleteUser(id: string) {
    return this.userService.delete(id)
  }

  @RequirePermission('user:manage')
  async manageUsers() {
    // ...
  }
}
```

### Convenience Decorators

```typescript
import { AdminOnly, SuperAdminOnly } from '@foundry/authorization'

class AdminController {
  @AdminOnly()
  async adminDashboard() {
    // Requires admin or higher
  }

  @SuperAdminOnly()
  async systemSettings() {
    // Requires super admin only
  }
}
```

### Field Authorization

```typescript
import { AuthorizeField, PIIField, ConfidentialField, InternalField } from '@foundry/authorization'

class User {
  id: string

  @AuthorizeField('read', 'User', { dataClassification: 'pii' })
  email: string

  @PIIField()  // Shorthand for PII classification
  phoneNumber: string

  @ConfidentialField()
  salary: number

  @InternalField()
  passwordHash: string
}
```

## Role Hierarchy

### Hierarchy Configuration

```typescript
import { RoleHierarchy } from '@foundry/authorization'

const hierarchy = new RoleHierarchy()

// Built-in hierarchy
// SUPER_ADMIN (100) > ADMIN (80) > MANAGER (60) > USER (40) > GUEST (0)

// Add custom role
hierarchy.addRole({
  name: 'team_lead',
  level: 50,  // Between USER and MANAGER
  parent: 'user',
  permissions: ['team:manage', 'report:create']
})

// Check hierarchy
hierarchy.isAboveOrEqual('admin', 'user')  // true
hierarchy.isAboveOrEqual('user', 'admin')  // false

// Get all roles above
hierarchy.getRolesAbove('user')  // ['manager', 'admin', 'super_admin']
```

### Tenant-Specific Roles

```typescript
import { TenantAbilityBuilder } from '@foundry/authorization'

const builder = new TenantAbilityBuilder('tenant-123')

// Add tenant-specific role
builder.addTenantRole({
  name: 'tenant_admin',
  level: 75,  // Custom level for this tenant
  permissions: ['tenant:manage', 'user:manage']
})

// Build tenant ability
const ability = builder.build()
```

## Permission Resolution

### Role Resolver

```typescript
import { RoleResolver } from '@foundry/authorization'

const resolver = new RoleResolver(hierarchy)

// Resolve all permissions for a role (including inherited)
const permissions = await resolver.resolvePermissions('manager')

// Get permission sources for auditing
const sources = await resolver.getPermissionSources('manager', 'user:read')
// [{ role: 'user', permission: 'user:read', inherited: true }]
```

### Field Permission Resolver

```typescript
import { FieldPermissionResolver } from '@foundry/authorization'

const resolver = new FieldPermissionResolver()

// Filter object fields based on ability
const filteredUser = resolver.filterFields(user, ability, 'read', 'User')
// Only returns fields the user can read

// Pick specific allowed fields
const partialUser = resolver.pickFields(user, ability, 'read', 'User', ['id', 'fullName', 'email'])
// Returns only specified fields if allowed
```

## Caching

### Ability Cache

```typescript
import { AbilityCache } from '@foundry/authorization'

const cache = new AbilityCache({
  ttl: 300000,     // 5 minutes
  maxSize: 10000   // Max cached abilities
})

// Cache key is: userId-roles-tenantId
const ability = await cache.getOrCreate(
  'user-123',
  ['admin'],
  'tenant-456',
  async () => buildAbility(...)
)

// Invalidate on permission change
cache.invalidate('user-123')
cache.invalidateTenant('tenant-456')
cache.clear()

// Get cache stats
const stats = cache.getStats()
// { hits: 150, misses: 20, size: 170 }
```

## Audit Trail

### Audit Events

```typescript
import { AuthorizationAuditFactory } from '@foundry/authorization'

const auditFactory = new AuthorizationAuditFactory()

// Create audit event
const event = auditFactory.createAuthorizationCheck({
  userId: 'user-123',
  action: 'delete',
  subject: 'User',
  allowed: false,
  reason: 'Insufficient permissions',
  conditions: { targetUserId: 'user-456' }
})

// Log to your audit system
auditLogger.log(event)
```

### Audit Event Types

- `authorization.check`: Permission check performed
- `authorization.denied`: Access denied
- `authorization.granted`: Access granted
- `role.assigned`: Role assigned to user
- `role.revoked`: Role revoked from user
- `permission.granted`: Permission added to role
- `permission.revoked`: Permission removed from role

## Error Handling

```typescript
import {
  AuthorizationError,
  PermissionError,
  RoleError,
  isAuthorizationError
} from '@foundry/authorization'

try {
  await authService.authorize(ability, 'delete', 'User')
} catch (error) {
  if (isAuthorizationError(error)) {
    // Access denied
    console.log(error.action, error.subject, error.reason)
  }
}
```

## Integration Example

```typescript
import { createAuthorizationService } from '@foundry/authorization'

// Setup
const authService = createAuthorizationService({
  cacheEnabled: true,
  cacheTTL: 300000,
  auditEnabled: true
})

// Middleware for Express/Fastify
async function authMiddleware(req, res, next) {
  const ability = await authService.getAbility({
    userId: req.user.id,
    roles: req.user.roles,
    tenantId: req.headers['x-tenant-id']
  })

  req.ability = ability
  next()
}

// Use in route handler
app.get('/users/:id', authMiddleware, async (req, res) => {
  // Check permission
  if (!req.ability.can('read', 'User')) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const user = await userService.findById(req.params.id)

  // Filter fields based on permissions
  const filteredUser = authService.filterFields(user, req.ability, 'read', 'User')

  res.json(filteredUser)
})
```
