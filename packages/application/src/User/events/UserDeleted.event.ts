/**
 * @fileoverview User Deleted Event Handler
 */

import { createLogger } from '@foundry/logger'

import type { IEventHandler, IntegrationEvent } from '@/shared'

const logger = createLogger('UserDeletedEvent')

export class UserDeletedEvent implements IEventHandler {
	async handle(event: IntegrationEvent): Promise<void> {
		// Handle user deleted event
		// e.g., clean up user data, notify services, etc.
		logger.info({ aggregateId: event.aggregateId }, 'User deleted')
	}
}
