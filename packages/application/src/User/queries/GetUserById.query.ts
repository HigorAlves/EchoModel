/**
 * @fileoverview Get User By ID Query Handler
 */

import type { IUserRepository } from '@foundry/domain'
import type { GetUserByIdInput, UserOutput } from '../dto'
import { GetUserByIdSchema } from '../dto'
import { toUserResponse } from '../mappers'

export class GetUserByIdQuery {
	constructor(private readonly userRepository: IUserRepository) {}

	async execute(input: GetUserByIdInput): Promise<UserOutput | null> {
		const { userId } = GetUserByIdSchema.parse(input)

		const user = await this.userRepository.findById(userId)
		if (!user) return null

		return toUserResponse(user)
	}
}
