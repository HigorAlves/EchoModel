/**
 * @fileoverview Update Store Input DTO
 */

import { z } from 'zod'

export const UpdateStoreSchema = z
	.object({
		name: z.string().min(2).max(100).optional(),
		description: z.string().max(1000).nullable().optional(),
		defaultStyle: z.string().max(500).nullable().optional(),
	})
	.refine((data) => Object.values(data).some((v) => v !== undefined), {
		message: 'At least one field must be provided',
	})

export type UpdateStoreInput = z.infer<typeof UpdateStoreSchema>
