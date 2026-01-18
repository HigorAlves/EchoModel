/**
 * @fileoverview Update User Command Handler
 */

import type { IUserRepository, User, UserStatus } from '@foundry/domain'
import { ApplicationError } from '../../shared/errors'
import type { Context, IEventBus } from '../../shared/interfaces'
import type { UpdateUseInput, UpdateUserResponse } from '../dto'

export class UpdateUserCommand {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: UpdateUseInput & { userId: string }, ctx: Context): Promise<UpdateUserResponse> {
		const { userId, fullName, locale, status } = input

		if (!fullName && !locale && !status) {
			throw ApplicationError.validation('At least one field must be provided')
		}

		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw ApplicationError.notFound('User', userId)
		}

		let updated: User = user
		if (fullName) updated = updated.updateFullName(fullName)
		if (locale) updated = updated.updateLocale(locale)
		if (status) updated = updated.updateStatus(status as UserStatus)

		await this.userRepository.update(updated)

		if (this.eventBus) {
			await this.publishEvents(updated, ctx)
		}

		return { userId, updated: true }
	}

	private async publishEvents(user: User, ctx: Context): Promise<void> {
		if (!this.eventBus) return

		for (const event of user.domainEvents) {
			await this.eventBus.publish({
				eventType: event.eventType,
				aggregateType: event.aggregateType,
				aggregateId: event.aggregateId,
				payload: event.eventData as Record<string, unknown>,
				correlationId: ctx.correlationId,
				occurredAt: new Date(),
			})
		}
		user.clearDomainEvents()
	}
}
