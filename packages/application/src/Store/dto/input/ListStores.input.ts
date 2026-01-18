/**
 * @fileoverview List Stores Input DTO
 */

import { z } from 'zod'

export const ListStoresSchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
	sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
	status: z.string().optional(),
})

export type ListStoresInput = z.infer<typeof ListStoresSchema>
