/**
 * @fileoverview Create Generation Input DTO
 */

import { z } from 'zod'
import { AspectRatio } from '@foundry/domain'

export const CreateGenerationSchema = z.object({
	idempotencyKey: z.string().uuid(),
	storeId: z.string().uuid(),
	modelId: z.string().uuid(),
	garmentAssetId: z.string().uuid(),
	scenePrompt: z.string().min(5).max(1000),
	aspectRatios: z.array(z.nativeEnum(AspectRatio)).min(1).max(4),
	imageCount: z.number().min(1).max(4).default(4),
})

export type CreateGenerationInput = z.infer<typeof CreateGenerationSchema>
