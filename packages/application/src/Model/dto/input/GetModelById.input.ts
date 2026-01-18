/**
 * @fileoverview Get Model By ID Input DTO
 */

import { z } from 'zod'

export const GetModelByIdSchema = z.object({
	modelId: z.string().uuid(),
})

export type GetModelByIdInput = z.infer<typeof GetModelByIdSchema>
