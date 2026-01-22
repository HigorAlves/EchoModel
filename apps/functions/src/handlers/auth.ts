/**
 * @fileoverview Firebase Auth Trigger Handlers
 *
 * Handles Firebase Authentication events to auto-create User and Store entities
 * when a new user signs up.
 */

import { Store, User } from '@foundry/domain'
import * as logger from 'firebase-functions/logger'
import { beforeUserCreated } from 'firebase-functions/v2/identity'
import { db } from '../lib/firebase'
import { FirestoreStoreRepository } from '../repositories/store.repository'
import { FirestoreUserRepository } from '../repositories/user.repository'

// Initialize repositories
const userRepository = new FirestoreUserRepository(db)
const storeRepository = new FirestoreStoreRepository(db)

/**
 * Derive a user's full name from Firebase Auth data
 * Falls back to email prefix if no display name is available
 */
function deriveUserName(displayName: string | undefined, email: string | undefined): string {
	if (displayName && displayName.trim().length > 0) {
		return displayName.trim()
	}

	if (email) {
		const emailPrefix = email.split('@')[0]
		if (emailPrefix) {
			// Capitalize first letter and replace common separators with spaces
			const formatted = emailPrefix.replace(/[._-]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
			return formatted
		}
	}

	return 'New User'
}

/**
 * Derive a store name from the user's name
 */
function deriveStoreName(userName: string): string {
	// Use possessive form for the store name
	const name = userName.trim()
	if (name.toLowerCase().endsWith('s')) {
		return `${name}' Store`
	}
	return `${name}'s Store`
}

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

	logger.info('onUserCreated triggered', { uid, email, hasDisplayName: !!displayName })

	try {
		// Idempotency check - verify store doesn't already exist for this user
		const existingStores = await storeRepository.findByOwnerId(uid)
		if (existingStores.length > 0) {
			logger.info('Store already exists for user, skipping creation', {
				uid,
				existingStoreCount: existingStores.length,
			})
			return
		}

		// Derive names from Firebase Auth data
		const userName = deriveUserName(displayName, email)
		const storeName = deriveStoreName(userName)

		logger.info('Creating user and store', { uid, userName, storeName })

		// Create User entity with externalId linked to Firebase Auth UID
		const user = User.create({
			fullName: userName,
			locale: 'en-US',
			externalId: uid,
		})

		// Create Store entity with ownerId set to Firebase Auth UID
		const store = Store.create({
			ownerId: uid,
			name: storeName,
			description: 'My store',
		})

		// Persist both entities
		// Use the Firebase Auth UID as the document ID for the user
		await userRepository.save(uid, user)
		const storeId = await storeRepository.create(store)

		logger.info('User and store created successfully', {
			uid,
			userId: uid,
			storeId,
			userName,
			storeName,
		})
	} catch (error) {
		// Log the error but don't throw - we don't want to block user signup
		logger.error('Failed to create user and store on signup', {
			uid,
			email,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		})

		// Return without throwing to allow signup to continue
		// The user can create their store manually later if needed
	}
})
