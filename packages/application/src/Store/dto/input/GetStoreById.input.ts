/**
 * @fileoverview Get Store By ID Input DTO
 */

import { z } from 'zod'

export const GetStoreByIdSchema = z.object({
	storeId: z.string().uuid(),
})

export type GetStoreByIdInput = z.infer<typeof GetStoreByIdSchema>
