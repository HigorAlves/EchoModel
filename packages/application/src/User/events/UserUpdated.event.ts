/**
 * @fileoverview User Updated Event Handler
 */

import { createLogger } from '@foundry/logger'

import type { IEventHandler, IntegrationEvent } from '@/shared'

const logger = createLogger('UserUpdatedEvent')

export class UserUpdatedEvent implements IEventHandler {
	async handle(event: IntegrationEvent): Promise<void> {
		// Handle user updated event
		logger.info({ aggregateId: event.aggregateId }, 'User updated')
	}
}
