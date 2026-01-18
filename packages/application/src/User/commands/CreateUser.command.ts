/**
 * @fileoverview Create User Command Handler
 */

import type { IUserRepository, User } from '@foundry/domain'
import type { Context, IEventBus } from '@/shared'
import type { CreateUserInput, CreateUserResponse } from '@/User'
import { CreateUserSchema } from '@/User'

export class CreateUserCommand {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: CreateUserInput, ctx: Context): Promise<CreateUserResponse> {
		const validated = CreateUserSchema.parse(input)

		const { User } = await import('@foundry/domain')
		const user = User.create({
			fullName: validated.fullName,
			locale: validated.locale,
		})

		const userId = await this.userRepository.create(user)

		await this.publishEvents(user, ctx)

		return { userId }
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
