/**
 * @fileoverview Model Created Event Handler
 */

import type { IEventHandler, IntegrationEvent } from '@/shared'

export class ModelCreatedEventHandler implements IEventHandler {
	async handle(_event: IntegrationEvent): Promise<void> {
		// Future: Notify user, start calibration pipeline, etc.
	}
}
