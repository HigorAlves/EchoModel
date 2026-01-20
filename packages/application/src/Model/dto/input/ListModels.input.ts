/**
 * @fileoverview List Models Input DTO
 */

import { z } from 'zod'
import { CameraFraming, Gender, LightingPreset, ModelStatus, ProductCategory } from '@foundry/domain'

export const ListModelsSchema = z.object({
	storeId: z.string().uuid(),
	status: z.nativeEnum(ModelStatus).optional(),
	gender: z.nativeEnum(Gender).optional(),
	// Seedream 4.5 Fashion filters
	lightingPreset: z.nativeEnum(LightingPreset).optional(),
	cameraFraming: z.nativeEnum(CameraFraming).optional(),
	productCategory: z.nativeEnum(ProductCategory).optional(),
	supportsOutfitSwapping: z.boolean().optional(),
	// Pagination and sorting
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
	sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type ListModelsInput = z.infer<typeof ListModelsSchema>
