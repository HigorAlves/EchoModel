/**
 * @fileoverview @foundry/application
 *
 * Application layer implementing CQRS pattern with bounded contexts.
 *
 * @example
 * ```typescript
 * import { User, createContext } from '@foundry/application'
 *
 * // Create a user
 * const createUser = new User.CreateUserCommand(userRepository, eventBus)
 * const result = await createUser.execute(
 *   { fullName: 'John Doe', locale: 'en-US' },
 *   createContext({ correlationId: 'abc-123' })
 * )
 *
 * // Query users
 * const listUsers = new User.ListUsersQuery(userRepository)
 * const users = await listUsers.execute({ page: 1, limit: 10 })
 * ```
 */

export * as Model from './Model'
export * as Store from './Store'
export * from './shared'
export * as User from './User'
