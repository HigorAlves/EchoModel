/**
 * @fileoverview Confirm Upload Input DTO
 */

import { z } from 'zod'

export const ConfirmUploadSchema = z.object({
	assetId: z.string().uuid(),
})

export type ConfirmUploadInput = z.infer<typeof ConfirmUploadSchema>
