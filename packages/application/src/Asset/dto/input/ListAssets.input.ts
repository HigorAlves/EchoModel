/**
 * @fileoverview List Assets Input DTO
 */

import { AssetCategory, AssetStatus } from '@foundry/domain'
import { z } from 'zod'

export const ListAssetsSchema = z.object({
	storeId: z.string().uuid(),
	category: z.nativeEnum(AssetCategory).optional(),
	status: z.nativeEnum(AssetStatus).optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
})

export type ListAssetsInput = z.infer<typeof ListAssetsSchema>
