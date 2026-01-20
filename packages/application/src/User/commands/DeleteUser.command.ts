/**
 * @fileoverview Delete User Command Handler
 */

import type { IUserRepository } from '@foundry/domain'
import type { Context, IEventBus } from '@/shared'
import { ApplicationError } from '@/shared'
import type { DeleteUserInput, DeleteUserResponse } from '../dto'
import { DeleteUserSchema } from '../dto'

export class DeleteUserCommand {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly eventBus?: IEventBus,
	) {}

	async execute(input: DeleteUserInput, ctx: Context): Promise<DeleteUserResponse> {
		const { userId } = DeleteUserSchema.parse(input)

		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw ApplicationError.notFound('User', userId)
		}

		if (user.isDeleted) {
			throw ApplicationError.conflict('User is already deleted')
		}

		const deleted = user.delete()
		await this.userRepository.update(deleted)

		if (this.eventBus) {
			await this.eventBus.publish({
				eventType: 'UserDeleted',
				aggregateType: 'User',
				aggregateId: userId,
				payload: { userId, deletedAt: deleted.deletedAt?.toISOString() },
				correlationId: ctx.correlationId,
				occurredAt: new Date(),
			})
		}

		return { userId, deleted: true }
	}
}
