/**
 * @fileoverview Update Store Settings Input DTO
 */

import { z } from 'zod'
import { AspectRatio } from '@foundry/domain'

export const UpdateStoreSettingsSchema = z
	.object({
		defaultAspectRatio: z.nativeEnum(AspectRatio).optional(),
		defaultImageCount: z.number().min(1).max(10).optional(),
		watermarkEnabled: z.boolean().optional(),
	})
	.refine((data) => Object.values(data).some((v) => v !== undefined), {
		message: 'At least one setting must be provided',
	})

export type UpdateStoreSettingsInput = z.infer<typeof UpdateStoreSettingsSchema>
