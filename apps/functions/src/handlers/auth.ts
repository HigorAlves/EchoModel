/**
 * @fileoverview Firebase Auth Trigger Handlers
 *
 * Handles Firebase Authentication events to auto-create User and Store entities
 * when a new user signs up.
 */

import { createContext, Store, User } from '@foundry/application'
import * as logger from 'firebase-functions/logger'
import { beforeUserCreated } from 'firebase-functions/v2/identity'
import { db } from '../lib/firebase'
import { FirestoreStoreRepository } from '../repositories/store.repository'
import { FirestoreUserRepository } from '../repositories/user.repository'
import { deriveStoreName, deriveUserName } from '../utils/user'

// Initialize repositories
const userRepository = new FirestoreUserRepository(db)
const storeRepository = new FirestoreStoreRepository(db)

// Initialize application layer commands
const createUserCommand = new User.CreateUserCommand(userRepository)
const createStoreCommand = new Store.CreateStoreCommand(storeRepository)

// Initialize application layer queries
const listStoresQuery = new Store.ListStoresQuery(storeRepository)

/**
 * Firebase Auth trigger - called before a new user is created
 *
 * Creates a User entity and a default Store in Firestore when a new user signs up.
 * This function is idempotent - it checks for existing stores before creating new ones.
 *
 * Error handling strategy: Log errors but don't throw to avoid blocking user signup.
 */
export const onUserCreated = beforeUserCreated({ maxInstances: 10, timeoutSeconds: 30 }, async (event) => {
	const userData = event.data
	if (!userData) {
		logger.warn('onUserCreated triggered with no user data')
		return
	}

	const { uid, email, displayName } = userData
	const correlationId = `auth-signup-${uid}-${Date.now()}`

	logger.info('onUserCreated triggered', { uid, email, hasDisplayName: !!displayName, correlationId })

	try {
		// Idempotency check - verify store doesn't already exist for this user
		const existingStores = await listStoresQuery.execute({ page: 1, limit: 1 }, uid)
		if (existingStores.total > 0) {
			logger.info('Store already exists for user, skipping creation', {
				uid,
				existingStoreCount: existingStores.total,
				correlationId,
			})
			return
		}

		// Derive names from Firebase Auth data
		const userName = deriveUserName(displayName, email)
		const storeName = deriveStoreName(userName)

		logger.info('Creating user and store', { uid, userName, storeName, correlationId })

		// Create context for application layer commands
		const ctx = createContext({
			correlationId,
			userId: uid,
		})

		// Create User via application layer command
		const userResult = await createUserCommand.execute(
			{
				fullName: userName,
				locale: 'en-US',
				externalId: uid,
				userId: uid, // Use Firebase Auth UID as document ID
			},
			ctx,
		)

		// Create Store via application layer command
		const storeResult = await createStoreCommand.execute(
			{
				name: storeName,
				description: 'My store',
			},
			ctx,
		)

		logger.info('User and store created successfully', {
			uid,
			userId: userResult.userId,
			storeId: storeResult.storeId,
			userName,
			storeName,
			correlationId,
		})
	} catch (error) {
		// Log the error but don't throw - we don't want to block user signup
		logger.error('Failed to create user and store on signup', {
			uid,
			email,
			correlationId,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		})

		// Return without throwing to allow signup to continue
		// The user can create their store manually later if needed
	}
})
