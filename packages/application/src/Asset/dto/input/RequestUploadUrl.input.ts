/**
 * @fileoverview Request Upload URL Input DTO
 */

import { AssetCategory } from '@foundry/domain'
import { z } from 'zod'

export const RequestUploadUrlSchema = z.object({
	storeId: z.string().uuid(),
	category: z.nativeEnum(AssetCategory),
	filename: z.string().min(1).max(255),
	mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
	sizeBytes: z
		.number()
		.min(1)
		.max(50 * 1024 * 1024), // Max 50MB
	metadata: z
		.object({
			modelId: z.string().uuid().optional(),
			generationId: z.string().uuid().optional(),
		})
		.optional(),
})

export type RequestUploadUrlInput = z.infer<typeof RequestUploadUrlSchema>
