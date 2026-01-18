/**
 * @fileoverview List Models Input DTO
 */

import { z } from 'zod'
import { Gender, ModelStatus } from '@foundry/domain'

export const ListModelsSchema = z.object({
	storeId: z.string().uuid(),
	status: z.nativeEnum(ModelStatus).optional(),
	gender: z.nativeEnum(Gender).optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
	sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type ListModelsInput = z.infer<typeof ListModelsSchema>
