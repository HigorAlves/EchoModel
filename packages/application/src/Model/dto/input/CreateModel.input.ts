/**
 * @fileoverview Create Model Input DTO
 */

import { z } from 'zod'
import { AgeRange, BodyType, Ethnicity, Gender } from '@foundry/domain'

export const CreateModelSchema = z
	.object({
		storeId: z.string().uuid(),
		name: z.string().min(2).max(50),
		description: z.string().max(500).optional(),
		gender: z.nativeEnum(Gender),
		ageRange: z.nativeEnum(AgeRange),
		ethnicity: z.nativeEnum(Ethnicity),
		bodyType: z.nativeEnum(BodyType),
		prompt: z.string().min(10).max(2000).optional(),
		referenceImageIds: z.array(z.string().uuid()).max(10).optional(),
	})
	.refine((data) => data.prompt || (data.referenceImageIds && data.referenceImageIds.length > 0), {
		message: 'Either prompt or referenceImageIds must be provided',
	})

export type CreateModelInput = z.infer<typeof CreateModelSchema>
