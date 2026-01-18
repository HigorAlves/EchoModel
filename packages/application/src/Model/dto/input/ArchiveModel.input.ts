/**
 * @fileoverview Archive Model Input DTO
 */

import { z } from 'zod'

export const ArchiveModelSchema = z.object({
	modelId: z.string().uuid(),
})

export type ArchiveModelInput = z.infer<typeof ArchiveModelSchema>
