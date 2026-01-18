/**
 * @fileoverview User Mapper
 */

import type { User } from '@foundry/domain'
import type { UserOutput } from '@/User'

export function toUserResponse(user: User): UserOutput {
	return {
		id: user.id.value,
		fullName: user.fullName.value,
		locale: user.locale.value,
		status: user.status,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	}
}

export function toUserResponseList(users: User[]): UserOutput[] {
	return users.map((user) => toUserResponse(user))
}
