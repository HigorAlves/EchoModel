/**
 * @fileoverview Update Model Input DTO
 */

import { z } from 'zod'

export const UpdateModelSchema = z
	.object({
		name: z.string().min(2).max(50).optional(),
		description: z.string().max(500).nullable().optional(),
	})
	.refine((data) => Object.values(data).some((v) => v !== undefined), {
		message: 'At least one field must be provided',
	})

export type UpdateModelInput = z.infer<typeof UpdateModelSchema>
