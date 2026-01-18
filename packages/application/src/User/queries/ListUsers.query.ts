/**
 * @fileoverview List Users Query Handler
 */

import type { IUserRepository, UserQueryFilters, UserStatus } from '@foundry/domain'
import type { PaginatedResult } from '@/shared'
import type { ListUsersInput, UserOutput } from '@/User'
import { ListUsersSchema } from '@/User'
import { toUserResponseList } from '../mappers'

export class ListUsersQuery {
	constructor(private readonly userRepository: IUserRepository) {}

	async execute(input: ListUsersInput): Promise<PaginatedResult<UserOutput>> {
		const { page, limit, sortBy, sortOrder, status, search } = ListUsersSchema.parse(input)
		const offset = (page - 1) * limit

		const filters: UserQueryFilters = {
			limit,
			offset,
			sortBy: sortBy ?? 'createdAt',
			sortOrder: sortOrder ?? 'desc',
			status: status as UserStatus | undefined,
			fullName: search,
		}

		const [users, total] = await Promise.all([
			this.userRepository.findMany(filters),
			this.userRepository.count(filters),
		])

		return {
			items: toUserResponseList(users),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNextPage: page * limit < total,
			hasPreviousPage: page > 1,
		}
	}
}
