/**
 * @fileoverview Get Generation By ID Input DTO
 */

import { z } from 'zod'

export const GetGenerationByIdSchema = z.object({
	generationId: z.string().uuid(),
})

export type GetGenerationByIdInput = z.infer<typeof GetGenerationByIdSchema>
