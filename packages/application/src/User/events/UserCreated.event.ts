/**
 * @fileoverview User Created Event Handler
 */

import type { IEventHandler, IntegrationEvent } from '@/shared'

export class UserCreatedEvent implements IEventHandler {
	async handle(_event: IntegrationEvent): Promise<void> {
		// Future: Send welcome email, create default preferences, etc.
	}
}
