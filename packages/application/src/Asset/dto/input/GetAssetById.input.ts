/**
 * @fileoverview Get Asset By ID Input DTO
 */

import { z } from 'zod'

export const GetAssetByIdSchema = z.object({
	assetId: z.string().uuid(),
})

export type GetAssetByIdInput = z.infer<typeof GetAssetByIdSchema>
