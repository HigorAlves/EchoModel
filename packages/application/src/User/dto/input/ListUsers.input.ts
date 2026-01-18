/**
 * @fileoverview List Users Input DTO
 */

import { z } from 'zod'

export const ListUsersSchema = z.object({
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(20),
	sortBy: z.enum(['fullName', 'createdAt', 'updatedAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
	status: z.string().optional(),
	search: z.string().optional(),
})

export type ListUsersInput = z.infer<typeof ListUsersSchema>
