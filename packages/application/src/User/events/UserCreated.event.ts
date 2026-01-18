/**
 * @fileoverview User Created Event Handler
 */

import { createLogger } from '@foundry/logger'

import type { IEventHandler, IntegrationEvent } from '@/shared'

const logger = createLogger('UserCreatedEvent')

export class UserCreatedEvent implements IEventHandler {
	async handle(event: IntegrationEvent): Promise<void> {
		// Handle user created event
		// e.g., send welcome email, create default preferences, etc.
		logger.info({ aggregateId: event.aggregateId }, 'User created')
	}
}
