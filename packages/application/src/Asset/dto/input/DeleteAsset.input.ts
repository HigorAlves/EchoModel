/**
 * @fileoverview Delete Asset Input DTO
 */

import { z } from 'zod'

export const DeleteAssetSchema = z.object({
	assetId: z.string().uuid(),
})

export type DeleteAssetInput = z.infer<typeof DeleteAssetSchema>
