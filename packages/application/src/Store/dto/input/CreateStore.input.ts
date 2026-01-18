/**
 * @fileoverview Create Store Input DTO
 */

import { z } from 'zod'
import { AspectRatio } from '@foundry/domain'

export const CreateStoreSchema = z.object({
	name: z.string().min(2).max(100),
	description: z.string().max(1000).optional(),
	defaultStyle: z.string().max(500).optional(),
	settings: z
		.object({
			defaultAspectRatio: z.nativeEnum(AspectRatio).optional(),
			defaultImageCount: z.number().min(1).max(10).optional(),
			watermarkEnabled: z.boolean().optional(),
		})
		.optional(),
})

export type CreateStoreInput = z.infer<typeof CreateStoreSchema>
