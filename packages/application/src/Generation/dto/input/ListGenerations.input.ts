/**
 * @fileoverview List Generations Input DTO
 */

import { GenerationStatus } from '@foundry/domain'
import { z } from 'zod'

export const ListGenerationsSchema = z.object({
	storeId: z.string().uuid(),
	modelId: z.string().uuid().optional(),
	status: z.nativeEnum(GenerationStatus).optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
})

export type ListGenerationsInput = z.infer<typeof ListGenerationsSchema>
